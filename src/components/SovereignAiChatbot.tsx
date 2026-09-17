import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, Send, X, Minimize2, Maximize2, RefreshCw, ChevronRight, Trash2 } from "lucide-react";
import { askAiOracle } from "@/lib/audit.functions";
import { saveChatMessage, deleteChatSession, type ChatMessage } from "@/lib/firestore-service";

interface SovereignChatProps {
  initialOpen?: boolean;
}

const PRESET_PROMPTS = [
  "What are the top statutory penalties under India DPDP Act 2023?",
  "How does UAE PDPL restrict cross-border data transfers?",
  "What is the required breach notification window under GDPR vs PDPA?",
  "Explain what checks the ASJi One audit scanner performs",
];

const INITIAL_GREETING: ChatMessage = {
  sender: "assistant",
  content: `Hello! I am **ASJi One AI**.\n\nAsk me any question about the **ASJi One** compliance scanner or global data privacy regulations (India DPDP, UAE PDPL, EU GDPR, US CPRA, Singapore PDPA, etc.).\n\n*Note: Your chat history is ephemeral and automatically deleted upon closing for complete privacy.*`,
  quickActions: PRESET_PROMPTS,
};

export function SovereignAiChatbot({ initialOpen = false }: SovereignChatProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionId, setSessionId] = useState<string>(
    () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  );

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Privacy protection: Clear history when closed
  const handleClose = async () => {
    setIsOpen(false);
    // Erase current session from memory and cloud Firestore
    await deleteChatSession(sessionId);
    // Reset to brand-new fresh state & generate fresh session ID for next opening
    const newSession = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setSessionId(newSession);
    setMessages([INITIAL_GREETING]);
    setInput("");
  };

  const handleOpen = () => {
    // When opening, guarantee fresh session with greeting
    const newSession = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setSessionId(newSession);
    setMessages([INITIAL_GREETING]);
    setInput("");
    setIsOpen(true);
  };

  const handleClearHistory = async () => {
    await deleteChatSession(sessionId);
    const newSession = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setSessionId(newSession);
    setMessages([INITIAL_GREETING]);
    setInput("");
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    const userMsg: ChatMessage = {
      sender: "user",
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Save user message to transient session
    saveChatMessage(sessionId, {
      sender: "user",
      content: queryText,
    });

    try {
      // Build conversation history for context
      const historyContext = messages
        .filter((m) => m.sender === "user" || m.sender === "assistant")
        .slice(-6)
        .map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("model" as const),
          parts: [m.content],
        }));

      const response = await askAiOracle({
        data: {
          question: queryText,
          history: historyContext,
        },
      });

      const assistantMsg: ChatMessage = {
        sender: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        quickActions: response.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save assistant response
      saveChatMessage(sessionId, {
        sender: "assistant",
        content: response.answer,
        sources: response.sources,
        quickActions: response.suggestedFollowUps,
      });
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "An unexpected latency occurred connecting to the intelligence cluster.";
      const errorMsg: ChatMessage = {
        sender: "assistant",
        content: `**ASJi One AI:** ${errMsg} You can also review statutory clauses directly in the World Laws section below.`,
        timestamp: new Date().toISOString(),
        quickActions: PRESET_PROMPTS.slice(0, 2),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Floating Launcher Button (Logo Only) */}
      {!isOpen && (
        <motion.button
          key="asji-oracle-trigger"
          id="asji-oracle-trigger"
          onClick={handleOpen}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="group fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/60 bg-black/90 text-[#D4AF37] shadow-2xl shadow-black/80 backdrop-blur-xl fps-120 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          aria-label="Open ASJi One AI"
          title="ASJi One AI"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="h-7 w-7 text-[#D4AF37] transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-80" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#D4AF37]" />
            </span>
          </div>
        </motion.button>
      )}

      {/* Main Chatbot Interface Window */}
      {isOpen && (
        <motion.div
          key="asji-oracle-window"
          id="asji-oracle-window"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={`fixed bottom-4 right-4 z-50 flex flex-col rounded-3xl border border-[#D4AF37]/35 bg-[#0a0a0a]/95 text-white shadow-2xl shadow-black/90 backdrop-blur-2xl fps-120 transition-[width,height] duration-300 ${
            isExpanded
              ? "h-[85vh] w-[95vw] max-w-4xl sm:bottom-6 sm:right-6"
              : "h-[580px] w-[92vw] max-w-md sm:bottom-6 sm:right-6"
          }`}
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.15)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 bg-black/70 px-5 py-3.5 rounded-t-3xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-tight text-white">
                  ASJi One AI
                </h3>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1.5 text-[#E5E5E5]/70">
              <button
                onClick={handleClearHistory}
                className="rounded-lg p-1.5 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Clear Chat History (Instant Erasure)"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors"
                title="Close & Delete History"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream Area with Watermark Background */}
          <div className="relative flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs sm:text-sm">
            {/* Background Watermark Logo */}
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.045] select-none"
              aria-hidden="true"
            >
              <img
                src="/asji-logo.svg"
                alt=""
                className="h-80 w-80 max-w-none object-contain blur-[1.5px]"
              />
            </div>

            <div className="relative z-10 space-y-4">
              {messages.map((msg, idx) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1.5`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#E5E5E5]/60">
                      {isUser ? (
                        <span>You</span>
                      ) : (
                        <span className="text-[#D4AF37] font-semibold">ASJi One AI</span>
                      )}
                    </div>

                    <div
                      className={`max-w-[88%] rounded-2xl p-4 leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm ${
                        isUser
                          ? "bg-[#D4AF37] text-black font-semibold rounded-br-none shadow-md shadow-[#D4AF37]/20"
                          : "bg-[#141414]/90 border border-[#D4AF37]/20 text-[#E5E5E5] rounded-bl-none shadow-inner"
                      }`}
                    >
                      {msg.content}

                      {/* Sources Citation Bar */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 border-t border-white/10 pt-2 text-[10px] text-[#E5E5E5]/70">
                          <span className="font-bold text-[#D4AF37] block mb-1">
                            Verified Statutory Sources:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="rounded-md border border-[#D4AF37]/30 bg-black/40 px-2 py-0.5 text-[9.5px] text-[#D4AF37]"
                              >
                                {s.law} // {s.article}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Follow-up Quick Action Chips */}
                    {msg.quickActions &&
                      msg.quickActions.length > 0 &&
                      idx === messages.length - 1 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 pt-1">
                          {msg.quickActions.map((action, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleSend(action)}
                              className="flex items-center gap-1 rounded-full border border-[#D4AF37]/30 bg-black/60 px-3 py-1 text-[10px] text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 transition-all text-left"
                            >
                              <span>{action}</span>
                              <ChevronRight className="h-2.5 w-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 rounded-2xl border border-[#D4AF37]/20 bg-[#141414]/90 p-3 text-xs text-[#D4AF37]">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#D4AF37]" />
                  <span className="font-mono">Processing query...</span>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-[#D4AF37]/20 bg-black/80 p-3 rounded-b-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any question about this tool or world privacy laws..."
                className="flex-1 rounded-xl border border-[#D4AF37]/30 bg-black px-3.5 py-2.5 font-mono text-xs text-white placeholder-[#E5E5E5]/40 outline-none transition-colors focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37] text-black font-bold transition-all hover:bg-[#E5C158] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send Query"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
