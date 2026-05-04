import { useState, useEffect } from "react";
import { Eye, Plus, X, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getVendors, createVendor, getVendorById, deleteVendor } from "../../Services/api";

export const VendorPage = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [toast, setToast] = useState(null);
  const [fullPreview, setFullPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    vendor_type: "",
    vendor_name: "",
    company_name: "",
    primary_contact: "",
    secondary_contact: "",
    mail_id: "",
    address: "",
    bank_name: "",
    account_holder: "",
    ifsc_code: "",
    account_number: "",
    status: "Active",
    bank_passbook: "",
  });

  const [bankPreview, setBankPreview] = useState(null);

  const [documents, setDocuments] = useState([
    {
      document_type: "",
      document_number: "",
      document_file: "",
      preview: "",
    },
  ]);

  useEffect(() => {
    loadVendors();
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
  // ================= LOAD =================

  const loadVendors = async () => {
    try {
      const res = await getVendors();
      setVendors(res.data || []);
    } catch (error) {
      console.error("Error loading vendors:", error);
      setVendors([]);
    }
  };

  // ================= FORM =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restriction: Only digits allowed for these fields
    if (
      ["primary_contact", "secondary_contact", "account_number"].includes(name)
    ) {
      if (value !== "" && !/^\d+$/.test(value)) return;
    }

    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBankPassbook = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setBankPreview(reader.result);
      setForm({ ...form, bank_passbook: reader.result });
    };
  };

  const removeBankPassbook = () => {
    setBankPreview(null);
    setForm({ ...form, bank_passbook: "" });
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

  const handleRemoveDocFile = (index) => {
    const temp = [...documents];
    temp[index].document_file = "";
    temp[index].preview = "";
    setDocuments(temp);
  };

  const removeDocument = (index) => {
    if (documents.length > 1) {
      const temp = [...documents];
      temp.splice(index, 1);
      setDocuments(temp);
    }
  };

  const resetForm = () => {
    setForm({
      vendor_type: "",
      vendor_name: "",
      company_name: "",
      primary_contact: "",
      secondary_contact: "",
      mail_id: "",
      address: "",
      bank_name: "",
      account_holder: "",
      ifsc_code: "",
      account_number: "",
      status: "Active",
    });
    setDocuments([
      {
        document_type: "",
        document_number: "",
        document_file: "",
        preview: "",
      },
    ]);
    setBankPreview(null);
    setFieldErrors({});
  };

  // ================= SAVE =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!form.vendor_type) errors.vendor_type = "Vendor type is required";
    if (!form.vendor_name) errors.vendor_name = "Vendor name is required";
    if (!form.company_name) errors.company_name = "Company name is required";
    if (!form.primary_contact)
      errors.primary_contact = "Primary contact is required";
    if (!form.mail_id) {
      errors.mail_id = "Mail ID is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail_id)) {
      errors.mail_id = "Invalid email format";
    }
    if (!form.address) errors.address = "Address is required";
    if (!form.account_holder)
      errors.account_holder = "Account holder name is required";
    if (!form.bank_name) errors.bank_name = "Bank name is required";
    if (!form.account_number)
      errors.account_number = "Account number is required";
    if (!form.ifsc_code) errors.ifsc_code = "IFSC code is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast("Please fill all mandatory fields", "error");
      return;
    }

    // Document Validation
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
      setLoading(true);
      await createVendor({
        ...form,
        documents: documents.filter(
          (d) => d.document_type && d.document_number,
        ),
      });

      showToast("✓ Vendor Created Successfully!", "success");
      setShowForm(false);
      resetForm();
      loadVendors();
    } catch (error) {
      showToast("Failed to create vendor", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= VIEW =================

  const viewVendor = async (id) => {
    try {
      const res = await getVendorById(id);
      setViewData(res.data);
    } catch (error) {
      console.error("Error viewing vendor:", error);
    }
  };

  const closeModal = () => {
    setViewData(null);
  };

  // ================= DELETE =================

  const handleDeleteConfirm = async () => {
    const id = deleteModal.id;
    if (!id) return;
    
    try {
      setLoading(true);
      await deleteVendor(id);
      showToast("✓ Vendor Deleted Successfully!", "success");
      setDeleteModal({ isOpen: false, id: null });
      loadVendors();
    } catch (error) {
      showToast("Failed to delete vendor", "error");
      setDeleteModal({ isOpen: false, id: null });
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH & PAGINATION =================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredVendors = vendors.filter(
    (v) =>
      (v.vendor_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-10 text-slate-800 bg-sky-50 min-h-screen w-full">
      {toast && (
        <div
          className={`fixed top-5 right-5 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl z-[9999] animate-in fade-in slide-in-from-top ${toast.type === "success"
            ? "bg-sky-600 border border-sky-500"
            : "bg-red-600 border border-red-500"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={24} className="text-white flex-shrink-0" />
          ) : (
            <AlertCircle size={24} className="text-white flex-shrink-0" />
          )}
          <span className="text-white font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white hover:text-gray-200 transition"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* HEADER */}

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-sky-900">
          Vendor Management
        </h1>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-sky-600 px-4 py-2 rounded text-white flex gap-2 items-center hover:bg-sky-700 transition shadow-lg"
        >
          <Plus size={18} />
          {t("Add Vendor")}
        </button>
      </div>

      {/* SEARCH */}

      <div className="flex justify-start mb-6">
        <input
          placeholder={"search"}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm p-3 rounded bg-white text-slate-800 placeholder-slate-400 border border-sky-200 focus:ring-2 focus:ring-sky-500 outline-none shadow-sm"
        />
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-sky-600 text-white">
<th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Address</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
              
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {currentVendors.length > 0 ? (
              currentVendors.map((v) => (
                <tr key={v.id} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => viewVendor(v.id)}
                      className="text-sky-600 hover:text-sky-800 transition-colors"
                      title="View"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, id: v.id })}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>


                  <td className="px-6 py-4 font-medium text-sky-900">
                    {v.vendor_name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{v.primary_contact}</td>
                  <td className="px-6 py-4 text-slate-600">{v.mail_id}</td>
                  <td className="px-6 py-4 text-slate-600">{v.address}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${v.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Info size={40} />
                    <p className="font-bold">No Vendor found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-500 text-sm">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} entries
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-sky-50 disabled:opacity-40 transition-all font-semibold text-sky-600"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  currentPage === i + 1 
                    ? "bg-sky-600 text-white shadow-lg" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-sky-50 disabled:opacity-40 transition-all font-semibold text-sky-600"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ================= CREATE MODAL ================= */}

      {showForm && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-[95%] max-w-[1400px] h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-sky-100">
            {/* HEADER */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-sky-100 bg-sky-600 rounded-t-2xl">
              <h2 className="text-2xl font-semibold text-white">
                Create Vendor
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:text-sky-100 transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* BODY */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-8"
            >
              <div className="grid grid-cols-3 gap-8">
                {/* ------------------ Vendor Information ------------------ */}
                <div className="border border-sky-100 rounded-xl p-6 bg-sky-50 shadow-sm">
                  <h3 className="text-sky-700 font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-sky-600 rounded-full"></span>
                    VENDOR INFORMATION
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-sky-800 mb-1">
                        Vendor Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="vendor_type"
                        value={form.vendor_type}
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.vendor_type ? "border-red-500" : "border-sky-200"}`}
                      >
                        <option value="">Select Vendor Type</option>
                        <option>Suppliers</option>
                        <option>Contractors</option>
                        <option>Distributors</option>
                      </select>
                      {fieldErrors.vendor_type && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.vendor_type}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Vendor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="vendor_name"
                        value={form.vendor_name}
                        placeholder="Vendor Name"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.vendor_name ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.vendor_name && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.vendor_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="company_name"
                        value={form.company_name}
                        placeholder="Enter Company Name"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.company_name ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.company_name && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.company_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Primary Contact No{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="primary_contact"
                        value={form.primary_contact}
                        placeholder="Enter Primary Contact"
                        maxLength={10}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); // allow only numbers
                          handleChange({
                            target: {
                              name: "primary_contact",
                              value: value.slice(0, 10), // max 10 digits
                            },
                          });
                        }}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.primary_contact ? "border-red-500" : "border-sky-200"
                          }`}
                      />
                      {fieldErrors.primary_contact && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.primary_contact}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Secondary Contact No (Optional)
                      </label>
                      <input
                        name="secondary_contact"
                        value={form.secondary_contact}
                        placeholder="Enter Secondary Contact"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); // only numbers
                          handleChange({
                            target: {
                              name: "secondary_contact",
                              value: value.slice(0, 10), // max 10 digits
                            },
                          });
                        }}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.secondary_contact ? "border-red-500" : "border-sky-200"
                          }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Mail ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="mail_id"
                        value={form.mail_id}
                        placeholder="Enter Mail ID"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.mail_id ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.mail_id && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.mail_id}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={form.address}
                        placeholder="Enter Full Address"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.address ? "border-red-500" : "border-sky-200"}`}
                        rows={3}
                      />
                      {fieldErrors.address && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ------------------ Account Details ------------------ */}
                <div className="border border-sky-100 rounded-xl p-6 bg-sky-50 shadow-sm">
                  <h3 className="text-sky-700 font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-sky-600 rounded-full"></span>
                    ACCOUNT DETAILS
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Account Holder Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="account_holder"
                        value={form.account_holder}
                        placeholder="Enter Account Holder Name"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.account_holder ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.account_holder && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.account_holder}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="bank_name"
                        value={form.bank_name}
                        placeholder="Enter Bank Name"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.bank_name ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.bank_name && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.bank_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="account_number"
                        value={form.account_number}
                        maxLength={20}
                        placeholder="Enter Account Number"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.account_number ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.account_number && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.account_number}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        IFSC / SWIFT Code{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="ifsc_code"
                        value={form.ifsc_code}
                        placeholder="Enter IFSC Code"
                        onChange={handleChange}
                        className={`w-full border p-2 rounded bg-white focus:ring-2 focus:ring-sky-500 outline-none ${fieldErrors.ifsc_code ? "border-red-500" : "border-sky-200"}`}
                      />
                      {fieldErrors.ifsc_code && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {fieldErrors.ifsc_code}
                        </p>
                      )}
                    </div>

                    {/* Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-1">
                        Passbook/Cheque Upload
                      </label>
                      {!bankPreview ? (
                        <label className="border-dashed border-2 border-sky-200 rounded-xl p-8 text-center text-sky-400 bg-white hover:bg-sky-50 transition cursor-pointer flex flex-col items-center justify-center group">
                          <Plus className="mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Upload Document</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleBankPassbook}
                            accept="image/*,.pdf"
                          />
                        </label>
                      ) : (
                        <div
                          className="relative group cursor-zoom-in"
                          onClick={() => setFullPreview(bankPreview)}
                        >
                          <img
                            src={bankPreview}
                            alt="Bank Preview"
                            className="w-full h-32 object-cover rounded-xl border border-sky-200 shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                            <Eye size={24} className="text-white" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBankPassbook();
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            title="Remove Passbook"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="w-full border border-sky-500 text-sky-600 px-4 py-3 rounded-xl hover:bg-sky-600 hover:text-white transition font-semibold shadow-sm"
                    >
                      + Add Attachment
                    </button>
                  </div>
                </div>

                {/* ------------------ Document Details ------------------ */}
                <div className="border border-sky-100 rounded-xl p-6 bg-sky-50 shadow-sm">
                  <h3 className="text-sky-700 font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-sky-600 rounded-full"></span>
                    DOCUMENTS DETAILS (Optional)
                  </h3>

                  <div className="space-y-6">
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="space-y-4 px-6 py-4 border border-sky-200 rounded-xl bg-white shadow-sm relative group"
                      >
                        {documents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition p-1 bg-red-50 rounded-full opacity-0 group-hover:opacity-100"
                            title="Remove Document"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-sky-600 mb-1 tracking-wider">
                            Document Type
                          </label>
                          <select
                            name="document_type"
                            value={doc.document_type}
                            onChange={(e) => handleDocChange(e, index)}
                            className="w-full border border-sky-100 p-2 rounded bg-sky-50 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                          >
                            <option value="">Select Document Type</option>
                            <option>PAN</option>
                            <option>Aadhar</option>
                            <option>GST</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-sky-600 mb-1  tracking-wider">
                            Document Number
                          </label>
                          <input
                            name="document_number"
                            value={doc.document_number}
                            placeholder="Enter Document Number"
                            onChange={(e) => handleDocChange(e, index)}
                            className="w-full border border-sky-100 p-2 rounded bg-sky-50 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-sky-600 mb-1 tracking-wider">
                            Upload File
                          </label>
                          {!doc.preview ? (
                            <input
                              type="file"
                              onChange={(e) => handleDocument(e, index)}
                              className="w-full text-xs text-sky-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition cursor-pointer"
                            />
                          ) : (
                            <div
                              className="relative group/preview cursor-zoom-in mt-1"
                              onClick={() => setFullPreview(doc.preview)}
                            >
                              <img
                                src={doc.preview}
                                alt="Doc Preview"
                                className="w-full h-24 object-cover rounded-xl border border-sky-200 shadow-sm"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition rounded-xl flex items-center justify-center">
                                <Eye size={20} className="text-white" />
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDocFile(index);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                title="Remove File"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addDocument}
                      className="w-full border border-sky-500 text-sky-600 px-4 py-3 rounded-xl hover:bg-sky-600 hover:text-white transition font-semibold shadow-sm"
                    >
                      + Add Another Document
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBMIT */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-8 py-3 border border-sky-200 rounded-xl text-sky-700 font-semibold hover:bg-sky-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-sky-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-sky-700 transition shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? "Saving..." : "Save Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}

      {viewData && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-[800px] max-h-[90vh] p-8 rounded-2xl shadow-2xl border border-sky-100 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-sky-100 pb-4">
              <h2 className="text-2xl font-bold text-sky-900">
                Vendor Details
              </h2>

              <button
                onClick={closeModal}
                className="text-sky-400 hover:text-sky-600 transition"
              >
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Vendor Name
                </label>
                <p className="text-lg font-semibold text-slate-800">
                  {viewData.vendor_name}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Company
                </label>
                <p className="text-lg font-semibold text-slate-800">
                  {viewData.company_name}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Vendor Type
                </label>
                <p className="font-semibold text-slate-800">
                  {viewData.vendor_type}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Contact
                </label>
                <p className="font-semibold text-slate-800">
                  {viewData.primary_contact}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Email
                </label>
                <p className="font-semibold text-slate-800">
                  {viewData.mail_id}
                </p>
              </div>

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Status
                </label>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${viewData.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {viewData.status}
                  </span>
                </div>
              </div>

              <div className="col-span-2 bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Address
                </label>
                <p className="text-slate-700">{viewData.address}</p>
              </div>

              {/* Bank Details Section */}
              <div className="col-span-2 mt-4">
                <h3 className="text-sky-700 font-bold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-sky-600 rounded-full"></span>
                  BANK ACCOUNT DETAILS
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">
                      Bank Name
                    </label>
                    <p className="text-sm font-semibold">
                      {viewData.bank_name || "N/A"}
                    </p>
                  </div>
                  <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">
                      Account Holder
                    </label>
                    <p className="text-sm font-semibold">
                      {viewData.account_holder || "N/A"}
                    </p>
                  </div>
                  <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">
                      Account Number
                    </label>
                    <p className="text-sm font-semibold">
                      {viewData.account_number || "N/A"}
                    </p>
                  </div>
                  <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">
                      IFSC Code
                    </label>
                    <p className="text-sm font-semibold">
                      {viewData.ifsc_code || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              {viewData.documents && viewData.documents.length > 0 && (
                <div className="col-span-2 mt-4">
                  <h3 className="text-sky-700 font-bold mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-sky-600 rounded-full"></span>
                    DOCUMENTS
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {viewData.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-center gap-4"
                      >
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-sky-500 uppercase">
                            {doc.document_type || "Document"}
                          </label>
                          <p className="text-sm font-semibold">
                            {doc.document_number || "N/A"}
                          </p>
                        </div>
                        {doc.document_file && (
                          <div
                            className="w-16 h-16 rounded border border-sky-200 overflow-hidden cursor-zoom-in group relative"
                            onClick={() => setFullPreview(doc.document_file)}
                          >
                            <img
                              src={doc.document_file}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Eye size={16} className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={closeModal}
                className="w-full bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 transition shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULL IMAGE PREVIEW ================= */}
      {fullPreview && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[200] px-6 py-4"
          onClick={() => setFullPreview(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button
              onClick={() => setFullPreview(null)}
              className="absolute top-0 right-0 m-4 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full"
            >
              <X size={32} />
            </button>
            <img
              src={fullPreview}
              alt="Full Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
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
            <h2 className="text-2xl font-bold text-sky-900 mb-2">Delete Vendor</h2>
            <p className="text-slate-600 mb-8">
              Are you sure you want to delete this vendor? This action cannot be undone.
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
