import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { Chat, Workspace } from "@/lib/types";

export const useChats = (workspace: Workspace | null) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!workspace) {
      setChats([]);
      setSelectedChatId(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get<Chat[]>(
        `/chats/workspace/${workspace.id}`,
      );
      setChats(response.data);

      // Auto-select first chat if none selected or current not in list
      setSelectedChatId((current) => {
        if (current && response.data.some((chat) => chat.id === current)) {
          return current;
        }
        return response.data[0]?.id ?? null;
      });
    } catch (err) {
      console.error("Failed to fetch chats", err);
      setChats([]);
      setSelectedChatId(null);
    } finally {
      setIsLoading(false);
    }
  }, [workspace]);

  // Refetch when workspace changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchChats();
  }, [fetchChats]);

  const createChat = async () => {
    if (!workspace || isCreatingChat) return null;

    setIsCreatingChat(true);
    try {
      const response = await api.post<Chat>("/chats", {
        workspace_id: workspace.id,
        title: "New Chat",
      });
      setChats((prev) => [response.data, ...prev]);
      setSelectedChatId(response.data.id);
      return response.data;
    } catch (err) {
      console.error("Failed to create chat", err);
      return null;
    } finally {
      setIsCreatingChat(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return false;
    try {
      await api.delete(`/chats/${chatId}`);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
      return true;
    } catch (err) {
      console.error("Failed to delete chat", err);
      return false;
    }
  };

  const updateChat = async (chatId: string, title: string) => {
    try {
      const response = await api.patch<Chat>(`/chats/${chatId}`, { title });
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, title: response.data.title } : c,
        ),
      );
      return response.data;
    } catch (err) {
      console.error("Failed to update chat", err);
      throw err;
    }
  };

  return {
    chats,
    selectedChatId,
    setSelectedChatId,
    isCreatingChat,
    isLoading,
    fetchChats,
    createChat,
    deleteChat,
    updateChat,
  };
};
