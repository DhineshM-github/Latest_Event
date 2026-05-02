import React, { useState } from "react";
import { Plus, Search, Eye, Filter } from "lucide-react";

export default function AddonCheckIn() {
  const [search, setSearch] = useState("");

  const dummyData = [
    { id: 1, addon: "Lunch Buffet", code: "AD-101", visitor: "John Doe", time: "10:30 AM", status: "Checked-In" },
    { id: 2, addon: "Networking Dinner", code: "AD-102", visitor: "Jane Smith", time: "06:15 PM", status: "Pending" },
    { id: 3, addon: "Workshop Access", code: "AD-103", visitor: "Alice Brown", time: "09:00 AM", status: "Checked-In" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add-On Check-In / Check-Out</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search by visitor or code..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Add New Entry
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-sky-600 text-white">
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Add-On Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dummyData.map((row) => (
                <tr key={row.id} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-sky-900">{row.addon}</td>
                  <td className="px-6 py-4 text-slate-700">{row.code}</td>
                  <td className="px-6 py-4 text-slate-600">{row.visitor}</td>
                  <td className="px-6 py-4 text-slate-600">{row.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === "Checked-In" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}