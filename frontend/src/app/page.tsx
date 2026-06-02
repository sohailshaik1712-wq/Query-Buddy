"use client";

import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateWorkspaceModal from "@/components/CreateWorkspaceModal";
import DatabaseConnectionModal from "@/components/DatabaseConnectionModal";
import { useState, useEffect } from "react";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useChats } from "@/hooks/useChats";

export default function Home() {
  const {
    workspaces,
    selectedWorkspace,
    selectWorkspace,
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setSelectedWorkspace,
    setWorkspaces,
    isInitialLoading,
  } = useWorkspaces();

  const {
    chats,
    selectedChatId,
    setSelectedChatId,
    createChat,
    deleteChat,
    updateChat,
    isCreatingChat,
    isLoading: isChatsLoading,
  } = useChats(selectedWorkspace);

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces(true);
  }, [fetchWorkspaces]);

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">
            Initializing QueryBuddy...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
        <Sidebar
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          setSelectedWorkspace={selectWorkspace}
          chats={chats}
          selectedChatId={selectedChatId}
          setSelectedChatId={(id) => {
            setSelectedChatId(id);
            setIsSidebarOpen(false);
          }}
          onNewWorkspace={() => setIsWorkspaceModalOpen(true)}
          onNewChat={async () => {
            const chat = await createChat();
            if (chat) setIsSidebarOpen(false);
            return chat;
          }}
          isCreatingChat={isCreatingChat}
          onConfigureConnection={() => {
            setIsConnectionModalOpen(true);
            setIsSidebarOpen(false);
          }}
          onDeleteWorkspace={deleteWorkspace}
          onDeleteChat={deleteChat}
          onUpdateWorkspace={updateWorkspace}
          onUpdateChat={updateChat}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isChatsLoading={isChatsLoading}
        />
        <ChatInterface
          selectedWorkspace={selectedWorkspace}
          selectedChatId={selectedChatId}
          onCreateChat={createChat}
          isCreatingChat={isCreatingChat}
          onConfigureConnection={() => setIsConnectionModalOpen(true)}
          onDeleteChat={deleteChat}
          onUpdateChat={updateChat}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <CreateWorkspaceModal
          isOpen={isWorkspaceModalOpen}
          onClose={() => setIsWorkspaceModalOpen(false)}
          onSuccess={async () => {
            // Hook handles adding to list and selecting
            // but we can add manual triggers if needed.
          }}
        />
        <DatabaseConnectionModal
          isOpen={isConnectionModalOpen}
          workspace={selectedWorkspace}
          onClose={() => setIsConnectionModalOpen(false)}
          onSuccess={(updatedWorkspace) => {
            setSelectedWorkspace(updatedWorkspace);
            setWorkspaces((prev) =>
              prev.map((workspace) =>
                workspace.id === updatedWorkspace.id
                  ? updatedWorkspace
                  : workspace,
              ),
            );
          }}
        />
      </main>
    </ProtectedRoute>
  );
}
