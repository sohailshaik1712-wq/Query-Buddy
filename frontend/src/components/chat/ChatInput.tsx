import React from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSendMessage: () => void;
  onStop: () => void;
  isLoading: boolean;
  hasConnection: boolean;
  onConfigureConnection: () => void;
}

const ChatInput = ({
  inputValue,
  setInputValue,
  onSendMessage,
  onStop,
  isLoading,
  hasConnection,
  onConfigureConnection,
}: ChatInputProps) => {
  return (
    <div className="p-3 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent shrink-0">
      <div className="max-w-4xl mx-auto relative group">
        {!hasConnection && (
          <div className="mb-2 sm:mb-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <span>
              Connect this workspace to PostgreSQL before asking questions.
            </span>
            <button
              onClick={onConfigureConnection}
              className="shrink-0 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 w-full sm:w-auto"
            >
              Connect
            </button>
          </div>
        )}
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 sm:px-4 py-3 sm:py-4 pr-10 sm:pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all placeholder:text-slate-600 resize-none h-20 sm:h-24 text-sm sm:text-base text-white"
          disabled={!hasConnection}
          placeholder={
            isLoading
              ? "Generating answer..."
              : hasConnection
                ? "Ask a question about your data..."
                : "Connect a database before asking questions"
          }
        />
        {isLoading ? (
          <button
            onClick={onStop}
            className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1.5 sm:p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg border border-slate-700 flex items-center gap-2 group/stop"
          >
            <Square size={14} fill="currentColor" className="text-white" />
            <span className="text-[10px] font-bold pr-1 hidden group-hover/stop:inline">
              STOP
            </span>
          </button>
        ) : (
          <button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || !hasConnection}
            className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1.5 sm:p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:bg-slate-800"
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
