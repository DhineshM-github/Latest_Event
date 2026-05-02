import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMyBookings, getBookingById, updateBooking } from "../Services/api";

const MyBookings = () => {
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [modalType, setModalType] = useState("");
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reduxUser = useSelector((state) => state.user);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const user = reduxUser?.id ? reduxUser : storedUser;

  useEffect(() => {
  if (user?.id) {
    fetchBookings();
  }
}, [user?.id]);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyBookings(user.id);
      if (res.success) {
        setBookings(res.data);
      } else {
        setError("Failed to fetch bookings");
      }
    } catch (err) {
      setError("An error occurred while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const openView = async (id) => {
    try {
      const res = await getBookingById(id);
      if (res.success) {
        setSelectedData(res.data);
        setModalType("view");
      }
    } catch (err) {
      setError("Failed to load booking details");
    }
  };

  const openEdit = async (id) => {
    try {
      const res = await getBookingById(id);
      if (res.success) {
        setForm(res.data);
        setModalType("edit");
      }
    } catch (err) {
      setError("Failed to load booking for editing");
    }
  };

  const closeModal = () => {
    setModalType("");
    setSelectedData(null);
    setForm({});
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      setError("");
      const res = await updateBooking(form.id, form);
      if (res.success) {
        setError("");
        closeModal();
        fetchBookings();
      } else {
        setError("Failed to update booking");
      }
    } catch (err) {
      setError("An error occurred while updating");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* HEADER */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                My Stall Bookings
              </h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">
                Manage and view your event stall bookings
              </p>
              <button 
                onClick={() => navigate("/exhibitor/dashboard")}
                className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-all hover:-translate-x-1"
              >
                ← Back to Home
              </button>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-blue-700 font-semibold">
                {bookings.length} Booking{bookings.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3 animate-in fade-in duration-300">
            <span className="text-lg mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-12 h-12">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-spin"
                style={{ opacity: 0.2 }}
              ></div>
              <div className="absolute inset-2 bg-white rounded-full"></div>
            </div>
            <p className="text-slate-500 mt-4 font-medium">
              Loading your bookings...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-slate-500 text-center">
              You haven't made any stall bookings yet. Start by creating your
              first booking!
            </p>
          </div>
        ) : (
          /* CARD GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((item, index) => (
              <div
                key={item.id}
                className="group relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* STATUS BADGE */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.status?.charAt(0).toUpperCase() +
                      item.status?.slice(1) || "Pending"}
                  </span>
                </div>

                {/* EVENT NAME */}
                <h2 className="text-lg font-bold text-slate-900 mb-1 pr-20 line-clamp-2">
                  {item.event_name}
                </h2>

                {/* DIVIDER */}
                <div className="h-px bg-gradient-to-r from-slate-200 to-transparent my-3"></div>

                {/* INFO GRID */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">👤</span>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Organizer
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.first_name} {item.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📞</span>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Contact
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.mobile}
                      </p>
                    </div>
                  </div>

                  {item.company_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🏢</span>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Company
                        </p>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {item.company_name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => openView(item.id)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-md active:scale-95"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => openEdit(item.id)}
                    disabled={
                      item.status === "approved" || item.status === "confirmed"
                    }
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all duration-200
    ${
      item.status === "approved" || item.status === "confirmed"
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md active:scale-95"
    }
  `}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {modalType && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {modalType === "view" ? "Booking Details" : "Edit Booking"}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors duration-200 text-slate-500 hover:text-slate-700 font-semibold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="px-8 py-6">
              {/* ERROR IN MODAL */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* VIEW MODAL */}
              {modalType === "view" && selectedData && (
                <div className="space-y-6">
                  {/* EVENT INFO */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                      Event
                    </h3>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedData.event_name}
                    </p>
                  </div>

                  {/* TWO COLUMN GRID */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* PERSONAL INFO */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Full Name
                        </label>
                        <p className="text-slate-900 font-semibold mt-1">
                          {selectedData.first_name} {selectedData.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Email
                        </label>
                        <p className="text-slate-900 font-semibold mt-1 break-all">
                          {selectedData.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Mobile
                        </label>
                        <p className="text-slate-900 font-semibold mt-1">
                          {selectedData.mobile}
                        </p>
                      </div>
                    </div>

                    {/* COMPANY INFO */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Company
                        </label>
                        <p className="text-slate-900 font-semibold mt-1">
                          {selectedData.company_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Designation
                        </label>
                        <p className="text-slate-900 font-semibold mt-1">
                          {selectedData.designation}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Status
                        </label>
                        <p className="text-slate-900 font-semibold mt-1 capitalize">
                          {selectedData.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS INFO */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Address
                    </label>
                    <p className="text-slate-900 font-semibold mt-2">
                      {selectedData.address}
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          City
                        </p>
                        <p className="text-slate-900 font-semibold text-sm">
                          {selectedData.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          State
                        </p>
                        <p className="text-slate-900 font-semibold text-sm">
                          {selectedData.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Pincode
                        </p>
                        <p className="text-slate-900 font-semibold text-sm">
                          {selectedData.pin_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* STALL & PRODUCTS */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Stall Area
                      </label>
                      <p className="text-slate-900 font-semibold mt-1">
                        {selectedData.stall_area}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Products
                      </label>
                      <p className="text-slate-900 font-semibold mt-1">
                        {selectedData.products}
                      </p>
                    </div>
                  </div>

                  {/* MESSAGES */}
                  {selectedData.messages && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <label className="text-xs font-bold uppercase tracking-wide text-blue-700">
                        Additional Messages
                      </label>
                      <p className="text-slate-900 mt-2 leading-relaxed">
                        {selectedData.messages}
                      </p>
                    </div>
                  )}

                  {/* VISITING CARD PREVIEW */}
                  {selectedData.visiting_card_url && (
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-3">
                        Visiting Card
                      </label>
                      <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 transition-all hover:shadow-lg">
                        <img 
                          src={selectedData.visiting_card_url} 
                          alt="Visiting Card"
                          className="w-full h-auto object-contain max-h-[300px] mx-auto"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <a 
                            href={selectedData.visiting_card_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full block text-center py-2 bg-white/90 text-slate-900 rounded-lg font-bold text-sm backdrop-blur hover:bg-white transition-colors"
                          >
                            Open Original Large Image ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EDIT MODAL */}
              {modalType === "edit" && (
                <div>
                  <div className="space-y-4">
                    {/* NAME FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={form.first_name || ""}
                          onChange={handleChange}
                          placeholder="First Name"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={form.last_name || ""}
                          onChange={handleChange}
                          placeholder="Last Name"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                    </div>

                    {/* CONTACT FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email || ""}
                          onChange={handleChange}
                          placeholder="Email"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          Mobile
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={form.mobile || ""}
                          onChange={handleChange}
                          placeholder="Mobile"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                    </div>

                    {/* COMPANY FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company_name"
                          value={form.company_name || ""}
                          onChange={handleChange}
                          placeholder="Company Name"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          Designation
                        </label>
                        <input
                          type="text"
                          name="designation"
                          value={form.designation || ""}
                          onChange={handleChange}
                          placeholder="Designation"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                    </div>

                    {/* LOCATION FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={form.country || ""}
                          onChange={handleChange}
                          placeholder="Country"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={form.state || ""}
                          onChange={handleChange}
                          placeholder="State"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                    </div>

                    {/* CITY & PINCODE */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city || ""}
                          onChange={handleChange}
                          placeholder="City"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pin_code"
                          value={form.pin_code || ""}
                          onChange={handleChange}
                          placeholder="Pincode"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                    </div>

                    {/* STALL & PRODUCTS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          Stall Area
                        </label>
                        <input
                          type="text"
                          name="stall_area"
                          value={form.stall_area || ""}
                          onChange={handleChange}
                          placeholder="Stall Area"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                          Products
                        </label>
                        <input
                          type="text"
                          name="products"
                          value={form.products || ""}
                          onChange={handleChange}
                          placeholder="Products"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                    </div>

                    {/* TEXTAREA FIELDS */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={form.address || ""}
                        onChange={handleChange}
                        placeholder="Full Address"
                        rows="3"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2 block">
                        Additional Messages
                      </label>
                      <textarea
                        name="messages"
                        value={form.messages || ""}
                        onChange={handleChange}
                        placeholder="Any additional messages or notes"
                        rows="3"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium resize-none"
                      />
                    </div>

                    {/* CURRENT VISITING CARD PREVIEW (In Edit Modal) */}
                    {form.visiting_card_url && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-2">
                          Current Visiting Card
                        </label>
                        <img 
                          src={form.visiting_card_url} 
                          alt="Current Card"
                          className="h-32 w-auto rounded border border-slate-300 object-contain shadow-sm"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">Uploading a new card in the main form will replace this.</p>
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={closeModal}
                        className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:shadow-lg active:scale-95"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
