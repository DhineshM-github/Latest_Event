import React, { useState, useEffect } from "react";
import { getProgramVerificationEvents } from "../../Services/api";
import { Eye } from "lucide-react";
export const ProgramVerification = () => {
  const [page, setPage] = useState("list");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getProgramVerificationEvents();
      console.log("Result", res)
      const formatted = res.map((item) => ({
        code: item.event_code,
        name: item.event_name,
        inprocess: 0,
        approved: 0,
        rejected: 0,
        id: item.id
      }));
      setData(formatted);
    } catch (err) {
      console.error("Error fetching program verification events:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* ================= PAGE 1 ================= */}

      {page === "list" && (
        <>
          <h1 className="text-3xl font-semibold text-gray-700 mb-6">
            Program Verification
          </h1>

          <div className="bg-white shadow rounded-lg p-6">
            <input
              type="text"
              placeholder="Search"
              className="border px-4 py-2 mb-6 w-72 rounded"
            />

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-sky-600 text-white">
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Event Code ↑↓</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Event Name ↑↓</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Inprocess</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Approved</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Rejected</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {data.map((item, index) => (
                    <tr key={index} className="hover:bg-sky-50/50 transition-colors duration-200 group bg-white">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setPage("details")}
                          className="border px-3 py-1 rounded hover:bg-gray-200"
                        >
                          <Eye size={20} />
                        </button>
                      </td>

                      <td className="px-6 py-4 text-slate-700">{item.code}</td>

                      <td className="px-6 py-4 text-slate-700 text-left">{item.name}</td>

                      <td className="px-6 py-4 text-slate-700 text-center">{item.inprocess}</td>

                      <td className="px-6 py-4 text-slate-700 text-center">{item.approved}</td>

                      <td className="px-6 py-4 text-slate-700 text-center">{item.rejected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-500">Showing 1 to 3 of 3 entries</p>

              <select className="border px-2 py-1">
                <option>10</option>
                <option>20</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* ================= PAGE 2 ================= */}

      {page === "details" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-700">
              Program Verification
            </h1>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by Program Names"
                className="border px-4 py-2 rounded"
              />

              <select className="border px-3 py-2 rounded">
                <option>All</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>

              <button className="border px-4 py-2 rounded">🔍</button>
            </div>
          </div>

          <button
            onClick={() => setPage("list")}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </>
      )}
    </div>
  );
};