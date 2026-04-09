import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

actor Main {
  // Access control state kept for upgrade compatibility with previous stable state.
  // The authorization mixin is no longer wired — the state is preserved so existing
  // role assignments survive canister upgrades.
  type UserRole = { #admin; #user; #guest };
  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };
  // ── Preserved for stable upgrade compatibility ─────────────────────────────
  let accessControlState : AccessControlState = {
    var adminAssigned = false;
    userRoles = Map.empty<Principal, UserRole>();
  };

  // ── IC management canister reference (HTTP outcalls) ───────────────────────
  let IC = actor "aaaaa-aa" : actor {
    http_request : ({
      url : Text;
      max_response_bytes : ?Nat64;
      method : { #get; #head; #post };
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      transform : ?{
        function : shared query ({ response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
        context : Blob;
      };
      is_replicated : ?Bool;
    }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
  };

  // ── Student / auth types ───────────────────────────────────────────────────
  public type StudentProfile = {
    id : Text;
    username : Text;
    name : Text;
    passwordHash : Text;
  };

  public type Subject = {
    id : Text;
    name : Text;
    description : Text;
    teacherPrincipal : Text;
  };

  public type Assignment = {
    id : Text;
    subjectId : Text;
    title : Text;
    description : Text;
    dueDate : Text;
  };

  public type Grade = {
    id : Text;
    studentId : Text;
    assignmentId : Text;
    score : Nat;
    feedback : Text;
  };

  // ── Voice types ────────────────────────────────────────────────────────────
  public type AudioChunk = {
    sessionId : Text;
    senderUsername : Text;
    timestamp : Int;
    data : [Nat8];
  };

  // Internal mutable session — not exposed directly via public API
  type VoiceSessionInternal = {
    id : Text;
    hostUsername : Text;
    var participants : [Text];
    var chunks : [AudioChunk];
    var isActive : Bool;
  };

  // Public (shared) view of a VoiceSession — no mutable fields
  public type VoiceSession = {
    id : Text;
    hostUsername : Text;
    participants : [Text];
    isActive : Bool;
  };

  // ── Stable state ───────────────────────────────────────────────────────────
  stable var students : [(Text, StudentProfile)] = [];
  var subjects : [(Text, Subject)] = [];
  var assignments : [(Text, Assignment)] = [];
  var grades : [(Text, Grade)] = [];
  var nextId : Nat = 1;
  stable var verificationCodes : [(Text, Text)] = [];

  // ── Teacher profile state ──────────────────────────────────────────────────
  // Maps teacher principal (as Text) → their WordPress site URL.
  // An empty string means not set.
  let teacherWpUrls = Map.empty<Text, Text>();

  // Voice sessions — ephemeral (reset on upgrade), stored in memory only
  let voiceSessions = List.empty<VoiceSessionInternal>();

  // ── Helpers ────────────────────────────────────────────────────────────────
  func genId() : Text {
    let id = nextId;
    nextId += 1;
    "id-" # debug_show(id);
  };

  // Case-insensitive username lookup — normalises both sides to lowercase
  func findStudentByUsername(username : Text) : ?StudentProfile {
    let lower = username.toLower();
    for ((_, s) in students.vals()) {
      if (s.username.toLower() == lower) return ?s;
    };
    null;
  };

  // Prune audio chunks: keep at most 100 and drop those older than 10 seconds
  func pruneChunks(chunks : [AudioChunk]) : [AudioChunk] {
    let cutoff : Int = Time.now() - 10_000_000_000; // 10 seconds in nanoseconds
    let fresh = chunks.filter(func(c : AudioChunk) : Bool { c.timestamp >= cutoff });
    if (fresh.size() > 100) {
      let start : Int = fresh.size() - 100;
      fresh.sliceToArray(start, fresh.size())
    } else {
      fresh
    }
  };

  func sessionToView(s : VoiceSessionInternal) : VoiceSession {
    { id = s.id; hostUsername = s.hostUsername; participants = s.participants; isActive = s.isActive }
  };

  // Remove sessions by id from voiceSessions list (in-place via clear+addAll)
  func removeSession(sessionId : Text) {
    let kept = voiceSessions.filter(func(s : VoiceSessionInternal) : Bool { s.id != sessionId });
    voiceSessions.clear();
    voiceSessions.addAll(kept.values());
  };

  // ── Student CRUD ───────────────────────────────────────────────────────────

  // Upsert student record and verification code in one call.
  // Called on every student login so data is always fresh and
  // the parent can find the student by username from any device.
  public func syncStudentForParentLink(username : Text, name : Text, code : Text) : async () {
    let lower = username.toLower();
    var found = false;
    var newStudents : [(Text, StudentProfile)] = [];
    for ((sid, s) in students.vals()) {
      if (s.username.toLower() == lower) {
        found := true;
        let updated : StudentProfile = { id = s.id; username = lower; name = name; passwordHash = s.passwordHash };
        newStudents := newStudents.concat([(sid, updated)]);
      } else {
        newStudents := newStudents.concat([(sid, s)]);
      };
    };
    if (not found) {
      let newId = genId();
      let profile : StudentProfile = { id = newId; username = lower; name = name; passwordHash = "" };
      newStudents := newStudents.concat([(newId, profile)]);
    };
    students := newStudents;

    var newCodes : [(Text, Text)] = [];
    for ((u, c) in verificationCodes.vals()) {
      if (u.toLower() != lower) {
        newCodes := newCodes.concat([(u, c)]);
      };
    };
    newCodes := newCodes.concat([(lower, code)]);
    verificationCodes := newCodes;
  };

  public func registerStudent(username : Text, name : Text, passwordHash : Text) : async { #ok : Text; #err : Text } {
    let lower = username.toLower();
    switch (findStudentByUsername(lower)) {
      case (?_) { return #err("Username already taken") };
      case (null) {};
    };
    let id = genId();
    let profile : StudentProfile = { id; username = lower; name; passwordHash };
    students := students.concat([(id, profile)]);
    #ok(id);
  };

  public query func loginStudent(username : Text, passwordHash : Text) : async { #ok : StudentProfile; #err : Text } {
    let lower = username.toLower();
    switch (findStudentByUsername(lower)) {
      case (null) { #err("Student not found") };
      case (?s) {
        if (s.passwordHash == passwordHash) #ok(s)
        else #err("Invalid password");
      };
    };
  };

  public query func getStudentById(id : Text) : async ?StudentProfile {
    for ((sid, s) in students.vals()) {
      if (sid == id) return ?s;
    };
    null;
  };

  // Returns (username, name) if student exists in backend.
  // A student exists here if they have registered OR logged in at least once.
  public query func getStudentPublicByUsername(username : Text) : async ?(Text, Text) {
    let lower = username.toLower();
    switch (findStudentByUsername(lower)) {
      case (null) null;
      case (?s) ?(s.username, s.name);
    };
  };

  // Returns true if the student exists (registered) but may not have a code yet.
  public query func studentExistsInBackend(username : Text) : async Bool {
    let lower = username.toLower();
    switch (findStudentByUsername(lower)) {
      case (null) false;
      case (?_) true;
    };
  };

  // Returns true only if the student exists AND has a verification code synced.
  public query func studentHasVerificationCode(username : Text) : async Bool {
    let lower = username.toLower();
    for ((u, _) in verificationCodes.vals()) {
      if (u.toLower() == lower) return true;
    };
    false;
  };

  public func setVerificationCode(username : Text, code : Text) : async () {
    let lower = username.toLower();
    var updated : [(Text, Text)] = [];
    for ((u, c) in verificationCodes.vals()) {
      if (u.toLower() != lower) {
        updated := updated.concat([(u, c)]);
      };
    };
    updated := updated.concat([(lower, code)]);
    verificationCodes := updated;
  };

  public query func checkVerificationCode(username : Text, code : Text) : async Bool {
    let lower = username.toLower();
    for ((u, c) in verificationCodes.vals()) {
      if (u.toLower() == lower and c == code) return true;
    };
    false;
  };

  // ── Subject / Assignment / Grade CRUD ──────────────────────────────────────

  public func createSubject(name : Text, description : Text, teacherPrincipal : Text) : async Text {
    let id = genId();
    let sub : Subject = { id; name; description; teacherPrincipal };
    subjects := subjects.concat([(id, sub)]);
    id;
  };

  public query func getAllSubjects() : async [Subject] {
    var arr : [Subject] = [];
    for ((_, s) in subjects.vals()) {
      arr := arr.concat([s]);
    };
    arr;
  };

  public func createAssignment(subjectId : Text, title : Text, description : Text, dueDate : Text) : async Text {
    let id = genId();
    let a : Assignment = { id; subjectId; title; description; dueDate };
    assignments := assignments.concat([(id, a)]);
    id;
  };

  public query func getAllAssignments() : async [Assignment] {
    var arr : [Assignment] = [];
    for ((_, a) in assignments.vals()) {
      arr := arr.concat([a]);
    };
    arr;
  };

  public func addGrade(studentId : Text, assignmentId : Text, score : Nat, feedback : Text) : async Text {
    let id = genId();
    let g : Grade = { id; studentId; assignmentId; score; feedback };
    grades := grades.concat([(id, g)]);
    id;
  };

  public query func getGradesByStudent(studentId : Text) : async [Grade] {
    var arr : [Grade] = [];
    for ((_, g) in grades.vals()) {
      if (g.studentId == studentId) {
        arr := arr.concat([g]);
      };
    };
    arr;
  };

  // ── Voice relay ────────────────────────────────────────────────────────────

  public func createVoiceSession(sessionId : Text, hostUsername : Text) : async () {
    // Remove any stale session with the same id
    removeSession(sessionId);
    let session : VoiceSessionInternal = {
      id = sessionId;
      hostUsername = hostUsername;
      var participants = [hostUsername];
      var chunks = [];
      var isActive = true;
    };
    voiceSessions.add(session);
  };

  public func joinVoiceSession(sessionId : Text, username : Text) : async () {
    switch (voiceSessions.find(func(s : VoiceSessionInternal) : Bool { s.id == sessionId and s.isActive })) {
      case (?s) {
        // Add participant only if not already present
        let already = s.participants.find(func(p : Text) : Bool { p == username });
        if (already == null) {
          s.participants := s.participants.concat([username]);
        };
      };
      case null {};
    };
  };

  public func endVoiceSession(sessionId : Text) : async () {
    switch (voiceSessions.find(func(s : VoiceSessionInternal) : Bool { s.id == sessionId })) {
      case (?s) { s.isActive := false };
      case null {};
    };
  };

  public func sendAudioChunk(sessionId : Text, senderUsername : Text, data : [Nat8]) : async () {
    switch (voiceSessions.find(func(s : VoiceSessionInternal) : Bool { s.id == sessionId and s.isActive })) {
      case (?s) {
        let chunk : AudioChunk = {
          sessionId;
          senderUsername;
          timestamp = Time.now();
          data;
        };
        s.chunks := pruneChunks(s.chunks.concat([chunk]));
      };
      case null {};
    };
  };

  public query func pollAudioChunks(sessionId : Text, sinceTimestamp : Int, excludeUsername : Text) : async [AudioChunk] {
    switch (voiceSessions.find(func(s : VoiceSessionInternal) : Bool { s.id == sessionId })) {
      case (?s) {
        s.chunks.filter(func(c : AudioChunk) : Bool {
          c.timestamp > sinceTimestamp and c.senderUsername != excludeUsername
        })
      };
      case null { [] };
    };
  };

  public query func getVoiceSession(sessionId : Text) : async ?VoiceSession {
    switch (voiceSessions.find(func(s : VoiceSessionInternal) : Bool { s.id == sessionId })) {
      case (?s) ?sessionToView(s);
      case null null;
    };
  };

  public query func listActiveVoiceSessions() : async [VoiceSession] {
    let active = voiceSessions.filter(func(s : VoiceSessionInternal) : Bool { s.isActive });
    active.map<VoiceSessionInternal, VoiceSession>(func(s) { sessionToView(s) }).toArray()
  };

  // ── Teacher WordPress profile ──────────────────────────────────────────────

  // Store or update the calling teacher's WordPress site URL.
  public shared ({ caller }) func setTeacherWpUrl(url : Text) : async () {
    teacherWpUrls.add(caller.toText(), url);
  };

  // Return the calling teacher's saved WordPress URL, or "" if not set.
  public shared query ({ caller }) func getTeacherWpUrl() : async Text {
    switch (teacherWpUrls.get(caller.toText())) {
      case (?u) u;
      case null "";
    };
  };

  // Fetch WordPress REST API content from a public endpoint.
  // baseUrl: e.g. "https://mysite.com"
  // endpoint: e.g. "posts", "pages", "media"
  // Returns the raw JSON body on success, or an error message on failure.
  public func fetchWordPressContent(baseUrl : Text, endpoint : Text) : async { #ok : Text; #err : Text } {
    // Strip trailing slash from baseUrl to avoid double-slash
    let cleanBase = switch (baseUrl.stripEnd(#text "/")) {
      case (?stripped) stripped;
      case null baseUrl;
    };
    let url = cleanBase # "/wp-json/wp/v2/" # endpoint;
    try {
      let response = await IC.http_request({
        url = url;
        max_response_bytes = ?500_000 : ?Nat64;
        method = #get;
        headers = [{ name = "Accept"; value = "application/json" }];
        body = null;
        transform = null;
        is_replicated = ?false;
      });
      if (response.status >= 200 and response.status < 300) {
        switch (response.body.decodeUtf8()) {
          case (?text) #ok(text);
          case null #err("Failed to decode response body as UTF-8");
        }
      } else {
        #err("HTTP " # debug_show(response.status))
      }
    } catch (e) {
      #err("Request failed: HTTP outcall error")
    }
  };
};
