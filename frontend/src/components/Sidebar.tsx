"use client";

import React from "react";
import {
  Database,
  MessageSquare,
  Plus,
  Settings,
  LogOut,
  Loader2,
  PlugZap,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Chat, Workspace } from "@/lib/types";

interface SidebarProps {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (w: Workspace) => void;
  chats: Chat[];
  selectedChatId: string | null;
  setSelectedChatId: (id: string) => void;
  onNewWorkspace: () => void;
  onNewChat: () => Promise<Chat | null>;
  isCreatingChat: boolean;
  onConfigureConnection: () => void;
  onDeleteWorkspace: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onUpdateWorkspace: (id: string, name: string) => void;
  onUpdateChat: (id: string, title: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isChatsLoading?: boolean;
}

const Sidebar = ({
  workspaces,
  selectedWorkspace,
  setSelectedWorkspace,
  chats,
  selectedChatId,
  setSelectedChatId,
  onNewWorkspace,
  onNewChat,
  isCreatingChat,
  onConfigureConnection,
  onDeleteWorkspace,
  onDeleteChat,
  onUpdateWorkspace,
  onUpdateChat,
  isOpen,
  onClose,
  isChatsLoading,
}: SidebarProps) => {
  const { user, logout } = useAuth();
  const [editingWorkspaceId, setEditingWorkspaceId] = React.useState<
    string | null
  >(null);
  const [editingChatId, setEditingChatId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  const startEditingWorkspace = (e: React.MouseEvent, w: Workspace) => {
    e.stopPropagation();
    setEditingWorkspaceId(w.id);
    setEditValue(w.name);
  };

  const startEditingChat = (e: React.MouseEvent, c: Chat) => {
    e.stopPropagation();
    setEditingChatId(c.id);
    setEditValue(c.title || "New Chat");
  };

  const handleUpdateWorkspace = () => {
    if (editingWorkspaceId && editValue.trim()) {
      onUpdateWorkspace(editingWorkspaceId, editValue.trim());
    }
    setEditingWorkspaceId(null);
  };

  const handleUpdateChat = () => {
    if (editingChatId && editValue.trim()) {
      onUpdateChat(editingChatId, editValue.trim());
    }
    setEditingChatId(null);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 h-screen text-slate-300 flex flex-col p-4 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Database size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              QueryBuddy
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            <span>Workspaces</span>
          </div>
          <div className="space-y-1">
            {workspaces.map((w) => (
              <div
                key={w.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  selectedWorkspace?.id === w.id
                    ? "bg-slate-800 text-white shadow-sm"
                    : "hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                {editingWorkspaceId === w.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateWorkspace();
                        if (e.key === "Escape") setEditingWorkspaceId(null);
                      }}
                      className="flex-1 bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                    />
                    <button
                      onClick={handleUpdateWorkspace}
                      className="text-emerald-400 hover:text-emerald-300 p-0.5"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingWorkspaceId(null)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedWorkspace(w)}
                      className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                    >
                      <Database
                        size={16}
                        className={
                          selectedWorkspace?.id === w.id
                            ? "text-indigo-400"
                            : "text-slate-500"
                        }
                      />
                      <span className="text-sm truncate font-medium">
                        {w.name}
                      </span>
                    </button>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => startEditingWorkspace(e, w)}
                        className="p-1 hover:text-indigo-400"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWorkspace(w.id);
                        }}
                        className="p-1 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={onNewWorkspace}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-slate-800 hover:text-white border border-dashed border-slate-700 mt-2 text-slate-400"
          >
            <Plus size={16} />
            <span className="text-sm">New Workspace</span>
          </button>

          <div className="pt-6 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            <span>Recent Chats</span>
          </div>
          {selectedWorkspace && (
            <button
              onClick={onNewChat}
              disabled={isCreatingChat}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 mb-2 disabled:opacity-60"
            >
              {isCreatingChat ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              <span className="text-sm font-medium">New Chat</span>
            </button>
          )}
          <div className="space-y-1">
            {isChatsLoading ? (
              // Skeleton Loader for Chats
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-md bg-slate-800/20 animate-pulse flex items-center gap-3"
                  >
                    <div className="w-4 h-4 rounded bg-slate-800/50" />
                    <div className="h-3 bg-slate-800/50 rounded w-24" />
                  </div>
                ))}
              </>
            ) : (
              chats.map((c) => (

              <div
                key={c.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  selectedChatId === c.id
                    ? "bg-slate-800 text-white shadow-sm"
                    : "hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                {editingChatId === c.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateChat();
                        if (e.key === "Escape") setEditingChatId(null);
                      }}
                      className="flex-1 bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                    />
                    <button
                      onClick={handleUpdateChat}
                      className="text-emerald-400 hover:text-emerald-300 p-0.5"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingChatId(null)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedChatId(c.id)}
                      className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                    >
                      <MessageSquare
                        size={16}
                        className={
                          selectedChatId === c.id
                            ? "text-indigo-400"
                            : "text-slate-500"
                        }
                      />
                      <span className="text-sm truncate font-medium">
                        {c.title || "New Chat"}
                      </span>
                    </button>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => startEditingChat(e, c)}
                        className="p-1 hover:text-indigo-400"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(c.id);
                        }}
                        className="p-1 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-auto space-y-1">
          <div className="px-3 py-2 mb-2 bg-slate-800/30 rounded-lg mx-1">
            <p className="text-xs text-white font-semibold truncate">
              {user?.full_name || "QueryBuddy user"}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={onConfigureConnection}
            disabled={!selectedWorkspace}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent text-slate-400 group"
          >
            <PlugZap
              size={18}
              className="group-hover:text-amber-400 transition-colors"
            />
            <span className="text-sm">Database</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-slate-800 hover:text-white text-slate-400 group">
            <Settings
              size={18}
              className="group-hover:text-indigo-400 transition-colors"
            />
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-red-500/10 hover:text-red-400 text-slate-400"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
