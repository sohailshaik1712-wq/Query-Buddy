import React from "react";

interface ResultTableProps {
  results: Record<string, unknown>[];
}

const ResultTable = ({ results }: ResultTableProps) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-900/50 w-full max-w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-[9px] sm:text-[10px] tracking-wider">
            <tr>
              {Object.keys(results[0]).map((key) => (
                <th key={key} className="px-4 py-3 font-semibold whitespace-nowrap">
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
