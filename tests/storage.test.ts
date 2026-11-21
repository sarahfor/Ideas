import { test } from "node:test";
import assert from "node:assert/strict";
import { readNotes, saveNote, storageKey } from "../src/storage.ts";
import { seedNotes } from "../src/note-data.ts";

function memoryStorage() {
  const entries = new Map<string, string>();
  return {getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => {entries.set(key, value);}};
}

test("published notes are available and new browser notes survive a reload", () => {
  const storage = memoryStorage();
  assert.equal(readNotes(storage).length, 3);
  const created = saveNote(storage, {...seedNotes[0], title: "A new idea"}, null);
  assert.equal(readNotes(storage).find(note => note.id === created.id)?.title, "A new idea");
  assert.equal(readNotes(memoryStorage()).length, 3);
});

test("editing a published note leaves the original intact and prevents stale overwrites", () => {
  const storage = memoryStorage(), published = seedNotes[0];
  const edited = saveNote(storage, {...published, title: "Local draft"}, published);
  assert.equal(edited.revision, 1);
  assert.equal(readNotes(storage).length, 3);
  assert.equal(published.title, "Hot / Cold");
  assert.throws(() => saveNote(storage, {...published, title: "Stale edit"}, published), /changed in another tab/);
  assert.equal(readNotes(storage)[0].title, "Local draft");
});

test("invalid and corrupt notes are never overwritten", () => {
  const storage = memoryStorage();
  assert.throws(() => saveNote(storage, {...seedNotes[0], title: " "}, null), /Add a title/);
  storage.setItem(storageKey, '{"version":1,"notes":[{"id":"bad"}]}');
  const before = storage.getItem(storageKey);
  assert.throws(() => saveNote(storage, seedNotes[0], null), /could not be read/);
  assert.equal(storage.getItem(storageKey), before);
});

test("storage failures propagate so the editor can keep an unsaved draft", () => {
  const storage = {getItem: () => null, setItem: () => {throw new Error("Storage is full");}};
  assert.throws(() => saveNote(storage, seedNotes[0], null), /Storage is full/);
});
