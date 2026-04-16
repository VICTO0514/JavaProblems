import { useState, useRef, useEffect } from "react";

// ============================================================
// OOP LAYER — Interface + Inheritance simulation in JS
// ============================================================

// "Interface" — enforced via base class
class IPerson {
  getName() { throw new Error("Must implement getName()"); }
  getAge()  { throw new Error("Must implement getAge()"); }
  display() { throw new Error("Must implement display()"); }
}

// Base class extending the "interface"
class Person extends IPerson {
  constructor(name, age) {
    super();
    this.name = name;
    this.age  = age;
  }
  getName() { return this.name; }
  getAge()  { return this.age; }
  display() {
    return `Person  → Name: ${this.name}, Age: ${this.age}`;
  }
}

// Student inherits Person
class Student extends Person {
  constructor(name, age, studentId, course, grade) {
    super(name, age);
    this.studentId = studentId;
    this.course    = course;
    this.grade     = grade;
  }
  display() {
    return `Student → Name: ${this.name}, Age: ${this.age}, ID: ${this.studentId}, Course: ${this.course}, Grade: ${this.grade}`;
  }
  getInfo() {
    return {
      name: this.name,
      age:  this.age,
      id:   this.studentId,
      course: this.course,
      grade:  this.grade,
    };
  }
}

// GradStudent extends Student (multi-level inheritance)
class GradStudent extends Student {
  constructor(name, age, studentId, course, grade, thesis) {
    super(name, age, studentId, course, grade);
    this.thesis = thesis;
  }
  display() {
    return `GradStd → Name: ${this.name}, Age: ${this.age}, ID: ${this.studentId}, Course: ${this.course}, Grade: ${this.grade}, Thesis: "${this.thesis}"`;
  }
}

// Registry
let registry = [];

// ============================================================
// Command processor
// ============================================================
function processCommand(cmd, setOutput) {
  const parts = cmd.trim().split(/\s+/);
  const verb  = parts[0]?.toLowerCase();

  const lines = [];

  if (verb === "help") {
    lines.push({ t: "info",    v: "══════════════ COMMANDS ══════════════" });
    lines.push({ t: "cmd",     v: "add student  <name> <age> <id> <course> <grade>" });
    lines.push({ t: "cmd",     v: "add grad     <name> <age> <id> <course> <grade> <thesis>" });
    lines.push({ t: "cmd",     v: "list" });
    lines.push({ t: "cmd",     v: "find <id>" });
    lines.push({ t: "cmd",     v: "delete <id>" });
    lines.push({ t: "cmd",     v: "clear" });
    lines.push({ t: "cmd",     v: "demo" });
    lines.push({ t: "info",    v: "══════════════════════════════════════" });
  }

  else if (verb === "add" && parts[1] === "student") {
    const [,,name, age, id, course, grade] = parts;
    if (!name || !age || !id || !course || !grade) {
      lines.push({ t: "error", v: "Usage: add student <name> <age> <id> <course> <grade>" });
    } else {
      const s = new Student(name, +age, id, course, grade);
      registry.push(s);
      lines.push({ t: "success", v: `✔ Added Student: ${s.display()}` });
    }
  }

  else if (verb === "add" && parts[1] === "grad") {
    const [,,name, age, id, course, grade, ...thesisParts] = parts;
    const thesis = thesisParts.join(" ") || "N/A";
    if (!name || !age || !id || !course || !grade) {
      lines.push({ t: "error", v: "Usage: add grad <name> <age> <id> <course> <grade> <thesis>" });
    } else {
      const g = new GradStudent(name, +age, id, course, grade, thesis);
      registry.push(g);
      lines.push({ t: "success", v: `✔ Added GradStudent: ${g.display()}` });
    }
  }

  else if (verb === "list") {
    if (registry.length === 0) {
      lines.push({ t: "warn", v: "No records found. Try 'demo' to load samples." });
    } else {
      lines.push({ t: "info", v: `── ${registry.length} record(s) ──` });
      registry.forEach((r, i) => {
        const tag = r instanceof GradStudent ? "GRAD" : r instanceof Student ? "STU " : "PER ";
        lines.push({ t: r instanceof GradStudent ? "grad" : "student", v: `[${i+1}] [${tag}] ${r.display()}` });
      });
    }
  }

  else if (verb === "find") {
    const id = parts[1];
    const found = registry.filter(r => r.studentId === id || r.name === id);
    if (found.length === 0) {
      lines.push({ t: "warn", v: `No record with id/name "${id}"` });
    } else {
      found.forEach(r => lines.push({ t: "success", v: `Found → ${r.display()}` }));
    }
  }

  else if (verb === "delete") {
    const id = parts[1];
    const before = registry.length;
    registry = registry.filter(r => r.studentId !== id && r.name !== id);
    if (registry.length < before) {
      lines.push({ t: "success", v: `✔ Deleted record(s) matching "${id}"` });
    } else {
      lines.push({ t: "warn",    v: `No record matched "${id}"` });
    }
  }

  else if (verb === "clear") {
    return "__CLEAR__";
  }

  else if (verb === "demo") {
    registry = [];
    registry.push(new Student("Alice",    20, "S001", "CS",   "A"));
    registry.push(new Student("Bob",      22, "S002", "Math", "B+"));
    registry.push(new GradStudent("Carol",27, "G001", "Physics","A+","Quantum Entanglement"));
    registry.push(new GradStudent("David",29, "G002", "AI",     "A", "LLM Fine-Tuning"));
    lines.push({ t: "info",    v: "Demo data loaded (2 Students, 2 GradStudents). Type 'list' to view." });
  }

  else {
    lines.push({ t: "error", v: `Unknown command: "${cmd}". Type 'help' for usage.` });
  }

  return lines;
}

// ============================================================
// UI
// ============================================================
const COLORS = {
  success: "#4ade80",
  error:   "#f87171",
  warn:    "#facc15",
  info:    "#60a5fa",
  cmd:     "#c084fc",
  student: "#34d399",
  grad:    "#f59e0b",
  input:   "#e2e8f0",
  prompt:  "#38bdf8",
};

export default function App() {
  const [history, setHistory] = useState([
    { t: "info",  v: "╔══════════════════════════════════════════╗" },
    { t: "info",  v: "║   Student OOP Console — Java-style JS    ║" },
    { t: "info",  v: "║   Interface → Person → Student → Grad    ║" },
    { t: "info",  v: "╚══════════════════════════════════════════╝" },
    { t: "info",  v: 'Type "help" for commands or "demo" to load sample data.' },
  ]);
  const [input, setInput]     = useState("");
  const [cmdHistory, setCmdH] = useState([]);
  const [cmdIdx, setCmdIdx]   = useState(-1);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const run = () => {
    if (!input.trim()) return;
    const cmd = input.trim();
    setCmdH(h => [cmd, ...h]);
    setCmdIdx(-1);

    const echo = { t: "input", v: `> ${cmd}` };
    const result = processCommand(cmd, setHistory);

    if (result === "__CLEAR__") {
      setHistory([{ t: "info", v: "Console cleared. Type 'help' for commands." }]);
    } else {
      setHistory(h => [...h, echo, ...result]);
    }
    setInput("");
  };

  const onKey = (e) => {
    if (e.key === "Enter")     { run(); }
    if (e.key === "ArrowUp")   {
      const next = Math.min(cmdIdx + 1, cmdHistory.length - 1);
      setCmdIdx(next);
      setInput(cmdHistory[next] ?? "");
    }
    if (e.key === "ArrowDown") {
      const next = Math.max(cmdIdx - 1, -1);
      setCmdIdx(next);
      setInput(next === -1 ? "" : cmdHistory[next]);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      padding: "20px",
    }}>
      {/* Class diagram banner */}
      <div style={{
        color: "#60a5fa", fontSize: "12px", marginBottom: "10px", letterSpacing: "2px",
        textAlign: "center", opacity: 0.7,
      }}>
        «interface» IPerson → Person → Student → GradStudent
      </div>

      {/* Terminal window */}
      <div style={{
        width: "min(820px, 100%)",
        background: "#0d1526",
        border: "1px solid #1e3a5f",
        borderRadius: "10px",
        boxShadow: "0 0 60px rgba(56,189,248,0.12), 0 0 120px rgba(56,189,248,0.05)",
        overflow: "hidden",
      }}>
        {/* Title bar */}
        <div style={{
          background: "#111d35",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "1px solid #1e3a5f",
        }}>
          <div style={{ width:12, height:12, borderRadius:"50%", background:"#ff5f56" }} />
          <div style={{ width:12, height:12, borderRadius:"50%", background:"#ffbd2e" }} />
          <div style={{ width:12, height:12, borderRadius:"50%", background:"#27c93f" }} />
          <span style={{ marginLeft: 10, color: "#60a5fa", fontSize: 13, letterSpacing: 1 }}>
            student-oop-console.js
          </span>
        </div>

        {/* Output area */}
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            height: "460px",
            overflowY: "auto",
            padding: "16px 20px 8px",
            cursor: "text",
          }}
        >
          {history.map((line, i) => (
            <div key={i} style={{
              color: COLORS[line.t] ?? "#e2e8f0",
              fontSize: 13,
              lineHeight: "1.7",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}>
              {line.v}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #1e3a5f",
          padding: "10px 20px",
          background: "#0b1220",
          gap: "8px",
        }}>
          <span style={{ color: COLORS.prompt, fontSize: 14 }}>❯</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type a command..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e2e8f0",
              fontSize: 13,
              fontFamily: "inherit",
              caretColor: "#38bdf8",
            }}
          />
          <button
            onClick={run}
            style={{
              background: "#1e3a5f",
              border: "1px solid #2563eb",
              color: "#93c5fd",
              padding: "5px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              letterSpacing: 1,
              fontFamily: "inherit",
            }}
          >
            RUN
          </button>
        </div>
      </div>

      {/* Quick buttons */}
      <div style={{
        marginTop: 14,
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {["help", "demo", "list",
          "add student Eve 19 S003 Biology A-",
          "find S001", "delete S003"].map(cmd => (
          <button key={cmd}
            onClick={() => {
              const result = processCommand(cmd);
              if (result === "__CLEAR__") {
                setHistory([{ t: "info", v: "Console cleared." }]);
              } else {
                setHistory(h => [...h, { t: "input", v: `> ${cmd}` }, ...result]);
              }
            }}
            style={{
              background: "#111d35",
              border: "1px solid #1e3a5f",
              color: "#60a5fa",
              padding: "5px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "monospace",
              letterSpacing: 0.5,
            }}
          >{cmd}</button>
        ))}
      </div>

      <div style={{ color:"#334155", fontSize:11, marginTop:12, letterSpacing:1 }}>
        ↑ ↓ arrow keys for command history
      </div>
    </div>
  );
}
