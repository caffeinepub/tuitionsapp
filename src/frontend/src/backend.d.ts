import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Grade {
    id: string;
    studentId: string;
    feedback: string;
    score: bigint;
    assignmentId: string;
}
export interface Assignment {
    id: string;
    title: string;
    dueDate: string;
    description: string;
    subjectId: string;
}
export interface VoiceSession {
    id: string;
    participants: Array<string>;
    isActive: boolean;
    hostUsername: string;
}
export interface StudentProfile {
    id: string;
    username: string;
    name: string;
    passwordHash: string;
}
export interface Subject {
    id: string;
    name: string;
    description: string;
    teacherPrincipal: string;
}
export interface AudioChunk {
    data: Uint8Array;
    senderUsername: string;
    timestamp: bigint;
    sessionId: string;
}
export interface backendInterface {
    addGrade(studentId: string, assignmentId: string, score: bigint, feedback: string): Promise<string>;
    checkVerificationCode(username: string, code: string): Promise<boolean>;
    createAssignment(subjectId: string, title: string, description: string, dueDate: string): Promise<string>;
    createSubject(name: string, description: string, teacherPrincipal: string): Promise<string>;
    createVoiceSession(sessionId: string, hostUsername: string): Promise<void>;
    endVoiceSession(sessionId: string): Promise<void>;
    getAllAssignments(): Promise<Array<Assignment>>;
    getAllSubjects(): Promise<Array<Subject>>;
    getGradesByStudent(studentId: string): Promise<Array<Grade>>;
    getStudentById(id: string): Promise<StudentProfile | null>;
    getStudentPublicByUsername(username: string): Promise<[string, string] | null>;
    getVoiceSession(sessionId: string): Promise<VoiceSession | null>;
    joinVoiceSession(sessionId: string, username: string): Promise<void>;
    listActiveVoiceSessions(): Promise<Array<VoiceSession>>;
    loginStudent(username: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: StudentProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    pollAudioChunks(sessionId: string, sinceTimestamp: bigint, excludeUsername: string): Promise<Array<AudioChunk>>;
    registerStudent(username: string, name: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    sendAudioChunk(sessionId: string, senderUsername: string, data: Uint8Array): Promise<void>;
    setVerificationCode(username: string, code: string): Promise<void>;
    studentExistsInBackend(username: string): Promise<boolean>;
    studentHasVerificationCode(username: string): Promise<boolean>;
    syncStudentForParentLink(username: string, name: string, code: string): Promise<void>;
}
