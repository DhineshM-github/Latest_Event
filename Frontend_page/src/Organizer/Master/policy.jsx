import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Eye,
  Plus,
  X,
  CheckCircle,
  Trash2,
  AlertCircle,
  Info,
  Search,
} from "lucide-react";
import {
  getPolicies,
  createPolicy,
  getPolicyById,
  deletePolicy,
} from "../../Services/api";

export const PolicyPage = () => {
  const [policies, setPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    policy_name: "",
    policy_type: "",
    policy_group: "",
    description: "",
    status: "Active",
  });

  const resetForm = () => {
    setForm({
      policy_name: "",
      policy_type: "",
      policy_group: "",
      description: "",
      status: "Active",
    });
    setFieldErrors({});
  };
  const Redexorganizer = useSelector((state) => state.user);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;
  useEffect(() => {
    if (organizer?.id) {
      loadPolicies();
    }
  }, [organizer?.id]);

  // ================= TOAST =================
  const showToast = (message, type = "success") => {
    setPopup({ show: true, message, type });

    setTimeout(() => {
      setPopup({ show: false, message: "", type: "" });
    }, 3000);
  };

  // ================= LOAD =================



  const loadPolicies = async () => {
    try {
      const res = await getPolicies(organizer.id);
      setPolicies(res.data);
    } catch (error) {
      console.error("Error loading policies:", error);
    }
  };

  // ================= FORM =================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ================= SAVE =================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.policy_name) errors.policy_name = "Policy name is required";
    if (!form.policy_type) errors.policy_type = "Policy Type is required";
    if (!form.policy_group) errors.policy_group = "Policy Group is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        organizer_id: Redexorganizer?.id, // important
      };
      await createPolicy(payload);
      showToast("Policy added successfully", "success");
      resetForm();
      setShowForm(false);
      loadPolicies();
    } catch (error) {
      showToast("Failed to add policy", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= VIEW =================

  const viewPolicy = async (id) => {
    try {
      const res = await getPolicyById(id);
      setViewData(res.data);
    } catch (error) {
      showToast("Error fetching policy details");
    }
  };

  // ================= DELETE =================
  const handleDeleteConfirm = async () => {
    const id = deleteModal.id;
    if (!id) return;

    try {
      setLoading(true);
      const res = await deletePolicy(id);
      if (res.data.status) {
        showToast("✓ Policy Deleted Successfully!", "success");
        setDeleteModal({ isOpen: false, id: null });
        loadPolicies();
      } else {
        showToast(res.data.message || "Failed to delete policy", "error");
        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) {
      console.error("Error deleting policy:", error);
      showToast("Error deleting policy", "error");
      setDeleteModal({ isOpen: false, id: null });
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter((p) =>
    p.policy_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="px-6 py-4 sm:p-10 min-h-screen bg-sky-50">
      {/* TOAST */}
      {/* TOAST NOTIFICATION */}
      {popup.show && (
        <div className={`fixed top-10 right-10 z-[250] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-4 border ${
          popup.type === "success" 
            ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200" 
            : "bg-rose-600 text-white border-rose-500 shadow-rose-200"
        }`}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {popup.type === "success" ? "✓" : "!"}
          </div>
          <p className="font-bold text-sm tracking-wide">{popup.message}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-black text-sky-900 tracking-tight">
          Policy Management
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative group flex-1 sm:flex-initial">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search policy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all"
            />
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl flex gap-2 items-center justify-center font-bold shadow-lg shadow-sky-200 transition-all hover:scale-105 active:scale-95 text-sm"
          >
            <Plus size={18} />
            Add Policy
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* HEADER */}
            <thead>
              <tr className="bg-sky-600 text-white">

                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                  Action
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Policy Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Policy Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-slate-50">
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((p) => (
                  <tr key={p.id} className="hover:bg-sky-50/50 transition-colors duration-200 group"
                  >
                    {/* ACTION */}

                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => viewPolicy(p.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: p.id })}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">
                        {p.policy_code}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 truncate max-w-[150px]">
                        {p.policy_name}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {p.policy_type}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {p.policy_group}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Info size={40} />
                      <p className="font-bold">No policies found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CREATE MODAL ================= */}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] px-6 py-4">
          <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* HEADER */}
            <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Create New Policy
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Define terms and conditions for your events
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 p-2.5 rounded-full shadow-sm transition-all border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <form onSubmit={handleSubmit} noValidate className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* POLICY NAME */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Policy Name <span className="text-red-500">*</span>
                  </label>
                  <input
  name="policy_name"
  value={form.policy_name}
  onChange={handleChange}
  maxLength={20}
  className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none ${
    fieldErrors.policy_name
      ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
      : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
  }`}
  placeholder="e.g. Early Bird Policy"
  required
/>
                  {fieldErrors.policy_name && (
                    <p className="text-red-500 text-xs font-bold ml-1">
                      {fieldErrors.policy_name}
                    </p>
                  )}
                </div>

                {/* POLICY TYPE */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Policy Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="policy_type"
                    value={form.policy_type}
                    onChange={handleChange}
                    className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none appearance-none ${fieldErrors.policy_type
                      ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
                      }`}
                    required
                  >
                    <option value="">Select Type</option>
                    <option>Exhibitor</option>
                    <option>Visitor</option>
                    <option>Vendor</option>
                  </select>
                  {fieldErrors.policy_type && (
                    <p className="text-red-500 text-xs font-bold ml-1">
                      {fieldErrors.policy_type}
                    </p>
                  )}
                </div>

                {/* POLICY GROUP */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Policy Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="policy_group"
                    value={form.policy_group}
                    onChange={handleChange}
                    className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none appearance-none ${fieldErrors.policy_group
                      ? "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-100 bg-slate-50 focus:ring-blue-50 focus:border-blue-500"
                      }`}
                    required
                  >
                    <option value="">Select Group</option>
                    <option>Cancellation Policy</option>
                    <option>Refund Policy</option>
                    <option>Safety Policy</option>
                    <option>Privacy Policy</option>
                    <option>Payment Policy</option>
                  </select>
                  {fieldErrors.policy_group && (
                    <p className="text-red-500 text-xs font-bold ml-1">
                      {fieldErrors.policy_group}
                    </p>
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Policy Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Provide comprehensive details about this policy..."
                  className="w-full p-5 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none resize-none transition-all"
                />
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {loading ? "Saving..." : "Save Policy"}
                  <CheckCircle size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}

      {viewData && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex justify-center items-center z-[100] px-6 py-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Policy Details
                </span>
                <h2 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">
                  {viewData.policy_name}
                </h2>
              </div>
              <button
                onClick={() => setViewData(null)}
                className="bg-white p-3 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Type
                  </p>
                  <p className="text-lg font-bold text-slate-700">
                    {viewData.policy_type}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Group
                  </p>
                  <p className="text-lg font-bold text-slate-700">
                    {viewData.policy_group}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status
                  </p>
                  <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                    {viewData.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Code
                  </p>
                  <p className="text-lg font-black text-blue-600 tracking-wider">
                    #{viewData.policy_code}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Description
                </p>
                <div className="bg-slate-50 p-6 rounded-3xl text-slate-600 leading-relaxed font-medium italic border border-slate-100">
                  {viewData.description || "No description provided."}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setViewData(null)}
                className="px-12 py-3 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] px-6 py-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">
                Are you sure?
              </h3>
              <p className="text-slate-500 font-medium">
                Do you really want to delete this policy? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex gap-3 p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
              >
                No, Keep it
              </button>
              <button
                onClick={executeDelete}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-sky-100 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-sky-900 mb-2">Delete Policy</h2>
            <p className="text-slate-600 mb-8">
              Are you sure you want to delete this policy? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                className="px-6 py-3 border border-sky-200 rounded-xl text-sky-700 font-semibold hover:bg-sky-50 transition w-full"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
