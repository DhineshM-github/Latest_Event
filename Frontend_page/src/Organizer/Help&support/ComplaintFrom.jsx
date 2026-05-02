import React, { useState, useEffect } from "react";
import { getComplaints, getApprovedEvents, createComplaint, deleteComplaint } from "../../Services/api";
import { Trash2, Plus, Search, ArrowLeft, Star, AlertCircle, XCircle, Eye } from "lucide-react";

function StarRating({ rating, setRating }) {
  return (
    <div className="flex gap-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={22}
          onClick={() => setRating(star)}
          className={`transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function Toast({ isOpen, type, message, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
      <div className="fixed top-6 right-6 z-[9999] animate-slideIn">
        <div className={`flex items-center gap-4 px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-l-4 transform transition-all ${isSuccess ? "bg-white border-green-500 text-green-800" : "bg-white border-red-500 text-red-800"
          }`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSuccess ? "bg-green-50" : "bg-red-50"
            }`}>
            {isSuccess ? (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{isSuccess ? "Success" : "Notification"}</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default function ComplaintPage() {
  const [showForm, setShowForm] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [event, setEvent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [errors, setErrors] = useState({});

  const [ratings, setRatings] = useState({
    infrastructure: 0,
    amenities: 0,
    experience: 0,
    venue: 0,
    transport: 0,
    convenience: 0
  });

  const [toast, setToast] = useState({ isOpen: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ isOpen: true, type, message });
  };

  const closeToast = () => {
    setToast({ ...toast, isOpen: false });
  };

  useEffect(() => {
    loadComplaints();
    loadEvents();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await getApprovedEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteComplaint(deletingId);
      if (res.success) {
        showToast("success", "Complaint deleted successfully");
        loadComplaints();
      } else {
        showToast("error", "Failed to delete");
      }
    } catch (err) {
      showToast("error", "Error deleting complaint");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
  };

  const submitComplaint = async () => {
    let newErrors = {};
    if (!event) newErrors.event = "Please select an event";
    if (!explanation.trim()) newErrors.explanation = "Please provide an explanation";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const payload = {
        event_id: event,
        explanation: explanation,
        infrastructure_rating: ratings.infrastructure,
        amenities_rating: ratings.amenities,
        overall_experience_rating: ratings.experience,
        venue_locations_rating: ratings.venue,
        transportation_rating: ratings.transport,
        convenience_rating: ratings.convenience
      };

      const res = await createComplaint(payload);

      if (res.success) {
        showToast("success", "Complaint submitted successfully");
        setShowForm(false);
        loadComplaints();
        resetForm();
      } else {
        showToast("error", "Failed: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      showToast("error", "Failed to submit complaint");
    }
  };

  const resetForm = () => {
    setEvent("");
    setExplanation("");
    setErrors({});
    setRatings({
      infrastructure: 0,
      amenities: 0,
      experience: 0,
      venue: 0,
      transport: 0,
      convenience: 0
    });
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-8 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setShowForm(false)}
              className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">New Complaint Information</h2>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              {/* Left Column: Event & Explanation */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Event <span className="text-red-500">*</span> </label>
                  <select
                    value={event}
                    onChange={(e) => { setEvent(e.target.value); setErrors(prev => ({ ...prev, event: "" })); }}
                    className={`w-full bg-gray-50 border ${errors.event ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer`}
                  >
                    <option value="">Choose an event</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>{e.event_name}</option>
                    ))}
                  </select>
                  {errors.event && (
                    <p className="text-red-500 text-xs mt-1.5 ml-1 animate-pulse">
                      {errors.event}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation <span className="text-red-500">*</span></label>
                  <textarea
                    value={explanation}
                    onChange={(e) => { setExplanation(e.target.value); setErrors(prev => ({ ...prev, explanation: "" })); }}
                    className={`w-full bg-gray-50 border ${errors.explanation ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl px-6 py-4 h-44 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none`}
                    placeholder="Describe your issue in detail..."
                  />
                  {errors.explanation && (
                    <p className="text-red-500 text-xs mt-1.5 ml-1 animate-pulse">
                      {errors.explanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Ratings */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-6">Service Ratings</h3>
                <div className="space-y-5">
                  {Object.keys(ratings).map((key) => (
                    <div key={key} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                      <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                      <StarRating
                        rating={ratings[key]}
                        setRating={(val) => setRatings(prev => ({ ...prev, [key]: val }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-8 py-3 rounded-xl border border-gray-300 font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitComplaint}
                className="px-10 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>

        <Toast isOpen={toast.isOpen} type={toast.type} message={toast.message} onClose={closeToast} />
      </div>
    );
  }

  const filteredComplaints = complaints.filter(c =>
    c.complaint_code.toLowerCase().includes(search.toLowerCase()) ||
    c.event_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Complaints Management</h1>
            <p className="text-gray-500 font-medium tracking-wide">Monitor and resolve event-related feedback</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="group flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-2xl text-white font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-100"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Raise Complaint
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code or event name..."
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-sky-600 text-white">
                  <th className="px-6 py-4 text-center text-xs font-bold text-white  tracking-wider">Actions</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">Complaint CODE</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">Event Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white  tracking-wider">Created On</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <Search size={28} className="text-gray-300" />
                        </div>
                        <p className="text-xl font-bold text-gray-400">No complaints found</p>
                        <p className="text-gray-400 font-medium">Try a different search term or raise a new complaint</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                      <td className="px-6 py-6 border-b border-gray-50">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setViewingComplaint(c)}
                            className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all active:scale-90"
                            title="View Details"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all active:scale-90"
                            title="Delete"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-6 border-b border-gray-50">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-xs tracking-wider">
                          {c.complaint_code}
                        </span>
                      </td>
                      <td className="px-6 py-6 border-b border-gray-50">
                        <p className="font-bold text-gray-800">{c.event_name}</p>
                      </td>
                      <td className="px-6 py-6 border-b border-gray-50">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 border-b border-gray-50 font-medium text-gray-500">
                        {c.created_on}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Complaint?</h3>
              <p className="text-gray-500 font-medium">This action cannot be undone. Are you sure you want to remove this record?</p>
            </div>

            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-6 py-4 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast isOpen={toast.isOpen} type={toast.type} message={toast.message} onClose={closeToast} />

      {/* View Modal */}
      {viewingComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Complaint Details</h3>
                <p className="text-sm text-blue-600 font-mono mt-1">{viewingComplaint.complaint_code}</p>
              </div>
              <button
                onClick={() => setViewingComplaint(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Name</label>
                    <p className="text-lg font-bold text-gray-900">{viewingComplaint.event_name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Explanation</label>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed italic">
                      "{viewingComplaint.explanation}"
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Ratings Received</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Infrastructure', val: viewingComplaint.infrastructure_rating },
                      { label: 'Amenities', val: viewingComplaint.amenities_rating },
                      { label: 'Experience', val: viewingComplaint.overall_experience_rating },
                      { label: 'Venue', val: viewingComplaint.venue_locations_rating },
                      { label: 'Transport', val: viewingComplaint.transportation_rating },
                      { label: 'Convenience', val: viewingComplaint.convenience_rating },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={`${star <= item.val ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewingComplaint(null)}
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

