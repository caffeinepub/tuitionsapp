import { Toaster } from "@/components/ui/sonner";
import { useCallback, useState } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";
import { LandingPage } from "./components/LandingPage";
import { ParentDashboard } from "./components/ParentDashboard";
import { ParentDobCheck, getParentDob } from "./components/ParentDobCheck";
import { ParentLinkStudent } from "./components/ParentLinkStudent";
import { ParentLogin } from "./components/ParentLogin";
import { StudentDashboard } from "./components/StudentDashboard";
import { StudentLogin } from "./components/StudentLogin";
import { StudentRegister } from "./components/StudentRegister";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { TeacherLogin } from "./components/TeacherLogin";
import { adminLogout } from "./utils/adminStorage";
import {
  getParentLink,
  getParentLinkName,
  getStudentUsers,
} from "./utils/studentStorage";

export type AppView =
  | "landing"
  | "student-login"
  | "student-register"
  | "teacher-login"
  | "parent-login"
  | "parent-link-student"
  | "student-dashboard"
  | "teacher-dashboard"
  | "parent-dashboard"
  | "admin-login"
  | "admin-dashboard"
  | "parent-dob-check";

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
  const [linkedStudentUsername, setLinkedStudentUsername] =
    useState<string>("");

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
    // Check DOB age gate for parents
    const existingDob = getParentDob(principal);
    if (!existingDob) {
      setView("parent-dob-check");
      return;
    }
    // Check if parent already has a linked student
    const existingLink = getParentLink(principal);
    if (existingLink) {
      // Try to get the name: first from localStorage students, then from cached name
      const students = getStudentUsers();
      const student = students.find(
        (s) => s.username.toLowerCase() === existingLink.toLowerCase(),
      );
      const name =
        student?.name || getParentLinkName(principal) || existingLink;
      setLinkedStudentName(name);
      setLinkedStudentUsername(existingLink);
      setView("parent-dashboard");
      return;
    }
    setView("parent-link-student");
  }, []);

  const onParentDobConfirmed = useCallback(() => {
    const existingLink = getParentLink(parentPrincipal);
    if (existingLink) {
      const students = getStudentUsers();
      const student = students.find(
        (s) => s.username.toLowerCase() === existingLink.toLowerCase(),
      );
      const name =
        student?.name || getParentLinkName(parentPrincipal) || existingLink;
      setLinkedStudentName(name);
      setLinkedStudentUsername(existingLink);
      setView("parent-dashboard");
      return;
    }
    setView("parent-link-student");
  }, [parentPrincipal]);

  const onStudentLinked = useCallback(
    (studentUsername: string, studentName: string) => {
      setLinkedStudentName(studentName);
      setLinkedStudentUsername(studentUsername);
      setView("parent-dashboard");
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
          onRegistered={() => navigate("student-login")}
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
      {view === "parent-dob-check" && (
        <ParentDobCheck
          parentPrincipal={parentPrincipal}
          onConfirmed={onParentDobConfirmed}
          onBack={() => navigate("landing")}
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
          linkedStudentUsername={linkedStudentUsername}
          onLogout={() => navigate("landing")}
        />
      )}
      {view === "admin-login" && (
        <AdminLogin
          onLoggedIn={() => navigate("admin-dashboard")}
          onBack={() => navigate("landing")}
        />
      )}
      {view === "admin-dashboard" && (
        <AdminDashboard
          onLogout={() => {
            adminLogout();
            navigate("landing");
          }}
        />
      )}
    </>
  );
}
