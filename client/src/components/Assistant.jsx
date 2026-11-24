import { useEffect, useRef, useState } from "react";
import { answerQuestion, openingMessage, starterQuestions } from "../assistant";

const SIZE_KEY = "borrowbox-assistant-size";
const MIN_WIDTH = 280;
const MIN_HEIGHT = 360;
const DEFAULT_SIZE = { width: 340, height: 520 };

function maxSize() {
  return {
    width: Math.max(MIN_WIDTH, window.innerWidth - 24),
    height: Math.max(MIN_HEIGHT, window.innerHeight - 32),
  };
}

function clampSize(size) {
  const max = maxSize();
  return {
    width: Math.round(Math.min(Math.max(size.width, MIN_WIDTH), max.width)),
    height: Math.round(Math.min(Math.max(size.height, MIN_HEIGHT), max.height)),
  };
}

function readSize() {
  try {
    const saved = JSON.parse(localStorage.getItem(SIZE_KEY) || "");
    if (saved && Number.isFinite(saved.width) && Number.isFinite(saved.height)) return clampSize(saved);
  } catch {
    /* A bad saved size falls back to the medium panel. */
  }
  return clampSize(DEFAULT_SIZE);
}

export default function Assistant() {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState("");
  const [size, setSize] = useState(readSize);
  const [messages, setMessages] = useState([{ role: "bot", text: openingMessage }]);
  const threadRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(SIZE_KEY, JSON.stringify(size));
  }, [size]);

  useEffect(() => {
    function fit() {
      setSize((current) => clampSize(current));
    }
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  function startResize(event) {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const origin = { x: event.clientX, y: event.clientY, ...size };

    function move(next) {
      setSize(clampSize({
        width: origin.width + (origin.x - next.clientX),
        height: origin.height + (origin.y - next.clientY),
      }));
    }
    function stop() {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
    }
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  function nudgeSize(event) {
    const step = event.shiftKey ? 48 : 20;
    const change = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    }[event.key];
    if (!change) return;
    event.preventDefault();
    setSize((current) => clampSize({ width: current.width + change[0], height: current.height + change[1] }));
  }

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, open]);

  function ask(text) {
    const question = text.trim();
    if (!question) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "bot", text: answerQuestion(question) },
    ]);
    setDraft("");
    inputRef.current?.focus();
  }

  if (!open) {
    return (
      <button type="button" className="assistant-launcher" onClick={() => setOpen(true)}>
        Ask rules
      </button>
    );
  }

  return (
    <aside className="assistant" aria-label="Borrowing assistant" style={{ width: size.width, height: size.height }}>
      <button
        type="button"
        className="assistant-resize"
        aria-label="Drag to resize the assistant"
        onPointerDown={startResize}
        onKeyDown={nudgeSize}
      />
      <header className="assistant-head">
        <div>
          <strong>Borrowing assistant</strong>
          <p>Rules already on BorrowBox. Nothing invented.</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Close assistant" onClick={() => setOpen(false)}>
          ×
        </button>
      </header>
      <div className="assistant-thread" ref={threadRef} role="log" aria-live="polite">
        {messages.map((message, index) => (
          <p key={`${message.role}-${index}`} className={message.role === "user" ? "assistant-user" : "assistant-bot"}>
            {message.text}
          </p>
        ))}
      </div>
      <div className="assistant-prompts">
        {starterQuestions.map((question) => (
          <button key={question} type="button" className="chip" onClick={() => ask(question)}>
            {question}
          </button>
        ))}
      </div>
      <form
        className="assistant-form"
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
      >
        <input
          ref={inputRef}
          value={draft}
          placeholder="Ask about deposit, dates, listing…"
          aria-label="Question"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </aside>
  );
}
