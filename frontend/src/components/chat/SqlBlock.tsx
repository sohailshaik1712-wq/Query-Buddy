import React, { useState } from "react";
import { Terminal, Edit2, Play, Loader2 } from "lucide-react";

interface SqlBlockProps {
  sql: string;
  onExecute: (newSql: string) => Promise<void>;
  isExecuting: boolean;
}

const SqlBlock = ({ sql, onExecute, isExecuting }: SqlBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(sql);

  const handleRun = async () => {
    if (!editValue.trim()) return;
    await onExecute(editValue.trim());
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-800/50 border-b border-slate-800">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-slate-400">
          <Terminal size={12} className="sm:w-[14px] sm:h-[14px]" />
          postgresql
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleRun}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-colors disabled:opacity-50"
              >
                {isExecuting ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Play size={10} fill="currentColor" />
                )}
                {isExecuting ? "RUNNING" : "RUN"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isExecuting}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditValue(sql);
              }}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-bold transition-all border border-slate-700"
            >
              <Edit2 size={10} />
              EDIT
            </button>
          )}
        </div>
      </div>
      {isEditing ? (
        <textarea
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full bg-slate-950 p-3 sm:p-4 text-xs sm:text-sm font-mono text-indigo-300 outline-none min-h-[100px] resize-y"
          spellCheck={false}
        />
      ) : (
        <pre className="p-3 sm:p-4 text-xs sm:text-sm font-mono text-indigo-300 overflow-x-auto whitespace-pre">
          {sql}
        </pre>
      )}
    </div>
  );
};

export default SqlBlock;
