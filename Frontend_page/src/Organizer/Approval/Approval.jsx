import React, { useEffect, useState } from "react";
import {
  getAllBookings,
  getapprovalBookingById,
  updateBookingStatus,
} from "../../Services/api";
import { ChevronDown, X, Eye } from "lucide-react";

const AdminApproval = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = async (id) => {
    try {
      setLoading(true);
      const data = await getapprovalBookingById(id);
      setSelectedBooking(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to fetch details");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: newStatus } : b
        )
      );

      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-700 border border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getStatusSelectColor = (status) => {
    switch (status) {
      case "approved":
        return "text-emerald-700 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200";
      case "rejected":
        return "text-red-700 border-red-300 focus:border-red-500 focus:ring-red-200";
      case "pending":
        return "text-amber-700 border-amber-300 focus:border-amber-500 focus:ring-amber-200";
      default:
        return "text-gray-700 border-gray-300 focus:border-gray-500 focus:ring-gray-200";
    }
  };

  const filteredBookings = bookings.filter((b) =>
    (b.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.eventName || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.company_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Stall Bookings
        </h1>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <p className="text-sm font-medium text-blue-900">
            Total Bookings: <span className="font-bold text-lg">{filteredBookings.length}</span>
          </p>
        </div>
      </div>

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
            <svg className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-slate-600 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Table Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-sky-600 text-white">
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      First Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {booking.first_name}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {booking.eventName}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-700 text-sm font-medium">
                          {booking.company_name}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusChange(booking.id, e.target.value)
                          }
                          className={`inline-block px-3 py-1.5 text-sm font-medium rounded-full border bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none ${getStatusSelectColor(
                            booking.status
                          )}`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 8px center",
                            paddingRight: "28px",
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleView(booking.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6 py-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          {/* Modal Content */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                Booking Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="space-y-4 w-full max-w-xs">
                  <div className="h-4 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded-full animate-pulse w-5/6"></div>
                </div>
              </div>
            ) : (
              <div className="px-8 py-6 space-y-8">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-600  tracking-wider mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">
                        Full Name
                      </label>
                      <p className="text-slate-900 font-medium text-lg">
                        {selectedBooking.first_name} {selectedBooking.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">
                        Email
                      </label>
                      <p className="text-slate-900 font-medium text-sm break-all">
                        {selectedBooking.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Mobile
                      </label>
                      <p className="text-slate-900 font-medium font-mono">
                        {selectedBooking.mobile}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Designation
                      </label>
                      <p className="text-slate-900 font-medium">
                        {selectedBooking.designation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Information Section */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-sm font-semibold text-slate-600 tracking-wider mb-4">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Company Name
                      </label>
                      <p className="text-slate-900 font-medium">
                        {selectedBooking.company_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Products
                      </label>
                      <p className="text-slate-900 font-medium">
                        {selectedBooking.products}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Event Name
                      </label>
                      <p className="text-slate-900 font-medium">
                        {selectedBooking.eventName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-sm font-semibold text-slate-600  tracking-wider mb-4">
                    Address Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Country
                      </label>
                      <p className="text-slate-900 font-medium">
                        {selectedBooking.country}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        State
                      </label>
                      <p className="text-slate-900 font-medium">
                        {selectedBooking.state}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        City
                      </label>
                      <p className="text-slate-900 font-medium">
                        {selectedBooking.city}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Pin Code
                      </label>
                      <p className="text-slate-900 font-medium font-mono">
                        {selectedBooking.pin_code}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Full Address
                      </label>
                      <p className="text-slate-900 font-medium">
                        {selectedBooking.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Details Section */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-sm font-semibold text-slate-600  tracking-wider mb-4">
                    Booking Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Stall Area
                      </label>
                      <p className="text-slate-900 font-medium">
                        {selectedBooking.stall_area}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500  mb-2">
                        Message
                      </label>
                      <p className="text-slate-900 font-medium bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {selectedBooking.messages || "No message provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-sm font-semibold text-slate-600  tracking-wider mb-4">
                    Approval Status
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                      selectedBooking.status
                    )}`}>
                      {selectedBooking.status.charAt(0).toUpperCase() +
                        selectedBooking.status.slice(1)}
                    </span>
                    <select
                      value={selectedBooking.status}
                      onChange={(e) =>
                        handleStatusChange(selectedBooking.id, e.target.value)
                      }
                      className={`px-4 py-2 text-sm font-medium rounded-lg border bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getStatusSelectColor(
                        selectedBooking.status
                      )}`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 8px center",
                        paddingRight: "28px",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Visiting Card Section */}
                {selectedBooking.visiting_card_url && (
                  <div className="border-t border-slate-200 pt-8">
                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                      Visiting Card
                    </h3>
                    <div className="bg-slate-50 px-6 py-4 rounded-lg border border-slate-200 overflow-hidden">
                      <img
                        src={selectedBooking.visiting_card_url}
                        alt="visiting card"
                        className="w-full h-auto rounded-lg object-contain max-h-[400px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-8 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproval;