"use client";

import { useState, useEffect } from "react";
import { toast } from "./toast";
import { MessageSquare, Send, Plus, X } from "lucide-react";

type Reply = { id: string; content: string; isAdmin: boolean; createdAt: string; user: { name: string | null; email: string } };
type SupportItem = { id: string; subject: string; message: string; status: string; priority: string; createdAt: string; updatedAt: string; replies: Reply[] };

export function SupportClient() {
  const [items, setItems] = useState<SupportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/support");
      const j = await r.json();
      if (r.ok) setItems(j.items ?? []);
    } catch {}
    setLoading(false);
  }

  async function send() {
    if (!subject.trim() || !message.trim()) return;
    setBusy(true);
    const r = await fetch("/api/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subject: subject.trim(), message: message.trim() }) });
    setBusy(false);
    if (!r.ok) { toast({ title: "Failed to send", variant: "error" }); return; }
    toast({ title: "Message sent", variant: "success" });
    setSubject("");
    setMessage("");
    setOpen(false);
    load();
  }

  async function sendReply(id: string) {
    if (!replyText.trim()) return;
    const r = await fetch(`/api/support/${id}/reply`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: replyText.trim() }) });
    if (!r.ok) { toast({ title: "Reply failed", variant: "error" }); return; }
    toast({ title: "Reply sent", variant: "success" });
    setReplyText("");
    setReplyId(null);
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-500">{items.length} conversations</div>
        <button onClick={() => setOpen(true)} className="btn btn-primary h-8 px-3 text-xs"><Plus size={14} /> New message</button>
      </div>
      {loading ? <div className="text-sm text-ink-500">Loading…</div> : null}
      {!loading && items.length === 0 && (
        <div className="card p-8 text-center text-sm text-ink-500">
          <MessageSquare size={28} className="mx-auto mb-2 opacity-50" />
          No messages yet. Click &quot;New message&quot; to contact support.
        </div>
      )}
      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{m.subject}</div>
                <div className="text-xs text-ink-500">{timeAgo(m.createdAt)} · <span className="font-medium">{m.status}</span></div>
              </div>
            </div>
            <div className="text-sm text-ink-700 dark:text-ink-300 bg-[rgb(var(--border))]/40 p-3 rounded-lg">{m.message}</div>
            {m.replies.length > 0 && (
              <div className="space-y-2 pl-4 border-l-2 border-[rgb(var(--border))]">
                {m.replies.map((r) => (
                  <div key={r.id} className="text-sm">
                    <div className="text-xs text-ink-500 mb-0.5">{r.user.email} {r.isAdmin && <span className="text-brand-600 font-medium">(support)</span>} · {timeAgo(r.createdAt)}</div>
                    <div className="text-ink-700 dark:text-ink-300">{r.content}</div>
                  </div>
                ))}
              </div>
            )}
            {replyId === m.id ? (
              <div className="flex gap-2">
                <input value={replyText} onChange={(e) => setReplyText(e.target.value)} className="input flex-1" placeholder="Type a reply…" onKeyDown={(e) => e.key === "Enter" && sendReply(m.id)} />
                <button onClick={() => sendReply(m.id)} className="btn btn-primary h-9 px-3"><Send size={14} /></button>
                <button onClick={() => { setReplyId(null); setReplyText(""); }} className="btn btn-outline h-9 px-3"><X size={14} /></button>
              </div>
            ) : (
              <button onClick={() => setReplyId(m.id)} className="btn btn-outline h-8 px-3 text-xs"><Send size={14} /> Reply</button>
            )}
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="card p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">New support message</div>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input mt-1" placeholder="How can we help?" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input mt-1" rows={4} placeholder="Describe your issue…" />
            </div>
            <div className="flex gap-2">
              <button disabled={busy} onClick={send} className="btn btn-primary flex-1">{busy ? "Sending…" : "Send message"}</button>
              <button onClick={() => setOpen(false)} className="btn btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
