import { useState, useCallback } from "react";
import api from "@/lib/api";
import { Workspace } from "@/lib/types";

export const useWorkspaces = (
  onWorkspaceSelected?: (workspace: Workspace) => void,
) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchWorkspaces = useCallback(async (selectFirst = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Workspace[]>("/workspaces");
      setWorkspaces(response.data);

      // If we have a selected workspace, refresh it from the list
      setSelectedWorkspace((current) => {
        if (current) {
          const updated = response.data.find((w) => w.id === current.id);
          return updated || current;
        }
        if (selectFirst && response.data.length > 0) {
          return response.data[0];
        }
        return null;
      });

      return response.data;
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
      setError("Failed to load workspaces");
      return [];
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, []);

  const selectWorkspace = useCallback(async (workspace: Workspace | null) => {
    if (!workspace) {
      setSelectedWorkspace(null);
      return;
    }

    // Optimistic update
    setSelectedWorkspace(workspace);

    // The list already contains database_connection due to selectinload on backend
    // So we don't strictly NEED a second fetch unless we want to force refresh
  }, []);

  const createWorkspace = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      const response = await api.post<Workspace>("/workspaces", data);
      const newWorkspace = response.data;
      setWorkspaces((prev) => [...prev, newWorkspace]);
      await selectWorkspace(newWorkspace);
      return newWorkspace;
    } catch (err) {
      console.error("Failed to create workspace", err);
      throw err;
    }
  };

  const updateWorkspace = async (workspaceId: string, name: string) => {
    try {
      const response = await api.patch<Workspace>(
        `/workspaces/${workspaceId}`,
        { name },
      );
      const updated = response.data;
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === workspaceId ? { ...w, name: updated.name } : w,
        ),
      );
      if (selectedWorkspace?.id === workspaceId) {
        setSelectedWorkspace((prev) =>
          prev ? { ...prev, name: updated.name } : null,
        );
      }
      return updated;
    } catch (err) {
      console.error("Failed to update workspace", err);
      throw err;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this workspace? This will delete all chats and database connections.",
      )
    ) {
      return false;
    }
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
      if (selectedWorkspace?.id === workspaceId) {
        setSelectedWorkspace(null);
      }
      return true;
    } catch (err) {
      console.error("Failed to delete workspace", err);
      return false;
    }
  };

  const refreshSelectedWorkspace = useCallback(async () => {
    if (selectedWorkspace) {
      await selectWorkspace(selectedWorkspace);
    }
  }, [selectedWorkspace, selectWorkspace]);

  return {
    workspaces,
    selectedWorkspace,
    setSelectedWorkspace, // Direct setter if needed
    selectWorkspace,
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    refreshSelectedWorkspace,
    setWorkspaces,
    isLoading,
    isInitialLoading,
    error,
  };
};
