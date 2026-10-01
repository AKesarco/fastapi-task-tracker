import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
const STATUSES = ["todo", "in_progress", "done"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load tasks once when the component first mounts
  useEffect(() => {
    fetch(`${API}/tasks`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function addTask() {
    if (!title.trim()) return;
    const r = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!r.ok) {
      setError(`Could not add task (HTTP ${r.status})`);
      return;
    }
    const created = await r.json();
    setTasks((prev) => [...prev, created]);
    setTitle("");
  }

  async function changeStatus(id, status) {
    const r = await fetch(`${API}/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) {
      setError(`Could not update task (HTTP ${r.status})`);
      return;
    }
    const updated = await r.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  if (loading) return <p>Loading…</p>;

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Task Tracker</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="New task"
          style={{ flex: 1 }}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => (
          <li
            key={t.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #ddd",
            }}
          >
            <span style={{ textDecoration: t.status === "done" ? "line-through" : "none" }}>
              {t.title}
            </span>
            <select value={t.status} onChange={(e) => changeStatus(t.id, e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </main>
  );
}