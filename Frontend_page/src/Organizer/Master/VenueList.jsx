import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Eye,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Trash2,
  Info,
} from "lucide-react";
import {
  getVenueDetails,
  createVenue,
  getVenues,
  getCountries,
  getStates,
  getCities,
  deleteVenue,
} from "../../Services/api";

export const Venuepage = () => {
  const { t } = useTranslation();
  const [venues, setVenues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [imagePreview, setImagePreview] = useState(null);
  const [fullPreview, setFullPreview] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  const [form, setForm] = useState({
    venue_name: "",
    address: "",
    country: "",
    state: "",
    city: "",
    status: "Active",
    venue_image: "",
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
    loadVenues();
    loadCountries();
  }, []);

  // Click away listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // ================= VENUES =================

  const loadVenues = async () => {
    try {
      const res = await getVenues();

      setVenues(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error loading venues:", error);
      setVenues([]);
    }
  };

  const loadCountries = async () => {
    try {
      const res = await getCountries();
      setCountries(res);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  };

  const loadStates = async (id) => {
    try {
      const res = await getStates(id);
      setStates(res);
    } catch (error) {
      console.error("Error loading states:", error);
    }
  };

  const loadCities = async (id) => {
    try {
      const res = await getCities(id);
      setCities(res);
    } catch (error) {
      console.error("Error loading cities:", error);
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

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result);
      setForm({
        ...form,
        venue_image: reader.result,
      });
      if (fieldErrors.venue_image) {
        setFieldErrors((prev) => ({ ...prev, venue_image: "" }));
      }
    };
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setForm({
      ...form,
      venue_image: "",
    });
  };

  // ================= DOCUMENT =================



  const resetForm = () => {
    setForm({
      venue_name: "",
      address: "",
      country: "",
      state: "",
      city: "",
      status: "Active",
      venue_image: "",
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
    setCountrySearch("");
    setStateSearch("");
    setCitySearch("");
    setStates([]);
    setCities([]);
    setShowCountryDropdown(false);
    setShowStateDropdown(false);
    setShowCityDropdown(false);
    setFieldErrors({});
  };



  // ================= SAVE =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!form.venue_name) errors.venue_name = "Venue name is required";
    if (!form.address) errors.address = "Address is required";
    if (!form.country) errors.country = "Country is required";
    if (!form.state) errors.state = "State is required";
    if (!form.city) errors.city = "City is required";
    if (!form.venue_image) errors.venue_image = "Venue image is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await createVenue({
        ...form,
        documents: documents.filter(
          (d) => d.document_type && d.document_number,
        ),
      });

      showNotification("Venue created successfully!", "success");
      setShowForm(false);
      resetForm();
      loadVenues();
    } catch (error) {
      console.error("Failed to create venue:", error);
      showNotification("Failed to create venue", "error");
    }
  };

  // ================= VIEW =================

  const viewVenue = async (id) => {
    const res = await getVenueDetails(id);

    setViewData(res);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteVenue(deleteConfirm.id);
      showNotification("Venue deleted successfully!", "success");
      setDeleteConfirm({ show: false, id: null });
      loadVenues();
    } catch (error) {
      console.error("Failed to delete venue:", error);
      showNotification("Failed to delete venue", "error");
    }
  };

  const closeModal = () => {
    setViewData(null);
  };

  // ================= SEARCH =================

  const filteredVenues = venues.filter(
    (v) =>
      (v.venue_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.venue_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.address || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ================= UI =================

  return (
    <div className="p-10 text-slate-800 bg-sky-50 min-h-screen w-full">


      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-sky-900">
          Venue Management
        </h1>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-sky-600 px-4 py-2 rounded text-white flex gap-2 items-center hover:bg-sky-700 transition shadow-lg"
        >
          <Plus size={18} />
          Add Venue
        </button>
      </div>

      <div className="flex justify-start mb-6">
        <div className="relative w-full max-w-sm group">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"
          />
          <input
            placeholder={"Search"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg bg-white text-slate-800 placeholder-slate-400 border border-sky-200 focus:ring-2 focus:ring-sky-500 outline-none shadow-sm text-sm"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-sky-600 text-white">
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Code</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Venue</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Address</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {filteredVenues.length > 0 ? (
              filteredVenues.map((v) => (
                <tr key={v.id} className="hover:bg-sky-50/50 transition-colors duration-200 group">

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => viewVenue(v.id)}
                        className="text-sky-600 hover:text-sky-800 transition-colors"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>


                  <td className="px-6 py-4 font-medium text-sky-900">{v.venue_code}</td>

                  <td className="px-6 py-4 text-slate-700">{v.venue_name}</td>

                  <td className="px-6 py-4 text-slate-600">{v.address}</td>

                  <td className="px-6 py-4">
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
                    <p className="font-bold">No Venue found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= CREATE MODAL ================= */}

      {showForm && (
        <div className="fixed inset-0 bg-sky-900/30 backdrop-blur-sm flex justify-center items-center z-50 p-3">

          {/* MODAL */}
          <div className="bg-white border border-sky-100 shadow-2xl rounded-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white shrink-0">
              <h2 className="text-xl font-bold">Create Venue</h2>

              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="hover:bg-white/20 p-2 rounded-full transition"
              >
                <X size={22} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar"
            >

              {/* IMAGE UPLOAD */}
              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100 shadow-sm w-full h-fit">
                <h3 className="text-sm font-semibold mb-2 text-sky-700">
                  Venue Image <span className="text-red-500">*</span>
                </h3>

                <label
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 cursor-pointer hover:border-sky-400 transition bg-white ${fieldErrors.venue_image ? "border-red-500" : "border-sky-200"
                    }`}
                >
                  <span className="text-sky-500 text-sm">Upload Image</span>

                  <input
                    type="file"
                    onChange={handleImage}
                    className="hidden"
                  />
                </label>

                {fieldErrors.venue_image && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.venue_image}
                  </p>
                )}

                {imagePreview && (
                  <div
                    className="relative mt-3 group cursor-pointer"
                    onClick={() => setFullPreview(imagePreview)}
                  >
                    <img
                      src={imagePreview}
                      className="rounded-lg h-80 w-full object-cover border border-sky-100"
                    />

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                      <Eye size={20} className="text-white" />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* LOCATION DETAILS */}
              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100 shadow-sm w-full space-y-3 h-fit">
                <h3 className="text-sm font-semibold text-sky-700">
                  Location Details
                </h3>

                {/* VENUE NAME */}
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Venue Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="venue_name"
                    value={form.venue_name}
                    placeholder="Enter venue name"
                    onChange={handleChange}
                    className={`w-full mt-1 p-2 rounded-lg bg-white border focus:ring-2 focus:ring-sky-500 text-sm ${fieldErrors.venue_name ? "border-red-500" : "border-sky-200"
                      }`}
                  />

                  {fieldErrors.venue_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.venue_name}
                    </p>
                  )}
                </div>

                {/* ADDRESS */}
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Address <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    rows="2"
                    placeholder="Enter address"
                    onChange={handleChange}
                    className={`w-full mt-1 p-2 rounded-lg bg-white border focus:ring-2 focus:ring-sky-500 text-sm resize-none ${fieldErrors.address ? "border-red-500" : "border-sky-200"
                      }`}
                  />

                  {fieldErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.address}
                    </p>
                  )}
                </div>

                {/* COUNTRY + STATE */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative" ref={countryRef}>
                    <label className="text-xs font-medium text-slate-700">
                      Country <span className="text-red-500">*</span>
                    </label>

                    {/* INPUT */}
                    <input
                      type="text"
                      placeholder="Search Country"
                      value={countrySearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCountrySearch(val);
                        setShowCountryDropdown(true);
                        // If user clears or changes text, clear dependent IDs
                        setForm({ ...form, country: "", state: "", city: "" });
                        setStateSearch("");
                        setCitySearch("");
                        setStates([]);
                        setCities([]);
                      }}

                      onFocus={() => setShowCountryDropdown(true)}
                      className={`w-full mt-1 p-2 rounded-lg bg-white border focus:ring-2 focus:ring-sky-500 text-sm ${fieldErrors.country ? "border-red-500" : "border-sky-200"
                        }`}
                    />

                    {/* DROPDOWN */}
                    {showCountryDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-sky-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">

                        {countries
                          .filter((c) =>
                            c.country_name
                              .toLowerCase()
                              .includes(countrySearch.toLowerCase())
                          )
                          .map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setForm({ ...form, country: c.id, state: "", city: "" });
                                setCountrySearch(c.country_name);
                                setStateSearch("");
                                setCitySearch("");
                                setStates([]);
                                setCities([]);
                                setShowCountryDropdown(false);
                                loadStates(c.id);
                              }}
                              className="p-2 cursor-pointer hover:bg-sky-100 text-sm"
                            >
                              {c.country_name}
                            </div>
                          ))}

                        {countries.filter((c) =>
                          c.country_name
                            .toLowerCase()
                            .includes(countrySearch.toLowerCase())
                        ).length === 0 && (
                            <div className="p-2 text-gray-400 text-sm">
                              No results found
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={stateRef}>
                    <label className="text-xs font-medium text-slate-700">
                      State <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Search State"
                      value={stateSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStateSearch(val);
                        setShowStateDropdown(true);
                        // Clear dependent city when state is cleared or changed
                        setForm({ ...form, state: "", city: "" });
                        setCitySearch("");
                        setCities([]);
                      }}

                      onFocus={() => setShowStateDropdown(true)}
                      className={`w-full mt-1 p-2 rounded-lg bg-white border focus:ring-2 focus:ring-sky-500 text-sm ${fieldErrors.state ? "border-red-500" : "border-sky-200"
                        }`}
                    />

                    {showStateDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-sky-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">

                        {states
                          .filter((s) =>
                            s.state_name.toLowerCase().includes(stateSearch.toLowerCase())
                          )
                          .map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setForm({ ...form, state: s.id, city: "" });
                                setStateSearch(s.state_name);
                                setCitySearch("");
                                setShowStateDropdown(false);
                                loadCities(s.id);
                              }}
                              className="p-2 cursor-pointer hover:bg-sky-100 text-sm"
                            >
                              {s.state_name}
                            </div>
                          ))}

                        {states.filter((s) =>
                          s.state_name.toLowerCase().includes(stateSearch.toLowerCase())
                        ).length === 0 && (
                            <div className="p-2 text-gray-400 text-sm italic">
                              {!form.country ? "Please select a country first" : "No results found"}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* CITY */}
                <div className="relative" ref={cityRef}>
                  <label className="text-xs font-medium text-slate-700">
                    City <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Search City"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    className={`w-full mt-1 p-2 rounded-lg bg-white border focus:ring-2 focus:ring-sky-500 text-sm ${fieldErrors.city ? "border-red-500" : "border-sky-200"
                      }`}
                  />

                  {showCityDropdown && (
                    <div className="absolute z-50 w-full bg-white border border-sky-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">

                      {cities
                        .filter((c) =>
                          c.city_name.toLowerCase().includes(citySearch.toLowerCase())
                        )
                        .map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setForm({ ...form, city: c.id });
                              setCitySearch(c.city_name);
                              setShowCityDropdown(false);
                            }}
                            className="p-2 cursor-pointer hover:bg-sky-100 text-sm"
                          >
                            {c.city_name}
                          </div>
                        ))}

                      {cities.filter((c) =>
                        c.city_name.toLowerCase().includes(citySearch.toLowerCase())
                      ).length === 0 && (
                          <div className="p-2 text-gray-400 text-sm italic">
                            {!form.state ? "Please select a state first" : "No results found"}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* FOOTER */}
            <div className="px-6 py-3 border-t border-sky-100 flex justify-end gap-3 bg-white shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-5 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200"
              >
                Cancel
              </button>


              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold shadow-md transition transform hover:scale-105"
              >
                Save Venue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-sky-900/60 backdrop-blur-sm flex justify-center items-center z-[110] px-6 py-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Are you sure?
              </h3>
              <p className="text-slate-500 font-medium">
                Do you really want to delete this venue? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex gap-3 p-6 bg-sky-50 border-t border-sky-100">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-sky-200 transition-all active:scale-95"
              >
                No, Keep it
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW ================= */}

      {viewData && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl border border-sky-100">
            {/* Header */}

            <div className="flex justify-between items-center mb-6 border-b border-sky-100 pb-4">
              <h2 className="text-2xl font-bold text-sky-900">View Venue</h2>

              <button
                onClick={closeModal}
                className="text-sky-400 hover:text-sky-600 transition"
              >
                <X size={28} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Venue Image */}

              <div className="col-span-2 bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Venue Image
                </label>

                <img
                  src={viewData.venue.venue_image}
                  className="w-full h-64 object-cover rounded-lg mt-2 shadow-sm border border-white"
                />
              </div>

              {/* Venue Name */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Venue Name
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.venue_name}
                </div>
              </div>

              {/* Venue Code */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Venue Code
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.venue_code}
                </div>
              </div>

              {/* Address */}

              <div className="col-span-2 bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Address
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm min-h-[80px]">
                  {viewData.venue.address}
                </div>
              </div>

              {/* Country */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Country
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.country_name}
                </div>
              </div>

              {/* State */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  State
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.state_name}
                </div>
              </div>

              {/* City */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  City
                </label>

                <div className="mt-1 p-3 bg-white border border-sky-200 text-slate-800 rounded-lg shadow-sm">
                  {viewData.venue.city_name}
                </div>
              </div>

              {/* Status */}

              <div className="bg-sky-50 px-6 py-4 rounded-xl border border-sky-100">
                <label className="text-sm font-semibold text-sky-700">
                  Status
                </label>

                <div className="mt-1">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${viewData.venue.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {viewData.venue.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents */}
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
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[250] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-4 border ${
          toast.type === "success" 
            ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200" 
            : "bg-rose-600 text-white border-rose-500 shadow-rose-200"
        }`}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <p className="font-bold text-sm tracking-wide">{toast.message}</p>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};
