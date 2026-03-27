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

  func findStudentByUsername(username : Text) : ?StudentProfile {
    for ((_, s) in students.vals()) {
      if (s.username == username) return ?s;
    };
    null;
  };

  public func registerStudent(username : Text, name : Text, passwordHash : Text) : async { #ok : Text; #err : Text } {
    switch (findStudentByUsername(username)) {
      case (?_) { return #err("Username already taken") };
      case (null) {};
    };
    let id = genId();
    let profile : StudentProfile = { id; username; name; passwordHash };
    students := students.concat([(id, profile)]);
    #ok(id);
  };

  public query func loginStudent(username : Text, passwordHash : Text) : async { #ok : StudentProfile; #err : Text } {
    switch (findStudentByUsername(username)) {
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

  public query func getStudentPublicByUsername(username : Text) : async ?(Text, Text) {
    switch (findStudentByUsername(username)) {
      case (null) null;
      case (?s) ?(s.username, s.name);
    };
  };

  public func setVerificationCode(username : Text, code : Text) : async () {
    var updated : [(Text, Text)] = [];
    for ((u, c) in verificationCodes.vals()) {
      if (u != username) {
        updated := updated.concat([(u, c)]);
      };
    };
    updated := updated.concat([(username, code)]);
    verificationCodes := updated;
  };

  public query func checkVerificationCode(username : Text, code : Text) : async Bool {
    for ((u, c) in verificationCodes.vals()) {
      if (u == username and c == code) return true;
    };
    false;
  };

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
};
