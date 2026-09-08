"use client";

import { FormEvent, useState } from "react";

type Message = { role: "assistant" | "user"; content: string };

const starters = [
  "요즘 마음이 자주 가라앉아요",
  "일과 삶의 균형을 찾고 싶어요",
  "관계에서 자꾸 눈치를 보게 돼요",
];

const initialMessages: Message[] = [{ role: "assistant", content: "안녕하세요. 저는 오늘의 마음을 천천히 들여다보는 상담 파트너, 모아예요.\n\n지금 가장 먼저 이야기하고 싶은 마음은 무엇인가요? 정리되지 않은 문장이어도 괜찮아요." }];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;
    setMessages((current) => [...current, { role: "user", content }]);
    setInput("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...messages, { role: "user", content }] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "상담을 이어갈 수 없어요.");
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "잠시 연결이 불안정해요. 조금 뒤 다시 이야기해 주세요." }]);
    } finally { setIsLoading(false); }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar"><div className="brand"><span className="brand-mark">m</span><span>mowa</span></div><div className="side-intro"><span className="eyebrow">YOUR PRIVATE SPACE</span><h1>마음이 쉬어가는<br /><em>작은 방</em></h1><p>괜찮지 않은 날에도,<br />당신 편에 있을게요.</p></div><div className="side-note"><span className="pulse-dot" />오늘도 안전하게 대화 중<p>대화 내용은 이 브라우저에 저장되지 않아요.</p></div><div className="sidebar-footer">MOWA COUNSELING<br /><span>made for your softer days</span></div></aside>
      <section className="chat-panel"><header className="chat-header"><div><span className="eyebrow">TUESDAY, SEPTEMBER 08</span><h2>오늘의 마음</h2></div><div className="status"><span className="status-dot" /> 모아와 연결됨</div></header><div className="conversation"><div className="welcome-line"><span /> 편안한 대화를 시작해 보세요 <span /></div>{messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}><div className="avatar">{message.role === "assistant" ? "m" : "나"}</div><div className="message-bubble">{message.content.split("\n").map((line, lineIndex) => <p key={lineIndex}>{line || <>&nbsp;</>}</p>)}<time>{message.role === "assistant" ? "모아" : "방금 전"}</time></div></div>)}{messages.length === 1 && <div className="starter-wrap"><span className="starter-label">이런 이야기부터 시작해도 좋아요</span><div className="starter-list">{starters.map((starter) => <button type="button" key={starter} onClick={() => setInput(starter)}>{starter}<span>↗</span></button>)}</div></div>}{isLoading && <div className="message-row assistant"><div className="avatar">m</div><div className="message-bubble typing"><i /><i /><i /></div></div>}</div><form className="composer" onSubmit={sendMessage}><div className="input-wrap"><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="지금 마음에 떠오르는 말을 적어주세요" rows={2} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} /><span>Shift + Enter로 줄바꿈</span></div><button className="send-button" type="submit" aria-label="메시지 보내기" disabled={!input.trim() || isLoading}>↗</button></form><p className="disclaimer">모아는 전문 상담을 대신하지 않으며, 위기 상황에서는 112 또는 자살예방상담전화 109에 연락해 주세요.</p></section>
    </main>
  );
}
