"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bot, Send, Loader2, ArrowRight, Brain } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "Analisar conversa do WhatsApp", prompt: "Cole uma conversa de WhatsApp aqui e me diga o que responder para avançar esse lead:" },
  { label: "Script de primeiro contato", prompt: "Preciso de um script de primeiro contato para um lead que acabou de entrar pelo Instagram. Me dê opções." },
  { label: "Como quebrar essa objeção", prompt: "Um lead disse que está caro. Me dê scripts para quebrar essa objeção sem desvalorizar o serviço." },
  { label: "Follow-up para lead frio", prompt: "Tenho um lead que parou de responder há 5 dias. Me dê um script de reativação." },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 max-w-[80%]">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#771FE3] to-[#8F68C1] flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#771FE3] to-[#8F68C1] flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-[#771FE3] text-white rounded-br-sm"
            : "bg-[#1a1a2e] border border-white/10 text-white/90 rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export function JordanClient({
  companyId,
  hasBrandBrain,
}: {
  companyId: string;
  hasBrandBrain: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/jordan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, messages: newMessages }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Erro ao contatar o Jordan.");
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantText };
            return updated;
          });
        }
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (!hasBrandBrain) {
    return (
      <div className="max-w-lg">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#771FE3]/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-7 h-7 text-[#771FE3]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Jordan não está pronto ainda</h2>
          <p className="text-white/50 text-sm mb-6">
            Complete o briefing ANIMA para ativar o Jordan. Ele precisa conhecer sua
            marca para ajudar com precisão.
          </p>
          <Link
            href="/client/briefing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Ir para ANIMA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Coluna esquerda — contexto */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4">
        {/* Avatar Jordan */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#771FE3] to-[#8F68C1] flex items-center justify-center mx-auto mb-3">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white font-bold text-lg">Jordan</h2>
          <p className="text-white/40 text-sm">Seu consultor de vendas</p>
        </div>

        {/* Ações rápidas */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
            Ações rápidas
          </p>
          <div className="space-y-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => sendMessage(action.prompt)}
                disabled={isStreaming}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-white/10"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna direita — chat */}
      <div className="flex-1 flex flex-col bg-[#111111] border border-white/10 rounded-xl overflow-hidden min-w-0">
        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#771FE3]/10 flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-[#771FE3]" />
                </div>
                <p className="text-white/30 text-sm">
                  Cole uma conversa do WhatsApp ou descreva uma situação
                </p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <TypingIndicator />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              rows={2}
              placeholder="Cole uma conversa do WhatsApp, descreva uma situação ou faça uma pergunta..."
              className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[#771FE3]/50 min-h-[60px] max-h-[160px] disabled:opacity-50"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim()}
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#771FE3] to-[#8F68C1] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-white/20 text-xs mt-2 pl-1">
            Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}
