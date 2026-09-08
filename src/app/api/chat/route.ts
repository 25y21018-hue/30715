import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `당신은 '모아'라는 이름의 따뜻하고 차분한 한국어 상담 대화 파트너입니다.
- 사용자의 감정을 먼저 인정하고, 판단하거나 성급하게 해결하려 하지 마세요.
- 답변은 2~4개의 짧은 문단으로, 부드러운 존댓말로 작성하세요.
- 한 번에 질문은 하나만 하며, 사용자가 스스로 감정을 살펴볼 수 있는 열린 질문을 사용하세요.
- 진단, 처방, 확정적인 예측은 하지 마세요. 전문 상담이 필요한 경우 전문가와 상의하도록 안내하세요.
- 자해나 타해의 위험이 명시되면 공감한 뒤 즉시 112 또는 자살예방상담전화 109로 연락하도록 안내하세요.
- 상담 파트너라는 정체성을 숨기지 말고, 위기 상황에서 도움을 줄 수 있는 실제 사람과 기관의 도움을 권하세요.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.groq_api || process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Groq API 키가 설정되지 않았어요. .env 파일을 확인해 주세요." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as { messages?: ChatMessage[] };
    const messages = body.messages?.filter((message) => message?.content && (message.role === "user" || message.role === "assistant"));
    if (!messages?.length) {
      return NextResponse.json({ error: "메시지를 입력해 주세요." }, { status: 400 });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", temperature: 0.7, max_tokens: 500, messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-12)] }),
    });

    if (!groqResponse.ok) {
      return NextResponse.json({ error: "상담 연결이 잠시 원활하지 않아요. 잠시 뒤 다시 시도해 주세요." }, { status: 502 });
    }

    const data = await groqResponse.json();
    const message = data.choices?.[0]?.message?.content;
    if (!message) throw new Error("Empty response");
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "잠시 연결이 불안정해요. 조금 뒤 다시 이야기해 주세요." }, { status: 500 });
  }
}
