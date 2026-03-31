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
import { upsertParentProfile } from "./utils/parentProfileStorage";
import {
  type LinkedStudent,
  addParentLink,
  getParentLink,
  getParentLinkName,
  getParentLinks,
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
  // Multi-student support
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [activeStudentUsername, setActiveStudentUsername] =
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
    const existingDob = getParentDob(principal);
    if (!existingDob) {
      upsertParentProfile(principal, []);
      setView("parent-dob-check");
      return;
    }
    const multiLinks = getParentLinks(principal);
    if (multiLinks.length > 0) {
      const localStudents = getStudentUsers();
      const enriched: LinkedStudent[] = multiLinks.map((l) => {
        const local = localStudents.find(
          (s) => s.username.toLowerCase() === l.username.toLowerCase(),
        );
        return {
          username: l.username,
          name: local?.name || l.name || l.username,
        };
      });
      setLinkedStudents(enriched);
      setActiveStudentUsername(enriched[0].username);
      upsertParentProfile(
        principal,
        enriched.map((e) => e.username),
      );
      setView("parent-dashboard");
      return;
    }
    const existingLink = getParentLink(principal);
    if (existingLink) {
      const localStudents = getStudentUsers();
      const stu = localStudents.find(
        (s) => s.username.toLowerCase() === existingLink.toLowerCase(),
      );
      const name = stu?.name || getParentLinkName(principal) || existingLink;
      setLinkedStudents([{ username: existingLink, name }]);
      setActiveStudentUsername(existingLink);
      upsertParentProfile(principal, [existingLink]);
      setView("parent-dashboard");
      return;
    }
    upsertParentProfile(principal, []);
    setView("parent-link-student");
  }, []);

  const onParentDobConfirmed = useCallback(() => {
    const p = parentPrincipal;
    const multiLinks = getParentLinks(p);
    if (multiLinks.length > 0) {
      const localStudents = getStudentUsers();
      const enriched: LinkedStudent[] = multiLinks.map((l) => {
        const local = localStudents.find(
          (s) => s.username.toLowerCase() === l.username.toLowerCase(),
        );
        return {
          username: l.username,
          name: local?.name || l.name || l.username,
        };
      });
      setLinkedStudents(enriched);
      setActiveStudentUsername(enriched[0].username);
      upsertParentProfile(
        p,
        enriched.map((e) => e.username),
      );
      setView("parent-dashboard");
      return;
    }
    const existingLink = getParentLink(p);
    if (existingLink) {
      const localStudents = getStudentUsers();
      const stu = localStudents.find(
        (s) => s.username.toLowerCase() === existingLink.toLowerCase(),
      );
      const name = stu?.name || getParentLinkName(p) || existingLink;
      setLinkedStudents([{ username: existingLink, name }]);
      setActiveStudentUsername(existingLink);
      upsertParentProfile(p, [existingLink]);
      setView("parent-dashboard");
      return;
    }
    upsertParentProfile(p, []);
    setView("parent-link-student");
  }, [parentPrincipal]);

  const onStudentLinked = useCallback(
    (studentUsername: string, studentName: string) => {
      addParentLink(parentPrincipal, studentUsername, studentName);
      const updated = getParentLinks(parentPrincipal);
      const enriched: LinkedStudent[] = updated.map((l) => {
        if (l.username.toLowerCase() === studentUsername.toLowerCase())
          return { username: l.username, name: studentName };
        return l;
      });
      setLinkedStudents(enriched);
      setActiveStudentUsername(studentUsername);
      upsertParentProfile(
        parentPrincipal,
        enriched.map((e) => e.username),
      );
      setView("parent-dashboard");
    },
    [parentPrincipal],
  );

  const activeStudent = linkedStudents.find(
    (l) => l.username.toLowerCase() === activeStudentUsername.toLowerCase(),
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
      {view === "parent-dashboard" && linkedStudents.length > 0 && (
        <ParentDashboard
          linkedStudentName={activeStudent?.name ?? ""}
          linkedStudentUsername={activeStudentUsername}
          allLinkedStudents={linkedStudents}
          activeStudentUsername={activeStudentUsername}
          onSwitchStudent={(u) => setActiveStudentUsername(u)}
          onAddStudent={() => setView("parent-link-student")}
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
