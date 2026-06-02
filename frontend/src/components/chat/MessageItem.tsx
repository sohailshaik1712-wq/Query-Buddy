import React from "react";
import { User, Database, Edit2 } from "lucide-react";
import { Message } from "@/lib/types";
import SqlBlock from "./SqlBlock";
import ResultTable from "./ResultTable";

interface MessageItemProps {
  message: Message;
  isExecutingSQL: boolean;
  onExecuteSQL: (sql: string) => Promise<void>;
  onEditQuestion: (content: string) => void;
}

const MessageItem = ({
  message,
  isExecutingSQL,
  onExecuteSQL,
  onEditQuestion,
}: MessageItemProps) => {
  return (
    <div className="flex gap-3 sm:gap-4 group/msg">
      <div
        className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
          message.role === "user" ? "bg-slate-800" : "bg-indigo-600"
        }`}
      >
        {message.role === "user" ? (
          <User size={16} className="text-slate-400 sm:w-[18px] sm:h-[18px]" />
        ) : (
          <Database size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
        )}
      </div>
      <div className="space-y-3 sm:space-y-4 w-full overflow-hidden min-w-0">
        <div className="flex items-center justify-between">
          <div
            className={`font-semibold text-xs sm:text-sm ${
              message.role === "user" ? "text-slate-400" : "text-indigo-400"
            }`}
          >
            {message.role === "user" ? "You" : "QueryBuddy"}
          </div>
          {message.role === "user" && (
            <button
              onClick={() => onEditQuestion(message.content)}
              className="p-1 text-slate-500 hover:text-white opacity-0 group-hover/msg:opacity-100 transition-all"
              title="Edit question"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
        <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
          {message.content}
        </div>

        {message.metadata_json?.sql && (
          <SqlBlock
            sql={message.metadata_json.sql}
            onExecute={onExecuteSQL}
            isExecuting={isExecutingSQL}
          />
        )}

        {message.metadata_json?.results &&
          message.metadata_json.results.length > 0 && (
            <ResultTable results={message.metadata_json.results} />
          )}

        {message.metadata_json?.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 sm:p-3 rounded-lg text-xs font-mono break-all">
            {message.metadata_json.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
