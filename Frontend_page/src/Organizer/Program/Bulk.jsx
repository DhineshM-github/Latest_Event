import React, { useState, useEffect } from "react"
import { getEventPasses, getEventBulkDetails } from "../../Services/api"
import { Eye, Download, Search } from "lucide-react"

const BulkPassPage = () => {

  const [page, setPage] = useState("list")
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [details, setDetails] = useState([])
  const [search, setSearch] = useState("")
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getEventPasses().then((data) => {
      const formatted = data.map((item) => ({
        id: item.id,
        eventCode: item.event_code,
        eventName: item.event_name,
        bulkCount: item.total_visitors || 0
      }))
      setEvents(formatted)
    }).catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (selectedEvent && page === "detail") {
      setLoading(true)
      getEventBulkDetails()
        .then(data => {
          const filtered = data.filter(item => item.event_id === selectedEvent.id)
          setDetails(filtered)
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [selectedEvent, page])

  const filtered = events.filter(e =>
    e.eventCode.toLowerCase().includes(search.toLowerCase()) ||
    e.eventName.toLowerCase().includes(search.toLowerCase())
  )

  const filteredDetails = details.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.visitor_code.toLowerCase().includes(search.toLowerCase())
  )

  return (

    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Bulk and Pass Generation
      </h1>

      {/* ================= LIST PAGE ================= */}
      {page === "list" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* TABLE */}

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

            <table className="w-full">

              <thead>
                <tr className="bg-sky-600 text-white">

                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Action</th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Event Code</th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Event Name</th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Bulk Registration Count</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-50">

                {filtered.map((event, index) => (

                  <tr key={index} className="hover:bg-sky-50/50 transition-colors duration-200 group">

                    <td className="px-6 py-4 text-center">

                      <button
                        onClick={() => {

                          setSelectedEvent(event)
                          setPage("detail")
                          setSearch("")

                        }}
                        className="text-blue-600 hover:scale-110"
                      >

                        <Eye size={18} />

                      </button>

                    </td>

                    <td className="px-6 py-4 text-blue-600">{event.eventCode}</td>

                    <td className="px-6 py-4 text-blue-600">{event.eventName}</td>

                    <td className="px-6 py-4">{event.bulkCount}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <Pagination total={filtered.length} perPage={perPage} setPerPage={setPerPage} />

        </div>

      )}

      {/* ================= DETAIL PAGE ================= */}
      {page === "detail" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>


          </div>

          {/* TABLE */}

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

            <table className="w-full">

              <thead>
                <tr className="bg-sky-600 text-white">

                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Visitor Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Visitor Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Registered On</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-50">

                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      Loading details...
                    </td>
                  </tr>
                ) : filteredDetails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      No Data Found for {selectedEvent?.eventName}
                    </td>
                  </tr>
                ) : (
                  filteredDetails.map((item, idx) => (
                    <tr key={idx} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                      <td className="px-6 py-4 text-center">
                        <button className="text-blue-600 hover:scale-110" title="Download Pass">
                          <Download size={16} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-blue-600">{item.visitor_code}</td>
                      <td className="px-6 py-4">{item.name}</td>
                      <td className="px-6 py-4">{item.email}</td>
                      <td className="px-6 py-4">{item.phone}</td>
                      <td className="px-6 py-4">{item.created_at}</td>
                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

          {/* BACK BUTTON */}

          <div className="mt-6">
            <button
              onClick={() => {
                setPage("list")
                setSearch("")
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back
            </button>
          </div>

        </div>

      )}

    </div>

  )

}

export default BulkPassPage;

function Pagination({ total, perPage, setPerPage }) {

  const showing = total === 0
    ? "0 to 0 of 0"
    : `1 to ${Math.min(total, perPage)} of ${total}`

  return (

    <div className="flex items-center justify-between pt-4 pb-2 text-sm text-gray-600">

      <span>Showing {showing} entries</span>

      <div className="flex items-center gap-1">
        <button className="px-2 py-1 text-gray-400 hover:text-blue-600 transition">«</button>
        <button className="px-2 py-1 text-gray-400 hover:text-blue-600 transition">‹</button>
        <button className="w-7 h-7 rounded text-white text-xs bg-blue-600 font-medium">
          1
        </button>
        <button className="px-2 py-1 text-gray-400 hover:text-blue-600 transition">›</button>
        <button className="px-2 py-1 text-gray-400 hover:text-blue-600 transition">»</button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Items per page:</span>
        <select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="border rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
        >

          <option>10</option>
          <option>25</option>
          <option>50</option>

        </select>
      </div>

    </div>

  )

}