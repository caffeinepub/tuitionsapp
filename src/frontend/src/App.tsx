import { Toaster } from "@/components/ui/sonner";
import { useCallback, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { ParentDashboard } from "./components/ParentDashboard";
import { ParentLinkStudent } from "./components/ParentLinkStudent";
import { ParentLogin } from "./components/ParentLogin";
import { StudentDashboard } from "./components/StudentDashboard";
import { StudentLogin } from "./components/StudentLogin";
import { StudentRegister } from "./components/StudentRegister";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { TeacherLogin } from "./components/TeacherLogin";
import { getParentLink, getStudentUsers } from "./utils/studentStorage";

export type AppView =
  | "landing"
  | "student-login"
  | "student-register"
  | "teacher-login"
  | "parent-login"
  | "parent-link-student"
  | "student-dashboard"
  | "teacher-dashboard"
  | "parent-dashboard";

export type StudentUser = {
  name: string;
  username: string;
};

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [currentStudent, setCurrentStudent] = useState<StudentUser | null>(
    null,
  );
  const [parentPrincipal, setParentPrincipal] = useState<string>("");
  const [linkedStudentName, setLinkedStudentName] = useState<string>("");

  const navigate = useCallback((v: AppView) => setView(v), []);

  const onStudentLogin = useCallback((student: StudentUser) => {
    setCurrentStudent(student);
    setView("student-dashboard");
  }, []);

  const onStudentLogout = useCallback(() => {
    setCurrentStudent(null);
    setView("landing");
  }, []);

  const onParentLoggedIn = useCallback((principal: string) => {
    setParentPrincipal(principal);
    // Check if parent already has a linked student
    const existingLink = getParentLink(principal);
    if (existingLink) {
      const students = getStudentUsers();
      const student = students.find(
        (s) => s.username.toLowerCase() === existingLink.toLowerCase(),
      );
      if (student) {
        setLinkedStudentName(student.name);
        setView("parent-dashboard");
        return;
      }
    }
    setView("parent-link-student");
  }, []);

  const onStudentLinked = useCallback(
    (studentUsername: string, studentName: string) => {
      setLinkedStudentName(studentName);
      setView("parent-dashboard");
      // suppress unused warning
      void studentUsername;
    },
    [],
  );

  return (
    <>
      <Toaster richColors position="top-right" />

      {view === "landing" && <LandingPage onNavigate={navigate} />}
      {view === "student-login" && (
        <StudentLogin
          onLogin={onStudentLogin}
          onRegister={() => navigate("student-register")}
          onBack={() => navigate("landing")}
        />
      )}
      {view === "student-register" && (
        <StudentRegister
          onRegistered={onStudentLogin}
          onBack={() => navigate("student-login")}
        />
      )}
      {view === "teacher-login" && (
        <TeacherLogin
          onBack={() => navigate("landing")}
          onLoggedIn={() => navigate("teacher-dashboard")}
        />
      )}
      {view === "parent-login" && (
        <ParentLogin
          onBack={() => navigate("landing")}
          onLoggedIn={onParentLoggedIn}
        />
      )}
      {view === "parent-link-student" && (
        <ParentLinkStudent
          parentPrincipal={parentPrincipal}
          onLinked={onStudentLinked}
          onBack={() => navigate("landing")}
        />
      )}
      {view === "student-dashboard" && currentStudent && (
        <StudentDashboard student={currentStudent} onLogout={onStudentLogout} />
      )}
      {view === "teacher-dashboard" && (
        <TeacherDashboard onLogout={() => navigate("landing")} />
      )}
      {view === "parent-dashboard" && (
        <ParentDashboard
          linkedStudentName={linkedStudentName}
          onLogout={() => navigate("landing")}
        />
      )}
    </>
  );
}
