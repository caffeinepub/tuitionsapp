import Array "mo:base/Array";
import Text "mo:base/Text";
import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";

actor Main {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  stable var students : [(Text, StudentProfile)] = [];
  var subjects : [(Text, Subject)] = [];
  var assignments : [(Text, Assignment)] = [];
  var grades : [(Text, Grade)] = [];
  var nextId : Nat = 1;
  stable var verificationCodes : [(Text, Text)] = [];

  func genId() : Text {
    let id = nextId;
    nextId += 1;
    "id-" # debug_show(id);
  };

  // Case-insensitive username lookup — normalises both sides to lowercase
  func findStudentByUsername(username : Text) : ?StudentProfile {
    let lower = Text.toLowercase(username);
    for ((_, s) in students.vals()) {
      if (Text.toLowercase(s.username) == lower) return ?s;
    };
    null;
  };

  // Upsert student record and verification code in one call.
  // Called on every student login so data is always fresh and
  // the parent can find the student by username from any device.
  public func syncStudentForParentLink(username : Text, name : Text, code : Text) : async () {
    let lower = Text.toLowercase(username);
    var found = false;
    var newStudents : [(Text, StudentProfile)] = [];
    for ((sid, s) in students.vals()) {
      if (Text.toLowercase(s.username) == lower) {
        found := true;
        let updated : StudentProfile = { id = s.id; username = lower; name = name; passwordHash = s.passwordHash };
        newStudents := Array.append(newStudents, [(sid, updated)]);
      } else {
        newStudents := Array.append(newStudents, [(sid, s)]);
      };
    };
    if (not found) {
      let newId = genId();
      let profile : StudentProfile = { id = newId; username = lower; name = name; passwordHash = "" };
      newStudents := Array.append(newStudents, [(newId, profile)]);
    };
    students := newStudents;

    var newCodes : [(Text, Text)] = [];
    for ((u, c) in verificationCodes.vals()) {
      if (Text.toLowercase(u) != lower) {
        newCodes := Array.append(newCodes, [(u, c)]);
      };
    };
    newCodes := Array.append(newCodes, [(lower, code)]);
    verificationCodes := newCodes;
  };

  public func registerStudent(username : Text, name : Text, passwordHash : Text) : async { #ok : Text; #err : Text } {
    let lower = Text.toLowercase(username);
    switch (findStudentByUsername(lower)) {
      case (?_) { return #err("Username already taken") };
      case (null) {};
    };
    let id = genId();
    let profile : StudentProfile = { id; username = lower; name; passwordHash };
    students := Array.append(students, [(id, profile)]);
    #ok(id);
  };

  public query func loginStudent(username : Text, passwordHash : Text) : async { #ok : StudentProfile; #err : Text } {
    let lower = Text.toLowercase(username);
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
    let lower = Text.toLowercase(username);
    switch (findStudentByUsername(lower)) {
      case (null) null;
      case (?s) ?(s.username, s.name);
    };
  };

  // Returns true if the student exists (registered) but may not have a code yet.
  public query func studentExistsInBackend(username : Text) : async Bool {
    let lower = Text.toLowercase(username);
    switch (findStudentByUsername(lower)) {
      case (null) false;
      case (?_) true;
    };
  };

  // Returns true only if the student exists AND has a verification code synced.
  public query func studentHasVerificationCode(username : Text) : async Bool {
    let lower = Text.toLowercase(username);
    for ((u, _) in verificationCodes.vals()) {
      if (Text.toLowercase(u) == lower) return true;
    };
    false;
  };

  public func setVerificationCode(username : Text, code : Text) : async () {
    let lower = Text.toLowercase(username);
    var updated : [(Text, Text)] = [];
    for ((u, c) in verificationCodes.vals()) {
      if (Text.toLowercase(u) != lower) {
        updated := Array.append(updated, [(u, c)]);
      };
    };
    updated := Array.append(updated, [(lower, code)]);
    verificationCodes := updated;
  };

  public query func checkVerificationCode(username : Text, code : Text) : async Bool {
    let lower = Text.toLowercase(username);
    for ((u, c) in verificationCodes.vals()) {
      if (Text.toLowercase(u) == lower and c == code) return true;
    };
    false;
  };

  public func createSubject(name : Text, description : Text, teacherPrincipal : Text) : async Text {
    let id = genId();
    let sub : Subject = { id; name; description; teacherPrincipal };
    subjects := Array.append(subjects, [(id, sub)]);
    id;
  };

  public query func getAllSubjects() : async [Subject] {
    var arr : [Subject] = [];
    for ((_, s) in subjects.vals()) {
      arr := Array.append(arr, [s]);
    };
    arr;
  };

  public func createAssignment(subjectId : Text, title : Text, description : Text, dueDate : Text) : async Text {
    let id = genId();
    let a : Assignment = { id; subjectId; title; description; dueDate };
    assignments := Array.append(assignments, [(id, a)]);
    id;
  };

  public query func getAllAssignments() : async [Assignment] {
    var arr : [Assignment] = [];
    for ((_, a) in assignments.vals()) {
      arr := Array.append(arr, [a]);
    };
    arr;
  };

  public func addGrade(studentId : Text, assignmentId : Text, score : Nat, feedback : Text) : async Text {
    let id = genId();
    let g : Grade = { id; studentId; assignmentId; score; feedback };
    grades := Array.append(grades, [(id, g)]);
    id;
  };

  public query func getGradesByStudent(studentId : Text) : async [Grade] {
    var arr : [Grade] = [];
    for ((_, g) in grades.vals()) {
      if (g.studentId == studentId) {
        arr := Array.append(arr, [g]);
      };
    };
    arr;
  };
};
