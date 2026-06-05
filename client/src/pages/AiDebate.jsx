import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createDebateConversation,
  deleteDebateConversation,
  getDebateConversation,
  getDebateConversations,
  sendDebateConversationMessage,
} from "../api/aiDebate";
import { getAuthUser } from "../api/auth";
import { showError, showSuccess } from "../utils/toast";
import { Trash2 } from "lucide-react";

function AiDebate() {
  const navigate = useNavigate();

  const bottomRef = useRef(null);

  const responseAnimationRef = useRef(null);
  const [user] = useState(() => getAuthUser());
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [topic, setTopic] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [stance, setStance] = useState("for");
  const [debateStyle, setDebateStyle] = useState("balanced");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId,
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadConversations = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await getDebateConversations();
        setConversations(data.conversations || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Failed to load chat history",
        );
      } finally {
        setLoadingHistory(false);
      }
    };

    loadConversations();
  }, [navigate, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      if (responseAnimationRef.current) {
        clearInterval(responseAnimationRef.current);
      }
    };
  }, []);

  const refreshConversations = async () => {
    const { data } = await getDebateConversations();
    setConversations(data.conversations || []);
  };

  const animateAssistantMessage = (nextMessages) => {
    if (responseAnimationRef.current) {
      clearInterval(responseAnimationRef.current);
      responseAnimationRef.current = null;
    }

    const lastMessage = nextMessages[nextMessages.length - 1];

    if (!lastMessage || lastMessage.role !== "assistant") {
      setMessages(nextMessages);
      return Promise.resolve();
    }

    const assistantText = lastMessage.content || "";
    const leadingMessages = nextMessages.slice(0, -1);
    const animatedMessage = {
      ...lastMessage,
      content: "",
    };

    setMessages([...leadingMessages, animatedMessage]);
    setStreamingResponse(true);

    return new Promise((resolve) => {
      let index = 0;

      responseAnimationRef.current = setInterval(() => {
        index += assistantText.length > 400 ? 4 : 2;

        const visibleText = assistantText.slice(0, index);

        setMessages([
          ...leadingMessages,
          {
            ...animatedMessage,
            content: visibleText,
          },
        ]);

        if (index >= assistantText.length) {
          clearInterval(responseAnimationRef.current);
          responseAnimationRef.current = null;
          setMessages(nextMessages);
          setStreamingResponse(false);
          resolve();
        }
      }, 18);
    });
  };

  const openConversation = async (conversationId) => {
    setError("");

    if (responseAnimationRef.current) {
      clearInterval(responseAnimationRef.current);
      responseAnimationRef.current = null;
    }
    setStreamingResponse(false);
    setActiveConversationId(conversationId);
    setShowHistory(false);
    setLoadingHistory(true);
    setTyping(false);

    try {
      const { data } = await getDebateConversation(conversationId);
      setMessages(data.conversation.messages || []);
      setTopic(data.conversation.topic || "");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to open conversation",
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateConversation = async (event) => {
    event.preventDefault();
    if (!topic.trim()) {
      setError("Topic is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await createDebateConversation(topic.trim());
      const conversation = data.conversation;
      setActiveConversationId(conversation._id);
      setMessages([]);
      setTopic("");
      setUserMessage("");
      await refreshConversations();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to create conversation",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (event) => {
    event?.preventDefault();

    if (!activeConversationId) {
      setError("Create or select a conversation first");
      return;
    }

    if (!userMessage.trim()) {
      return;
    }

    const nextUserMessage = userMessage.trim();
    setUserMessage("");
    setError("");
    setLoading(true);
    setTyping(true);
    setMessages((current) => [
      ...current,
      { role: "user", content: nextUserMessage },
    ]);

    try {
      const { data } = await sendDebateConversationMessage(
        activeConversationId,
        {
          userMessage: nextUserMessage,
          stance,
          debateStyle,
        },
      );

      setTyping(false);
      await animateAssistantMessage(data.messages || []);
      await refreshConversations();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to get AI response",
      );
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteDebateConversation(conversationId);

      setConversations((prev) => prev.filter((c) => c._id !== conversationId));

      if (activeConversationId === conversationId) {
        setActiveConversationId("");
        setMessages([]);
        setTopic("");
      }

      showSuccess("Conversation deleted");
      setShowHistory(false);
    } catch (error) {
      showError("Failed to delete conversation");
    }
  };

  return (
    <main className="min-h-[calc(100svh-65px)] bg-[#020b2d] text-slate-100">
      <section className="mx-auto h-[calc(100svh-65px)] max-w-7xl flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 lg:hidden"
        >
          {showHistory ? "💬 Show Chat" : "📚 Show History"}
        </button>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className={`
              ${showHistory ? "flex" : "hidden"}
              lg:flex
              min-h-0 flex-col rounded-2xl border border-slate-800 bg-slate-900 p-4
            `}
          >
            <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 font-bold text-slate-950">
                DS
              </div>

              <div>
                <h2 className="font-semibold text-white">DebateSpace</h2>
                <p className="text-xs text-slate-500">AI Debate Assistant</p>
              </div>
            </div>
            <form className="space-y-3" onSubmit={handleCreateConversation}>
              <div>
                <label
                  className="block text-sm font-medium text-slate-300"
                  htmlFor="topic"
                >
                  Debate topic
                </label>
                <input
                  id="topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="AI should be regulated"
                  className="mt-2 block w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-700 disabled:text-cyan-100"
              >
                New conversation
              </button>
            </form>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="stance"
                >
                  Stance
                </label>
                <select
                  id="stance"
                  value={stance}
                  onChange={(event) => setStance(event.target.value)}
                  className="mt-2 block w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                >
                  <option value="for">For</option>
                  <option value="against">Against</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="style"
                >
                  Style
                </label>
                <select
                  id="style"
                  value={debateStyle}
                  onChange={(event) => setDebateStyle(event.target.value)}
                  className="mt-2 block w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                >
                  <option value="balanced">Balanced</option>
                  <option value="aggressive">Aggressive</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex min-h-0 flex-1 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  History ({conversations.length})
                </h2>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {loadingHistory ? (
                  <p className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-500">
                    Loading history...
                  </p>
                ) : conversations.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-500">
                    No saved chats yet.
                  </p>
                ) : (
                  conversations.map((conversation) => (
                    <div key={conversation._id} className="relative">
                      <button
                        type="button"
                        onClick={() => openConversation(conversation._id)}
                        className={`w-full rounded-lg border py-3 pl-3 pr-10 text-left transition ${
                          activeConversationId === conversation._id
                            ? "border-cyan-400/70 bg-cyan-400/10"
                            : "border-slate-700 bg-slate-950 hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="line-clamp-2 text-sm font-semibold text-slate-100">
                          {conversation.title}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {new Date(conversation.updatedAt).toLocaleString()}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();

                          if (window.confirm("Delete this conversation?")) {
                            handleDeleteConversation(conversation._id);
                          }
                        }}
                        className="absolute right-3 top-3 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Link
              to="/"
              className="mt-5 inline-flex text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Back to home
            </Link>
          </aside>

          <section
            className={`
              ${showHistory ? "hidden" : "flex"} 
              lg:flex 
              min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900
            `}
          >
            {activeConversationId && (
              <div className="border-b border-slate-800 px-5 py-3">
                <h2 className="text-lg font-semibold text-white">
                  {activeConversation?.title}
                </h2>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              <div className="space-y-4">
                {error ? (
                  <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                {messages.length === 0 ? (
                  <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6 text-center text-sm text-slate-400">
                    <div>
                      <p className="text-base font-semibold text-slate-200">
                        No messages yet
                      </p>
                      <p className="mt-2">
                        Start with a claim. The AI will answer like a debate
                        opponent.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}-${message.createdAt || ""}`}
                      className={`flex animate-[fadeIn_220ms_ease-out] ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[76%] ${
                          message.role === "user"
                            ? "rounded-br-md bg-cyan-400 text-slate-950"
                            : "rounded-bl-md border border-slate-700 bg-slate-950 text-slate-100"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.content}
                          {streamingResponse &&
                          message.role === "assistant" &&
                          index === messages.length - 1 ? (
                            <span className="ml-0.5 inline-block h-4 w-1 animate-pulse translate-y-0.5 rounded-full bg-cyan-300" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {typing ? (
                  <div className="flex justify-start">
                    <div className="animate-[fadeIn_220ms_ease-out] rounded-2xl rounded-bl-md border border-slate-700 bg-slate-950 px-4 py-3">
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <span>AI is thinking</span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:120ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:240ms]" />
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div ref={bottomRef} />
              </div>
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !loading &&
                      !streamingResponse
                    ) {
                      e.preventDefault();

                      handleSendMessage({
                        preventDefault: () => {},
                      });
                    }
                  }}
                  rows={2}
                  placeholder="Write your argument..."
                  className="min-h-24 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />
                <button
                  type="submit"
                  disabled={loading || streamingResponse}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:min-w-28"
                >
                  {loading || streamingResponse ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

export default AiDebate;
