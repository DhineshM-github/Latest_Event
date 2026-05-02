import { useState } from "react";
import { Search } from "lucide-react";

export default function PassGeneration() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Pass Generation
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search Keyword..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-sky-600 text-white">
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    Event Code
                    <span className="flex flex-col gap-[1px]">
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 0L7.5 4.5H0.5L4 0Z" fill="#94a3b8" /></svg>
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 5L0.5 0.5H7.5L4 5Z" fill="#94a3b8" /></svg>
                    </span>
                  </span>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    Event Name
                    <span className="flex flex-col gap-[1px]">
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 0L7.5 4.5H0.5L4 0Z" fill="#94a3b8" /></svg>
                      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 5L0.5 0.5H7.5L4 5Z" fill="#94a3b8" /></svg>
                    </span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="hover:bg-sky-50/50 transition-colors duration-200 group">
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                  No Data Found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, borderTop: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: 13, color: "#64748b", marginRight: 8 }}>Showing 0 to 0 of 0 entries</span>

          {["«", "‹", "›", "»"].map((ch) => (
            <button key={ch} disabled style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 13, color: "#64748b", background: "white", cursor: "not-allowed", opacity: 0.4 }}>
              {ch}
            </button>
          ))}

          <select style={{ border: "1px solid #cbd5e1", borderRadius: 4, padding: "4px 8px", fontSize: 13, color: "#475569", background: "white", marginLeft: 4 }}>
            <option>10</option>
          </select>
        </div>

      </div>
    </div>
  );
}