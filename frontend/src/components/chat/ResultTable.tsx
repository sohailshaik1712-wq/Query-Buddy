import React, { useState } from "react";
import { Copy, Download, Check } from "lucide-react";

interface ResultTableProps {
  results: Record<string, unknown>[];
}

const ResultTable = ({ results }: ResultTableProps) => {
  const [copied, setCopied] = useState(false);

  if (!results || results.length === 0) return null;

  const handleCopy = async () => {
    try {
      const headers = Object.keys(results[0]).join("\t");
      const rows = results
        .map((row) => Object.values(row).join("\t"))
        .join("\n");
      await navigator.clipboard.writeText(`${headers}\n${rows}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy table", err);
    }
  };

  const handleDownload = () => {
    const headers = Object.keys(results[0]).join(",");
    const rows = results
      .map((row) =>
        Object.values(row)
          .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `query_results_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-900/50 w-full max-w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Query Results
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 text-slate-400 hover:text-white transition-colors text-[10px] font-bold"
          >
            {copied ? (
              <Check size={12} className="text-emerald-400" />
            ) : (
              <Copy size={12} />
            )}
            {copied ? "COPIED" : "COPY"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2 py-1 text-slate-400 hover:text-white transition-colors text-[10px] font-bold"
          >
            <Download size={12} />
            DOWNLOAD
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-[9px] sm:text-[10px] tracking-wider">
            <tr>
              {Object.keys(results[0]).map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {results.slice(0, 5).map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                {Object.values(row).map((val, j) => (
                  <td
                    key={j}
                    className="px-4 py-3 truncate max-w-[120px] sm:max-w-[200px] border-r border-slate-800 last:border-r-0"
                  >
                    {String(val ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {results.length > 5 && (
        <div className="px-4 py-2 bg-slate-800/20 text-[9px] sm:text-[10px] text-slate-500 italic">
          Showing first 5 of {results.length} results
        </div>
      )}
    </div>
  );
};

export default ResultTable;
