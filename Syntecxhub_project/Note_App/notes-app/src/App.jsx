import { useState, useRef, useEffect } from "react";
import "./App.css";

const STORAGE_KEY = "notes-app.notes";

// Read saved notes once, when the component first renders
function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [notes, setNotes] = useState(loadNotes);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const inputRef = useRef(null);

  // Persist notes whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Focus the input when the app loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      inputRef.current?.focus();
      return;
    }

    if (editingId !== null) {
      setNotes(notes.map((n) => (n.id === editingId ? { ...n, text: value } : n)));
      setEditingId(null);
    } else {
      setNotes([{ id: Date.now(), text: value }, ...notes]);
    }

    setText("");
    inputRef.current?.focus();
  }

  function startEdit(note) {
    setEditingId(note.id);
    setText(note.text);
    inputRef.current?.focus();
  }

  function cancelEdit() {
    setEditingId(null);
    setText("");
    inputRef.current?.focus();
  }

  function deleteNote(id) {
    setNotes(notes.filter((n) => n.id !== id));
    if (editingId === id) cancelEdit();
  }

  return (
    <main className="app">
      <h1>📝 My Notes</h1>

      <form className="note-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={editingId !== null ? "Edit your note..." : "Write a new note..."}
        />
        <button type="submit" className="btn primary">
          {editingId !== null ? "Save" : "Add"}
        </button>
        {editingId !== null && (
          <button type="button" className="btn" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {notes.length === 0 ? (
        <p className="empty">No notes yet. Add your first one above!</p>
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li
              key={note.id}
              className={`note ${note.id === editingId ? "editing" : ""}`}
            >
              <span className="note-text">{note.text}</span>
              <div className="actions">
                <button className="btn" onClick={() => startEdit(note)}>
                  Edit
                </button>
                <button className="btn danger" onClick={() => deleteNote(note.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}