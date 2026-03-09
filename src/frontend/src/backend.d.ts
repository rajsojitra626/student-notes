import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Note {
    id: string;
    title: string;
    subject: string;
    owner: Principal;
    file?: ExternalBlob;
    createdAt: Time;
    description?: string;
    classLevel: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createNote(title: string, subject: string, classLevel: string, description: string | null, file: ExternalBlob | null): Promise<string>;
    deleteNote(id: string): Promise<void>;
    getAllNotes(subjectFilter: string | null, classLevelFilter: string | null): Promise<Array<Note>>;
    getCallerUserRole(): Promise<UserRole>;
    getNote(id: string): Promise<Note>;
    getUserNotes(): Promise<Array<Note>>;
    isCallerAdmin(): Promise<boolean>;
    searchNotes(keyword: string): Promise<Array<Note>>;
    updateNote(id: string, title: string, subject: string, classLevel: string, description: string | null, file: ExternalBlob | null): Promise<void>;
}
