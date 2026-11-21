import { seedNotes, type ProjectNote } from "./note-data.ts";

export const storageKey = "sarahfor.ideas.notes.v1";
export type Draft = Pick<ProjectNote, "title" | "summary" | "body" | "category" | "status">;
type NoteStorage = Pick<Storage, "getItem" | "setItem">;
const statuses = ["Idea", "Prototype", "In progress", "Complete"];

function validDraft(value: unknown): value is Draft {
  if (!value || typeof value !== "object") return false;
  const note = value as Record<string, unknown>;
  return ["title", "summary", "body", "category"].every(field => typeof note[field] === "string")
    && (note.title as string).trim().length > 0 && (note.title as string).length <= 160
    && (note.summary as string).length <= 500 && (note.body as string).length <= 50000
    && (note.category as string).length <= 100 && statuses.includes(note.status as string);
}

export function readDrafts(storage: NoteStorage): ProjectNote[] {
  const raw = storage.getItem(storageKey);
  if (raw === null) return [];
  const saved = JSON.parse(raw);
  if (saved?.version !== 1 || !Array.isArray(saved.notes) || !saved.notes.every((note: ProjectNote) =>
    validDraft(note) && typeof note.id === "string" && note.id.length > 0 && note.id.length <= 160
    && typeof note.updatedAt === "string" && Number.isFinite(Date.parse(note.updatedAt))
    && Number.isSafeInteger(note.revision) && note.revision > 0
  ) || new Set(saved.notes.map((note: ProjectNote) => note.id)).size !== saved.notes.length) {
    throw new Error("Saved notes could not be read. Your browser data has been kept unchanged.");
  }
  return saved.notes;
}

export function readNotes(storage: NoteStorage): ProjectNote[] {
  const drafts = readDrafts(storage);
  return [...drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    ...seedNotes.filter(note => !drafts.some(draft => draft.id === note.id))];
}

export function saveNote(storage: NoteStorage, draft: Draft, editing: ProjectNote | null): ProjectNote {
  if (!validDraft(draft)) throw new Error("Add a title and keep each field within its length limit.");
  const drafts = readDrafts(storage);
  if (editing) {
    const current = drafts.find(note => note.id === editing.id) ?? seedNotes.find(note => note.id === editing.id);
    if (!current || current.revision !== editing.revision) {
      throw new Error("This note changed in another tab. Copy your edits, close the editor, and reopen the latest note.");
    }
  }
  const note: ProjectNote = {
    title: draft.title.trim(), summary: draft.summary.trim(), body: draft.body,
    category: draft.category.trim() || "Project idea", status: draft.status,
    id: editing?.id ?? crypto.randomUUID(), revision: (editing?.revision ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  storage.setItem(storageKey, JSON.stringify({version: 1, notes: [note, ...drafts.filter(item => item.id !== note.id)]}));
  return note;
}
