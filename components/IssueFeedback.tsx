"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, AlertOctagon, Check } from "lucide-react";

type Vote = "useful" | "useless" | "missing";

export function IssueFeedbackButtons({
  reportId,
  issueIndex
}: {
  reportId: string;
  issueIndex?: number;
}) {
  const [voted, setVoted] = useState<Vote | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function send(vote: Vote, noteText?: string) {
    setSubmitting(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, issueIndex, vote, note: noteText })
    });
    setVoted(vote);
    setSubmitting(false);
    setShowNote(false);
    setNote("");
  }

  if (voted) {
    return (
      <div className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-500">
        <Check className="h-3 w-3" />
        感谢反馈
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>这条建议:</span>
        <button
          onClick={() => send("useful")}
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-emerald-500/10 hover:text-emerald-500 disabled:opacity-40"
          title="有用"
        >
          <ThumbsUp className="h-3 w-3" />
          有用
        </button>
        <button
          onClick={() => send("useless")}
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
          title="没用/太笼统"
        >
          <ThumbsDown className="h-3 w-3" />
          没用
        </button>
        <button
          onClick={() => setShowNote(!showNote)}
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-amber-500/10 hover:text-amber-500 disabled:opacity-40"
          title="漏了应该指出的问题"
        >
          <AlertOctagon className="h-3 w-3" />
          漏了
        </button>
      </div>

      {showNote && (
        <div className="mt-2 rounded-md border p-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="你觉得这里应该指出什么问题?"
            className="w-full resize-none rounded-md border bg-background p-2 text-xs outline-none focus:ring-1 focus:ring-primary"
            rows={2}
          />
          <div className="mt-1.5 flex justify-end gap-2">
            <button
              onClick={() => { setShowNote(false); setNote(""); }}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              取消
            </button>
            <button
              onClick={() => send("missing", note || undefined)}
              disabled={submitting}
              className="rounded-md bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-40"
            >
              提交
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
