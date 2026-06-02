import React from "react";
import { Menu, Edit2, Check, X, ShieldCheck, Trash2, PlugZap } from "lucide-react";

interface ChatHeaderProps {
  onOpenSidebar: () => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (v: boolean) => void;
  editTitleValue: string;
  setEditTitleValue: (v: string) => void;
  handleUpdateTitle: () => void;
  hasConnection: boolean;
  onDeleteChat: () => void;
  onConfigureConnection: () => void;
}

const ChatHeader = ({
  onOpenSidebar,
  isEditingTitle,
  setIsEditingTitle,
  editTitleValue,
  setEditTitleValue,
  handleUpdateTitle,
  hasConnection,
  onDeleteChat,
  onConfigureConnection,
}: ChatHeaderProps) => {
  return (
    <header className="h-16 shrink-0 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-slate-950/50 backdrop-blur-md z-10 w-full">
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 shrink-0"
        >
          <Menu size={20} />
        </button>
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              autoFocus
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateTitle();
                if (e.key === "Escape") setIsEditingTitle(false);
              }}
              className="bg-slate-900 border border-indigo-500 rounded-lg px-2 sm:px-3 py-1 text-sm text-white outline-none w-24 sm:w-48 focus:ring-2 focus:ring-indigo-600/20 min-w-0"
            />
            <button
              onClick={handleUpdateTitle}
              className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors shrink-0"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setIsEditingTitle(false)}
              className="p-1.5 text-slate-400 hover:bg-slate-400/10 rounded-md transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group/title min-w-0">
            <h2 className="font-semibold text-base sm:text-lg text-white truncate">
              {editTitleValue}
            </h2>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1 text-slate-500 hover:text-indigo-400 opacity-100 md:opacity-0 md:group-hover/title:opacity-100 transition-all shrink-0"
              title="Edit Title"
            >
              <Edit2 size={14} />
            </button>
          </div>
        )}
        <div className="hidden sm:block w-px h-4 bg-slate-800 mx-1 shrink-0" />
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
            hasConnection
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-300 border-amber-500/20"
          }`}
        >
          <ShieldCheck size={12} />
          {hasConnection ? "Connected" : "No connection"}
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={onDeleteChat}
          className="p-1.5 sm:p-2 text-slate-500 hover:text-red-400 transition-colors"
          title="Delete Chat"
        >
          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
        <div className="w-px h-6 bg-slate-800 mx-1" />
        <button
          onClick={onConfigureConnection}
          className="inline-flex items-center gap-1 sm:gap-2 rounded-lg border border-slate-800 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-700 transition-all"
        >
          <PlugZap size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Database</span>
          <span className="sm:hidden">DB</span>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
