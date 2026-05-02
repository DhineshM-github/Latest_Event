import React from "react";
import { Search } from "lucide-react";

export const ProgramCheckin = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Program Check-In / Check-Out
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-sky-600 text-white">
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Event Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Event Start Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Event End Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="hover:bg-sky-50/50 transition-colors duration-200 group bg-white">
                <td
                  colSpan="5"
                  className="text-center py-8 text-sm text-slate-500"
                >
                  No Data Found.
                </td>
              </tr>
            </tbody>

          </table>

        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between mt-4 text-gray-600 text-sm">

          <div>
            Showing 0 to 0 of 0 entries
          </div>

          <div className="flex items-center space-x-2">

            <button className="px-2 py-1 border rounded hover:bg-gray-100">
              «
            </button>

            <button className="px-2 py-1 border rounded hover:bg-gray-100">
              ‹
            </button>

            <button className="px-2 py-1 border rounded hover:bg-gray-100">
              ›
            </button>

            <button className="px-2 py-1 border rounded hover:bg-gray-100">
              »
            </button>

            <select className="border px-2 py-1 rounded">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>

          </div>

        </div>

      </div>
    </div>
  );
};