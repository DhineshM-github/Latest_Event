import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, Plus, X, CheckCircle, AlertCircle, Trash2, Search } from "lucide-react";

import { getSponsors, getSponsorById, createSponsor, deleteSponsor } from "../../Services/api";

export const SponsorshipPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [form, setForm] = useState({
    sponsor_name: "",
    primary_contact: "",
    secondary_contact: "",
    mail_id: "",
    address: "",
    status: "Active",
    sponsor_image: "",
  });

  const [documents, setDocuments] = useState([
    {
      document_type: "",
      document_number: "",
      document_file: "",
      preview: "",
    },
  ]);

  useEffect(() => {
    loadSponsors();
  }, []);

  // Auto-close toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ================= TOAST NOTIFICATION =================

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // ================= LOAD SPONSORS =================

  const loadSponsors = async () => {
    try {
      const res = await getSponsors();
      setSponsors(res);
    } catch (error) {
      showToast("Failed to load sponsors", "error");
    }
  };

  // ================= FORM =================

  const handleChange = (e) => {
    let { name, value } = e.target;
    setErrors({ ...errors, [name]: "" });

    // 1. Spacing Restriction
    if (typeof value === "string") {
      if (name === "mail_id" || name === "primary_contact" || name === "secondary_contact") {
        value = value.replace(/\s/g, ""); // No spaces allowed at all
      } else {
        value = value.trimStart(); // No leading spaces
      }
    }

    // 2. Contact Number Restriction (Numbers Only, Max 10 digits)
    if (name === "primary_contact" || name === "secondary_contact") {
      if (value !== "" && !/^\d*$/.test(value)) {
        return; // Block alphabets/special chars
      }
      if (value.length > 10) return; // Restrict to 10 digits
    }

    setForm({ ...form, [name]: value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      setImagePreview(reader.result);

      setForm({
        ...form,
        sponsor_image: reader.result,
      });
    };
  };

  // ================= DOCUMENT =================

  const handleDocChange = (e, index) => {
    const temp = [...documents];
    let { name, value } = e.target;

    if (name === "document_number") {
      const type = temp[index].document_type;
      if (type === "Aadhar") {
        value = value.replace(/\D/g, "").slice(0, 12);
      } else if (type === "PAN") {
        value = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
      }
    }

    temp[index][name] = value;
    setDocuments(temp);
  };

  const handleDocument = (e, index) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      const temp = [...documents];

      temp[index].document_file = reader.result;
      temp[index].preview = reader.result;

      setDocuments(temp);
    };
  };

  const addDocument = () => {
    if (documents.length >= 3) {
      showToast("Maximum 3 documents allowed", "error");
      return;
    }

    // Check if the current last document has a file uploaded
    const lastDoc = documents[documents.length - 1];
    if (lastDoc && !lastDoc.document_file) {
      showToast("Please upload the file for the current document before adding another", "error");
      return;
    }

    setDocuments([
      ...documents,
      {
        document_type: "",
        document_number: "",
        document_file: "",
        preview: "",
      },
    ]);
  };

  const removeDocument = (index) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index));
    } else {
      // If it's the last one, just clear it instead of removing
      setDocuments([
        {
          document_type: "",
          document_number: "",
          document_file: "",
          preview: "",
        },
      ]);
    }
  };

  // ================= SAVE =================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Mandatory Field Validation
    if (!form.sponsor_name.trim()) newErrors.sponsor_name = "Sponsor Name is required";
    if (!form.primary_contact.trim()) newErrors.primary_contact = "Primary contact is required";
    if (!form.mail_id.trim()) newErrors.mail_id = "Mail ID is required";
    if (!form.address.trim()) newErrors.address = "Address is required";

    // 2. Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (form.mail_id && !emailRegex.test(form.mail_id)) {
      newErrors.mail_id = "Invalid email format (e.g., abc@gmail.com)";
    }

    // 3. Contact Number Validation
    if (form.primary_contact && form.primary_contact.length !== 10) {
      newErrors.primary_contact = "Contact must be exactly 10 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 4. Document Validation
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      if (doc.document_type === "Aadhar" && doc.document_number.length !== 12) {
        showToast(`Document ${i + 1}: Aadhar must be exactly 12 digits`, "error");
        return;
      }
      if (doc.document_type === "PAN" && doc.document_number.length !== 10) {
        showToast(`Document ${i + 1}: PAN must be exactly 10 characters`, "error");
        return;
      }
      if (!doc.document_file) {
        showToast(`Document ${i + 1}: Please upload the document file`, "error");
        return;
      }
    }

    try {
      await createSponsor(form);

      showToast("✓ Sponsor Created Successfully!", "success");

      setShowForm(false);

      // Reset form
      setForm({
        sponsor_name: "",
        primary_contact: "",
        secondary_contact: "",
        mail_id: "",
        address: "",
        status: "Active",
        sponsor_image: "",
      });

      setDocuments([
        {
          document_type: "",
          document_number: "",
          document_file: "",
          preview: "",
        },
      ]);

      setImagePreview(null);

      loadSponsors();
    } catch (error) {
      showToast(
        error.response?.data?.message ||
        "Failed to create sponsor. Please try again.",
        "error",
      );
    }
  };
  const onBack = () => {
    navigate("/OrganizerHome/SponsorshipPage");
  };

  const handleReset = () => {
    setForm({
      sponsor_name: "",
      primary_contact: "",
      secondary_contact: "",
      mail_id: "",
      address: "",
      status: "Active",
      sponsor_image: "",
    });
    setDocuments([
      {
        document_type: "",
        document_number: "",
        document_file: "",
        preview: "",
      },
    ]);
    setImagePreview(null);
    setErrors({});
  };

  // ================= VIEW =================

  const viewSponsor = async (id) => {
    try {
      const res = await getSponsorById(id);

      setViewData(res);
    } catch (error) {
      showToast("Failed to load sponsor details", "error");
    }
  };

  const closeModal = () => {
    setViewData(null);
  };

  // ================= DELETE =================

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSponsor(confirmDeleteId);
      showToast("✓ Sponsor Deleted Successfully!", "success");
      loadSponsors();
    } catch (error) {
      showToast("Failed to delete sponsor", "error");
    } finally {
      setShowDeleteModal(false);
      setConfirmDeleteId(null);
    }
  };

  // ================= SEARCH =================

  const filteredSponsors = sponsors.filter(
    (s) =>
      (s.sponsor_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.sponsor_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed top-6 right-6 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl z-[9999] animate-in fade-in slide-in-from-right duration-300 border-l-4 ${toast.type === "success"
            ? "bg-white border-emerald-500"
            : "bg-white border-rose-500"
            }`}
        >
          <div className={`p-2 rounded-xl ${toast.type === "success" ? "bg-emerald-100" : "bg-rose-100"}`}>
            {toast.type === "success" ? (
              <CheckCircle size={20} className="text-emerald-600" />
            ) : (
              <AlertCircle size={20} className="text-rose-600" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-slate-800 font-bold text-sm tracking-tight">
              {toast.type === "success" ? "Success" : "Notification"}
            </span>
            <span className="text-slate-500 text-xs font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Sponsorship
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Sponsor
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-sky-600 text-white">
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Sponsor Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Primary Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Mail ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredSponsors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                          <Eye className="text-slate-300" size={32} />
                        </div>
                        <p className="text-slate-400 font-bold italic">No sponsors found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSponsors.map((s, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-sky-50/30 transition-all group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewSponsor(s.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(s.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {s.sponsor_code}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">{s.sponsor_name}</span>
                          <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{s.address}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-sm font-bold text-slate-600">{s.primary_contact}</span>
                      </td>

                      <td className="p-4">
                        <span className="text-sm font-medium text-sky-600 hover:underline cursor-pointer">{s.mail_id}</span>
                      </td>

                      <td className="p-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === "Active"
                          ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                          : "bg-amber-100 text-amber-600 border border-amber-200"
                          }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= CREATE MODAL ================= */}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-sky-50 border border-blue-200 shadow-2xl rounded-3xl w-[900px] max-h-[90vh] overflow-y-auto">
            {/* HEADER */}

            <div className="flex justify-between items-center px-8 py-5 border-b border-blue-100 bg-gradient-to-r from-sky-500 to-blue-600 rounded-t-3xl">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                New Sponsor Details
              </h2>

              <button
                onClick={() => {
                  setShowForm(false);
                  handleReset();
                }}
                className="bg-white/20 p-2 rounded-full text-white hover:bg-red-500 transition-all duration-300 hover:scale-110"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* LEFT SIDE: SPONSOR INFORMATION */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm h-full">
                    <h3 className="text-lg font-bold text-blue-700 mb-5 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                      Sponsor Information
                    </h3>

                    <div className="space-y-4">
                      {/* Name & Primary Contact */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                            Sponsor Name <span className="text-red-500 font-bold lowercase tracking-normal ml-1">*</span>
                          </label>
                          <input
                            name="sponsor_name"
                            placeholder="Enter Name"
                            value={form.sponsor_name}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-xl bg-blue-50/50 border ${errors.sponsor_name ? 'border-red-400' : 'border-blue-100'} focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-blue-900 text-sm font-semibold placeholder:text-blue-200`}
                          />
                          {errors.sponsor_name && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.sponsor_name}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                            Primary Contact <span className="text-red-500 font-bold lowercase tracking-normal ml-1">*</span>
                          </label>
                          <input
                            name="primary_contact"
                            placeholder="Primary No"
                            value={form.primary_contact}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-xl bg-blue-50/50 border ${errors.primary_contact ? 'border-red-400' : 'border-blue-100'} focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-blue-900 text-sm font-semibold placeholder:text-blue-200`}
                          />
                          {errors.primary_contact && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.primary_contact}</p>}
                        </div>
                      </div>

                      {/* Secondary & Mail */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                            Secondary Contact
                          </label>
                          <input
                            name="secondary_contact"
                            placeholder="Secondary No"
                            value={form.secondary_contact}
                            onChange={handleChange}
                            className="w-full p-3 rounded-xl bg-blue-50/50 border border-blue-100 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-blue-900 text-sm font-semibold placeholder:text-blue-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                            Mail ID <span className="text-red-500 font-bold lowercase tracking-normal ml-1">*</span>
                          </label>
                          <input
                            name="mail_id"
                            placeholder="Email ID"
                            value={form.mail_id}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-xl bg-blue-50/50 border ${errors.mail_id ? 'border-red-400' : 'border-blue-100'} focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-blue-900 text-sm font-semibold placeholder:text-blue-200`}
                          />
                          {errors.mail_id && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.mail_id}</p>}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                          Address <span className="text-red-500 font-bold lowercase tracking-normal ml-1">*</span>
                        </label>
                        <textarea
                          name="address"
                          placeholder="Complete Address"
                          value={form.address}
                          onChange={handleChange}
                          className={`w-full p-3 rounded-xl bg-blue-50/50 border ${errors.address ? 'border-red-400' : 'border-blue-100'} focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-blue-900 text-sm font-semibold placeholder:text-blue-200 min-h-[80px] resize-none`}
                        />
                        {errors.address && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.address}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: DOCUMENTS & ACTION */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm h-full flex flex-col">
                    <h3 className="text-lg font-bold text-blue-700 mb-5 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                      Sponsor Documents
                    </h3>

                    <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {documents.map((doc, index) => (
                        <div
                          key={index}
                          className="relative bg-blue-50/30 p-4 rounded-xl border border-blue-50 animate-in slide-in-from-right duration-300"
                        >
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <select
                              name="document_type"
                              value={doc.document_type}
                              onChange={(e) => handleDocChange(e, index)}
                              className="p-2.5 rounded-lg bg-white border border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 text-xs font-semibold"
                            >
                              <option>Document Type</option>
                              <option>Aadhar</option>
                              <option>PAN</option>
                            </select>
                            <input
                              name="document_number"
                              placeholder="Number"
                              value={doc.document_number}
                              onChange={(e) => handleDocChange(e, index)}
                              className="p-2.5 rounded-lg bg-white border border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 text-xs font-semibold placeholder:text-blue-200"
                            />
                          </div>
                          <input
                            type="file"
                            onChange={(e) => handleDocument(e, index)}
                            className="w-full text-[10px] text-blue-600 font-bold file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all cursor-pointer bg-white/50 p-1.5 rounded-lg border border-blue-50"
                          />
                          {documents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-red-100 hover:bg-red-500 hover:text-white transition-all duration-300"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addDocument}
                      className="mt-4 w-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm"
                    >
                      + Add Document
                    </button>
                  </div>

                  {/* SAVE BUTTON */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-4 border border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Clear
                    </button>

                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-600 hover:scale-[1.01] transition-all rounded-2xl font-black text-white shadow-xl shadow-blue-100 uppercase tracking-widest"
                    >
                      Save Sponsor
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}

      {viewData && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-sky-50 w-[700px] rounded-3xl border border-blue-200 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-blue-600 to-sky-500 text-white">
              <h2 className="text-xl font-bold tracking-tight">
                Sponsor Details View
              </h2>
              <button
                onClick={closeModal}
                className="bg-white/20 p-2 rounded-full hover:bg-red-500 transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-2 gap-6">
              {/* Sponsor Code */}
              <div className="space-y-1">
                <label className="text-xs font-black text-blue-400 uppercase tracking-widest ml-1">
                  Sponsor Code
                </label>
                <input
                  type="text"
                  disabled
                  value={viewData.sponsor_code}
                  className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-blue-900 font-bold disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none shadow-sm"
                />
              </div>

              {/* Sponsor Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-blue-400 uppercase tracking-widest ml-1">
                  Sponsor Name
                </label>
                <input
                  type="text"
                  disabled
                  value={viewData.sponsor_name}
                  className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-blue-900 font-bold disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none shadow-sm"
                />
              </div>

              {/* Primary Contact */}
              <div className="space-y-1">
                <label className="text-xs font-black text-blue-400 uppercase tracking-widest ml-1">
                  Primary Contact
                </label>
                <input
                  type="text"
                  disabled
                  value={viewData.primary_contact}
                  className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-blue-900 font-bold disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none shadow-sm"
                />
              </div>

              {/* Secondary Contact */}
              {viewData.secondary_contact && (
                <div className="space-y-1">
                  <label className="text-xs font-black text-blue-400 uppercase tracking-widest ml-1">
                    Secondary Contact
                  </label>
                  <input
                    type="text"
                    disabled
                    value={viewData.secondary_contact}
                    className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-blue-900 font-bold disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none shadow-sm"
                  />
                </div>
              )}

              {/* Mail ID */}
              <div className="space-y-1">
                <label className="text-xs font-black text-blue-400 uppercase tracking-widest ml-1">
                  Mail ID
                </label>
                <input
                  type="email"
                  disabled
                  value={viewData.mail_id}
                  className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-blue-900 font-bold disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none shadow-sm"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-black text-blue-400 uppercase tracking-widest ml-1">
                  Status
                </label>
                <input
                  type="text"
                  disabled
                  value={viewData.status}
                  className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-blue-900 font-bold disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none shadow-sm"
                />
              </div>

              {/* Address */}
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-black text-blue-400 uppercase tracking-widest ml-1">
                  Address
                </label>
                <textarea
                  disabled
                  value={viewData.address}
                  rows="3"
                  className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-blue-900 font-bold disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none resize-none shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-[400px] overflow-hidden transform animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Are you sure?</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                You are about to delete this sponsor. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3.5 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};