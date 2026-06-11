import { useState } from "react";
import { Send } from "lucide-react";

const initialMessages = [
  { from: "Mentor Ada", text: "Welcome to the research-help group chat. What are you working on this week?", time: "9:15 AM" },
  { from: "Samuel", text: "I need help narrowing my scholarship essay topic.", time: "9:18 AM" },
  { from: "Lina", text: "Can someone review my study-abroad budget checklist?", time: "9:22 AM" },
];

export default function Messages() {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { from: "You", text: text.trim(), time: "now" }]);
    setText("");
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-[2rem] border bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-black">Messages</h1>
        <div className="mt-4 space-y-2">
          {["Research Help", "Scholarships", "Study Abroad", "PhD Admissions"].map((room, i) => <button key={room} className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold ${i === 0 ? "bg-blue-50 text-blue-800" : "hover:bg-slate-100"}`}>{room}</button>)}
        </div>
      </aside>
      <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-[2rem] border bg-white shadow-sm">
        <div className="border-b p-5"><h2 className="font-black">Research Help group chat</h2><p className="text-sm text-slate-500">Live community room for methods, writing, and data questions.</p></div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
          {messages.map((m, idx) => <div key={idx} className={`max-w-[80%] rounded-3xl p-4 ${m.from === "You" ? "ml-auto bg-blue-500 text-white" : "bg-white border"}`}><div className="text-xs font-black opacity-70">{m.from} • {m.time}</div><p className="mt-1 text-sm leading-6">{m.text}</p></div>)}
        </div>
        <div className="flex gap-3 border-t p-4"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message the group..." className="flex-1 rounded-full border bg-slate-50 px-4 py-3 outline-none focus:border-blue-300" /><button onClick={send} className="rounded-full bg-blue-500 px-5 text-white hover:bg-blue-700"><Send className="h-5 w-5" /></button></div>
      </section>
    </div>
  );
}
