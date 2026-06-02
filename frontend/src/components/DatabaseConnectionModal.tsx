"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Database, Loader2, X } from "lucide-react";
import api, { getErrorMessage } from "@/lib/api";
import { Workspace } from "@/lib/types";

const connectionSchema = z.object({
  db_type: z.literal("postgresql"),
  host: z.string().min(1, "Host is required"),
  port: z.number().int().positive("Port must be a positive number"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

interface DatabaseConnectionModalProps {
  isOpen: boolean;
  workspace: Workspace | null;
  onClose: () => void;
  onSuccess: (workspace: Workspace) => void;
}

export default function DatabaseConnectionModal({
  isOpen,
  workspace,
  onClose,
  onSuccess,
}: DatabaseConnectionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      db_type: "postgresql",
      host: "localhost",
      port: 5432,
      database: "",
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!workspace) return;

    reset({
      db_type: "postgresql",
      host: workspace.database_connection?.host ?? "localhost",
      port: workspace.database_connection?.port ?? 5432,
      database: workspace.database_connection?.database ?? "",
      username: workspace.database_connection?.username ?? "",
      password: "",
    });
  }, [reset, workspace]);

  const onSubmit = async (data: ConnectionFormValues) => {
    if (!workspace) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(`/workspaces/${workspace.id}/connection`, {
        ...data,
        extra_params: {},
      });
      const workspaceResponse = await api.get<Workspace>(
        `/workspaces/${workspace.id}`,
      );
      onSuccess(workspaceResponse.data);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save database connection"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!workspace || !workspace.database_connection) return;
    if (!confirm("Are you sure you want to delete this database connection?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await api.delete(`/workspaces/${workspace.id}/connection`);
      const workspaceResponse = await api.get<Workspace>(
        `/workspaces/${workspace.id}`,
      );
      onSuccess(workspaceResponse.data);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete database connection"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !workspace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 text-white">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Database className="text-indigo-500" size={20} />
            Database Connection
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Type
              </label>
              <select
                {...register("db_type")}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              >
                <option value="postgresql">PostgreSQL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Port
              </label>
              <input
                {...register("port", { valueAsNumber: true })}
                type="number"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              />
              {errors.port && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.port.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Host
            </label>
            <input
              {...register("host")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              placeholder="localhost"
            />
            {errors.host && (
              <p className="mt-1 text-xs text-red-400">{errors.host.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Database
            </label>
            <input
              {...register("database")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              placeholder="analytics"
            />
            {errors.database && (
              <p className="mt-1 text-xs text-red-400">
                {errors.database.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <input
                {...register("username")}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                placeholder="postgres"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                placeholder={
                  workspace.database_connection
                    ? "Enter new password"
                    : "Password"
                }
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg flex items-center justify-center disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  "Save Connection"
                )}
              </button>
            </div>
            {workspace.database_connection && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="w-full px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-medium flex items-center justify-center"
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  "Delete Connection"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
