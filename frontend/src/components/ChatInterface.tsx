import React, { useState, useEffect, useRef } from "react";
import { Database, Loader2, Plus } from "lucide-react";
import api from "@/lib/api";
import { Chat, Message, Workspace } from "@/lib/types";
import ChatHeader from "./chat/ChatHeader";
import MessageItem from "./chat/MessageItem";
import ChatInput from "./chat/ChatInput";

interface ChatInterfaceProps {
  selectedWorkspace: Workspace | null;
  selectedChatId: string | null;
  onCreateChat: () => Promise<Chat | null>;
  isCreatingChat: boolean;
  onConfigureConnection: () => void;
  onDeleteChat: (id: string) => void;
  onUpdateChat: (id: string, title: string) => void;
  onOpenSidebar: () => void;
}

const ChatInterface = ({
  selectedWorkspace,
  selectedChatId,
  onCreateChat,
  isCreatingChat,
  onConfigureConnection,
  onDeleteChat,
  onUpdateChat,
  onOpenSidebar,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [isExecutingSQL, setIsExecutingSQL] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasConnection = Boolean(selectedWorkspace?.database_connection);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleEditQuestion = (content: string) => {
    setInputValue(content);
    // Focus the textarea
    const textarea = document.querySelector("textarea");
    if (textarea) (textarea as HTMLTextAreaElement).focus();
  };

  const handleExecuteSQL = async (messageId: string, sql: string) => {
    if (!selectedWorkspace) return;
    setIsExecutingSQL(true);
    try {
      const response = await api.post<Record<string, unknown>[]>(
        `/workspaces/${selectedWorkspace.id}/execute-sql`,
        { sql },
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                metadata_json: {
                  ...(msg.metadata_json || {}),
                  sql,
                  results: response.data,
                  error: null,
                },
              }
            : msg,
        ),
      );
    } catch (err: unknown) {
      let errorMsg = "Failed to execute SQL";
      const axiosError = err as {
        response?: { data?: { detail?: string | { msg?: string }[] } };
        message?: string;
      };
      if (axiosError.response?.data?.detail) {
        if (typeof axiosError.response.data.detail === "string") {
          errorMsg = axiosError.response.data.detail;
        } else if (Array.isArray(axiosError.response.data.detail)) {
          errorMsg = axiosError.response.data.detail
            .map((e: { msg?: string }) => e.msg || JSON.stringify(e))
            .join(", ");
        } else {
          errorMsg = JSON.stringify(axiosError.response.data.detail);
        }
      } else if (axiosError.message) {
        errorMsg = axiosError.message;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                metadata_json: {
                  ...(msg.metadata_json || {}),
                  sql,
                  error: errorMsg,
                },
              }
            : msg,
        ),
      );
    } finally {
      setIsExecutingSQL(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedChatId) {
        setMessages([]);
        setIsEditingTitle(false);
        return;
      }
      try {
        const response = await api.get<Chat>(`/chats/thread/${selectedChatId}`);
        setMessages(response.data.messages || []);
        setEditTitleValue(response.data.title || "New Chat");
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    fetchHistory();
  }, [selectedChatId]);

  const handleUpdateTitle = () => {
    if (selectedChatId && editTitleValue.trim()) {
      onUpdateChat(selectedChatId, editTitleValue.trim());
    }
    setIsEditingTitle(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChatId || isLoading || !hasConnection)
      return;

    const userMsgContent = inputValue;
    setInputValue("");
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await api.post<Message[]>(
        `/messages/${selectedChatId}`,
        {
          role: "user",
          content: userMsgContent,
        },
        {
          signal: controller.signal,
        },
      );
      setMessages((prev) => [...prev, ...response.data]);
    } catch (err: any) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        console.log("Request stopped by user");
      } else {
        console.error("Failed to send message", err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  if (!selectedWorkspace) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-500 px-6 text-center relative">
        <button
          onClick={onOpenSidebar}
          className="absolute top-4 left-4 md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 rounded-md border border-slate-800"
        >
          <Plus size={20} className="rotate-45" />
        </button>
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-slate-800">
          <Database size={40} className="text-indigo-500/50" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome to QueryBuddy
        </h2>
        <p className="max-w-sm text-slate-400">
          Select or create a workspace to start analyzing your database with AI.
        </p>
      </div>
    );
  }

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-400 px-6 text-center relative">
        <button
          onClick={onOpenSidebar}
          className="absolute top-4 left-4 md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 rounded-md border border-slate-800"
        >
          <Plus size={20} className="rotate-45" />
        </button>
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-slate-800">
          <Database size={40} className="text-indigo-500/50" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {selectedWorkspace.name}
        </h2>
        <p className="max-w-md text-slate-400 mb-8">
          This workspace is ready. Create a new chat to start asking questions
          about your data.
        </p>
        <button
          onClick={onCreateChat}
          disabled={isCreatingChat}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-60"
        >
          {isCreatingChat ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Plus size={20} />
          )}
          Start New Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 h-screen w-full overflow-hidden">
      <ChatHeader
        onOpenSidebar={onOpenSidebar}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        editTitleValue={editTitleValue}
        setEditTitleValue={setEditTitleValue}
        handleUpdateTitle={handleUpdateTitle}
        hasConnection={hasConnection}
        onDeleteChat={() => selectedChatId && onDeleteChat(selectedChatId)}
        onConfigureConnection={onConfigureConnection}
      />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8"
      >
        <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isExecutingSQL={isExecutingSQL}
              onExecuteSQL={(sql) => handleExecuteSQL(msg.id, sql)}
              onEditQuestion={handleEditQuestion}
            />
          ))}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 animate-pulse">
              <div className="w-8 h-8 rounded bg-indigo-600/50 flex items-center justify-center flex-shrink-0">
                <Loader2 className="animate-spin text-white/50" size={16} />
              </div>
              <div className="space-y-2">
                <div className="h-3 sm:h-4 w-20 sm:w-24 bg-slate-800 rounded"></div>
                <div className="h-3 sm:h-4 w-48 sm:w-64 bg-slate-800 rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={handleSendMessage}
        onStop={handleStopGeneration}
        isLoading={isLoading}
        hasConnection={hasConnection}
        onConfigureConnection={onConfigureConnection}
      />
    </div>
  );
};

export default ChatInterface;
