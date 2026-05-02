import React, { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Award,
  UserPlus,
  Trash2,
  UploadCloud,
  Check,
  AlertCircle,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  getVendorTypes,
  getVendorNames,
  getSponsorNames,
} from "../../../../Services/api";

const Step6VendorSponsor = ({ formData, setFormData }) => {
  // ===========================
  // ✅ STATE
  // ===========================

  // Vendor
  const [vendorType, setVendorType] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorTypes, setVendorTypes] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [isVendorTypeOpen, setIsVendorTypeOpen] = useState(false);
  const [vendorTypeSearch, setVendorTypeSearch] = useState("");
  const [isVendorNameOpen, setIsVendorNameOpen] = useState(false);
  const [vendorNameSearch, setVendorNameSearch] = useState("");

  // Sponsor
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorship, setSponsorship] = useState("");
  const [sponsorNames, setSponsorNames] = useState([]);
  const [sponsorList, setSponsorList] = useState([]);
  const [isSponsorNameOpen, setIsSponsorNameOpen] = useState(false);
  const [sponsorNameSearch, setSponsorNameSearch] = useState("");
  const [isSponsorshipOpen, setIsSponsorshipOpen] = useState(false);
  const [sponsorshipSearch, setSponsorshipSearch] = useState("");

  const sponsorshipTiers = ["Title Sponsor", "Event Sponsor", "Gift Sponsor"];

  // Guest
  const [guestImage, setGuestImage] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [designation, setDesignation] = useState("");
  const [contact, setContact] = useState("");
  const [guestList, setGuestList] = useState([]);

  // Click away listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".vendor-type-dropdown"))
        setIsVendorTypeOpen(false);
      if (!event.target.closest(".vendor-name-dropdown"))
        setIsVendorNameOpen(false);
      if (!event.target.closest(".sponsor-name-dropdown"))
        setIsSponsorNameOpen(false);
      if (!event.target.closest(".sponsorship-dropdown"))
        setIsSponsorshipOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===========================
  // ✅ LOAD FROM formData (IMPORTANT FIX)
  // ===========================
  useEffect(() => {
    if (formData?.vendors) {
      setVendorList(formData.vendors.vendors || []);
      setSponsorList(formData.vendors.sponsors || []);
      setGuestList(formData.vendors.guests || []);
    }
  }, []);

  // ===========================
  // ✅ SAVE TO formData (SYNC)
  // ===========================
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      vendors: {
        vendors: vendorList,
        sponsors: sponsorList,
        guests: guestList,
      },
    }));
  }, [vendorList, sponsorList, guestList]);

  // ===========================
  // ✅ API LOADS
  // ===========================

  // Vendor Types
  useEffect(() => {
    const loadVendorTypes = async () => {
      try {
        const data = await getVendorTypes();
        setVendorTypes(data);
      } catch (err) {
        console.error("Vendor Types Error:", err);
      }
    };
    loadVendorTypes();
  }, []);

  // Vendor Names based on type
  useEffect(() => {
    if (!vendorType) return;

    const loadVendorNames = async () => {
      try {
        const data = await getVendorNames(vendorType);
        setVendorNames(data);
      } catch (err) {
        console.error("Vendor Names Error:", err);
      }
    };
    loadVendorNames();
  }, [vendorType]);

  // Sponsor Names
  useEffect(() => {
    const loadSponsors = async () => {
      try {
        const data = await getSponsorNames();
        setSponsorNames(data);
      } catch (err) {
        console.error("Sponsor Error:", err);
      }
    };
    loadSponsors();
  }, []);

  // Vendor names filter logic
  const filteredVendorTypes = vendorTypes.filter((v) =>
    v.vendor_type?.toLowerCase().includes(vendorTypeSearch.toLowerCase()),
  );

  const filteredVendorNames = vendorNames.filter((v) =>
    v.vendor_name?.toLowerCase().includes(vendorNameSearch.toLowerCase()),
  );

  const filteredSponsorNamesList = sponsorNames.filter((s) =>
    s.sponsor_name?.toLowerCase().includes(sponsorNameSearch.toLowerCase()),
  );

  const filteredSponsorshipTiers = sponsorshipTiers.filter((t) =>
    t.toLowerCase().includes(sponsorshipSearch.toLowerCase()),
  );

  // ===========================
  // ✅ ACTIONS
  // ===========================

  const addVendor = () => {
    if (!vendorType || !vendorName) return;

    const newVendor = {
      vendorType,
      vendorName,
      passCount: 0,
    };

    setVendorList((prev) => [...prev, newVendor]);

    setVendorType("");
    setVendorName("");
  };

  const removeVendor = (index) => {
    setVendorList((prev) => prev.filter((_, i) => i !== index));
  };

  const addSponsor = () => {
    if (!sponsorName || !sponsorship) return;

    const newSponsor = {
      sponsorName,
      sponsorship,
    };

    setSponsorList((prev) => [...prev, newSponsor]);

    setSponsorName("");
    setSponsorship("");
  };

  const removeSponsor = (index) => {
    setSponsorList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGuestImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setGuestImage({ file, preview });
  };

  const addGuest = () => {
    // Basic validation
    if (!guestName.trim() || !contact.trim()) return;

    // Letters Only validation for name
    if (!/^[a-zA-Z\s]*$/.test(guestName)) return;

    // Numbers Only validation for contact
    if (!/^\d*$/.test(contact)) return;

    const newGuest = {
      name: guestName.trim(),
      designation: designation.trim(),
      contact: contact.trim(),
      image: guestImage?.preview || "",
    };

    setGuestList((prev) => [...prev, newGuest]);

    setGuestImage(null);
    setGuestName("");
    setDesignation("");
    setContact("");
  };

  const removeGuest = (index) => {
    setGuestList((prev) => prev.filter((_, i) => i !== index));
  };

  // ===========================
  // ✅ VALIDATION HELPERS
  // ===========================
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[a-zA-Z\s]*$/.test(value)) {
      if (value.length <= 20) {
        setGuestName(value);
      }
    }
  };

  const handleDesignationChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[a-zA-Z\s]*$/.test(value)) {
      if (value.length <= 30) {
        setDesignation(value);
      }
    }
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      if (value.length <= 10) {
        setContact(value);
      }
    }
  };

  // ===========================
  // ✅ UI STYLES
  // ===========================
  const inputClasses =
    "w-full h-[45px] px-6 py-2 rounded-full bg-white border border-gray-200 text-black transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 placeholder:text-gray-400 placeholder:font-bold text-sm font-bold";
  const selectClasses = `${inputClasses} appearance-none bg-[url('data:image/svg+xml;utf8,<svg fill=\"%236b7280\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')] bg-no-repeat bg-[right_1rem_center] cursor-pointer`;
  const labelClasses =
    "block text-[11px] font-extrabold text-slate-900 mb-1.5 ml-4 tracking-wider";
  const cardClasses =
    "bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100/50 flex flex-col hover:shadow-md transition-shadow duration-300";
  const sectionTitleClasses =
    "text-xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-4 flex items-center gap-3";
  const tableHeaderClasses =
    "bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest p-4 text-left first:rounded-l-2xl last:rounded-r-2xl";
  const tableCellClasses =
    "p-4 text-sm text-black border-b border-gray-50/50 font-bold";
  const actionButtonClasses =
    "w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-4 text-sm tracking-wide";

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ================= Vendor ================= */}
        <div className={cardClasses}>
          <div>
            <h2 className={sectionTitleClasses}>
              <div className="p-2 bg-purple-50 rounded-xl">
                <Users size={22} className="text-purple-600" />
              </div>
              Vendor Details
            </h2>

            <div className="space-y-3">
              <div className="space-y-1 relative vendor-type-dropdown">
                <label className={labelClasses}>Vendor Category <span className="text-red-500">*</span> </label>
                <div className="relative group">
                  <div
                    className={`flex items-center gap-3 ${inputClasses} cursor-pointer hover:border-purple-400 transition-all duration-300 ${isVendorTypeOpen ? "border-purple-500 ring-4 ring-purple-500/10" : ""}`}
                    onClick={() => setIsVendorTypeOpen(!isVendorTypeOpen)}
                  >
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      className={`bg-transparent border-none outline-none w-full placeholder:font-bold text-sm font-bold ${vendorType ? "placeholder:text-black" : "placeholder:text-gray-400"}`}
                      placeholder={vendorType || "Search Category..."}
                      value={isVendorTypeOpen ? vendorTypeSearch : ""}
                      onChange={(e) => setVendorTypeSearch(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVendorTypeOpen(true);
                      }}
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isVendorTypeOpen ? "rotate-180 text-purple-500" : ""}`}
                    />
                  </div>

                  {isVendorTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] max-h-[250px] overflow-y-auto scrollbar-hide py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {filteredVendorTypes.length === 0 ? (
                        <div className="px-6 py-4 text-xs text-gray-400 text-center italic">
                          No categories found
                        </div>
                      ) : (
                        filteredVendorTypes.map((v, i) => (
                          <div
                            key={i}
                            className={`px-6 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-purple-50 group/item ${vendorType === v.vendor_type ? "bg-purple-50/50 text-black font-bold" : "text-black font-bold hover:text-purple-600"}`}
                            onClick={() => {
                              setVendorType(v.vendor_type);
                              setIsVendorTypeOpen(false);
                              setVendorTypeSearch("");
                            }}
                          >
                            <span>{v.vendor_type}</span>
                            {vendorType === v.vendor_type ? (
                              <Check size={14} className="text-purple-500" />
                            ) : (
                              <Plus
                                size={12}
                                className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 relative vendor-name-dropdown">
                <label className={labelClasses}>Provider Name <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div
                    className={`flex items-center gap-3 ${inputClasses} cursor-pointer hover:border-purple-400 transition-all duration-300 ${isVendorNameOpen ? "border-purple-500 ring-4 ring-purple-500/10" : ""} ${!vendorType ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                    onClick={() =>
                      vendorType && setIsVendorNameOpen(!isVendorNameOpen)
                    }
                  >
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      className={`bg-transparent border-none outline-none w-full placeholder:font-bold text-sm font-bold ${vendorName ? "placeholder:text-black" : "placeholder:text-gray-400"}`}
                      placeholder={vendorName || "Search Vendor..."}
                      value={isVendorNameOpen ? vendorNameSearch : ""}
                      onChange={(e) => setVendorNameSearch(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (vendorType) setIsVendorNameOpen(true);
                      }}
                      disabled={!vendorType}
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isVendorNameOpen ? "rotate-180 text-purple-500" : ""}`}
                    />
                  </div>

                  {isVendorNameOpen && vendorType && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] max-h-[250px] overflow-y-auto scrollbar-hide py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {filteredVendorNames.length === 0 ? (
                        <div className="px-6 py-4 text-xs text-gray-400 text-center italic">
                          No vendors found
                        </div>
                      ) : (
                        filteredVendorNames.map((v, i) => (
                          <div
                            key={i}
                            className={`px-6 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-purple-50 group/item ${vendorName === v.vendor_name ? "bg-purple-50/50 text-black font-bold" : "text-black font-bold hover:text-purple-600"}`}
                            onClick={() => {
                              setVendorName(v.vendor_name);
                              setIsVendorNameOpen(false);
                              setVendorNameSearch("");
                            }}
                          >
                            <span>{v.vendor_name}</span>
                            {vendorName === v.vendor_name ? (
                              <Check size={14} className="text-purple-500" />
                            ) : (
                              <Plus
                                size={12}
                                className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={addVendor}
                disabled={!vendorType || !vendorName}
                className={actionButtonClasses}
              >
                <Plus size={18} strokeWidth={2.5} /> Add to List
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className={tableHeaderClasses}>Vendor</th>
                      <th className={tableHeaderClasses}>Type</th>
                      <th
                        className={`${tableHeaderClasses} text-right w-16`}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-10 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <Users size={32} />
                            <p className="text-xs font-medium uppercase tracking-widest">
                              Empty List
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      vendorList.map((v, i) => (
                        <tr key={i} className="hover:bg-sky-50/50 transition-colors duration-200 group"
                        >
                          <td
                            className={`${tableCellClasses} font-semibold text-gray-800`}
                          >
                            {v.vendorName}
                          </td>
                          <td className={tableCellClasses}>
                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {v.vendorType}
                            </span>
                          </td>
                          <td className={`${tableCellClasses} text-right`}>
                            <button
                              onClick={() => removeVendor(i)}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Sponsor ================= */}
        <div className={cardClasses}>
          <div>
            <h2 className={sectionTitleClasses}>
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Award size={22} className="text-indigo-600" />
              </div>
              Sponsorships
            </h2>

            <div className="space-y-3">
              <div className="space-y-1 relative sponsor-name-dropdown">
                <label className={labelClasses}>Sponsor Partner <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div
                    className={`flex items-center gap-3 ${inputClasses} cursor-pointer hover:border-indigo-400 transition-all duration-300 ${isSponsorNameOpen ? "border-indigo-500 ring-4 ring-indigo-500/10" : ""}`}
                    onClick={() => setIsSponsorNameOpen(!isSponsorNameOpen)}
                  >
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      className={`bg-transparent border-none outline-none w-full placeholder:font-bold text-sm font-bold ${sponsorName ? "placeholder:text-black" : "placeholder:text-gray-400"}`}
                      placeholder={sponsorName || "Search Sponsor..."}
                      value={isSponsorNameOpen ? sponsorNameSearch : ""}
                      onChange={(e) => setSponsorNameSearch(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSponsorNameOpen(true);
                      }}
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isSponsorNameOpen ? "rotate-180 text-indigo-500" : ""}`}
                    />
                  </div>

                  {isSponsorNameOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] max-h-[250px] overflow-y-auto scrollbar-hide py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {filteredSponsorNamesList.length === 0 ? (
                        <div className="px-6 py-4 text-xs text-gray-400 text-center italic">
                          No sponsors found
                        </div>
                      ) : (
                        filteredSponsorNamesList.map((s, i) => (
                          <div
                            key={i}
                            className={`px-6 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-indigo-50 group/item ${sponsorName === s.sponsor_name ? "bg-indigo-50/50 text-black font-bold" : "text-black font-bold hover:text-indigo-600"}`}
                            onClick={() => {
                              setSponsorName(s.sponsor_name);
                              setIsSponsorNameOpen(false);
                              setSponsorNameSearch("");
                            }}
                          >
                            <span>{s.sponsor_name}</span>
                            {sponsorName === s.sponsor_name ? (
                              <Check size={14} className="text-indigo-500" />
                            ) : (
                              <Plus
                                size={12}
                                className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 relative sponsorship-dropdown">
                <label className={labelClasses}>Tier / Level <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div
                    className={`flex items-center gap-3 ${inputClasses} cursor-pointer hover:border-indigo-400 transition-all duration-300 ${isSponsorshipOpen ? "border-indigo-500 ring-4 ring-indigo-500/10" : ""}`}
                    onClick={() => setIsSponsorshipOpen(!isSponsorshipOpen)}
                  >
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      className={`bg-transparent border-none outline-none w-full placeholder:font-bold text-sm font-bold ${sponsorship ? "placeholder:text-black" : "placeholder:text-gray-400"}`}
                      placeholder={sponsorship || "Search Tier..."}
                      value={isSponsorshipOpen ? sponsorshipSearch : ""}
                      onChange={(e) => setSponsorshipSearch(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSponsorshipOpen(true);
                      }}
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isSponsorshipOpen ? "rotate-180 text-indigo-500" : ""}`}
                    />
                  </div>

                  {isSponsorshipOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] max-h-[250px] overflow-y-auto scrollbar-hide py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {filteredSponsorshipTiers.length === 0 ? (
                        <div className="px-6 py-4 text-xs text-gray-400 text-center italic">
                          No tiers found
                        </div>
                      ) : (
                        filteredSponsorshipTiers.map((t, i) => (
                          <div
                            key={i}
                            className={`px-6 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-indigo-50 group/item ${sponsorship === t ? "bg-indigo-50/50 text-black font-bold" : "text-black font-bold hover:text-indigo-600"}`}
                            onClick={() => {
                              setSponsorship(t);
                              setIsSponsorshipOpen(false);
                              setSponsorshipSearch("");
                            }}
                          >
                            <span>{t}</span>
                            {sponsorship === t ? (
                              <Check size={14} className="text-indigo-500" />
                            ) : (
                              <Plus
                                size={12}
                                className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={addSponsor}
                disabled={!sponsorName || !sponsorship}
                className={actionButtonClasses}
              >
                <Plus size={18} strokeWidth={2.5} /> Confirm Sponsor
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className={tableHeaderClasses}>Sponsor</th>
                      <th className={tableHeaderClasses}>Tier</th>
                      <th
                        className={`${tableHeaderClasses} text-right w-16`}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsorList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-10 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <Award size={32} />
                            <p className="text-xs font-medium uppercase tracking-widest">
                              No Sponsors
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sponsorList.map((s, i) => (
                        <tr key={i} className="hover:bg-sky-50/50 transition-colors duration-200 group"
                        >
                          <td
                            className={`${tableCellClasses} font-semibold text-gray-800`}
                          >
                            {s.sponsorName}
                          </td>
                          <td className={tableCellClasses}>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {s.sponsorship}
                            </span>
                          </td>
                          <td className={`${tableCellClasses} text-right`}>
                            <button
                              onClick={() => removeSponsor(i)}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Guest ================= */}
        <div className={cardClasses}>
          <div>
            <h2 className={sectionTitleClasses}>
              <div className="p-2 bg-blue-50 rounded-xl">
                <UserPlus size={22} className="text-blue-600" />
              </div>
              Special Guests
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4">
                <label
                  className={`relative flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden ${guestImage ? "border-purple-500 bg-purple-50/20" : "border-gray-200 hover:border-purple-400 hover:bg-gray-50 bg-gray-50/50 group"}`}
                >
                  {!guestImage ? (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <UploadCloud
                        size={20}
                        className="text-gray-400 group-hover:text-purple-500 transition-colors mb-1"
                      />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                        Photo
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full group">
                      <img
                        src={guestImage.preview}
                        alt="guest"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <Trash2
                          size={18}
                          className="text-white hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.preventDefault();
                            setGuestImage(null);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleGuestImage}
                    accept="image/*"
                  />
                </label>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      placeholder="Guest Name"
                      value={guestName}
                      onChange={handleNameChange}
                      className={inputClasses}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium">
                      {guestName.length}/20
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      placeholder="Designation"
                      value={designation}
                      onChange={handleDesignationChange}
                      className={inputClasses}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium">
                      {designation.length}/30
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <input
                  placeholder="Contact Number (Digits only)"
                  value={contact}
                  onChange={handleContactChange}
                  className={inputClasses}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium">
                  {contact.length}/10
                </span>
              </div>

              <button
                onClick={addGuest}
                disabled={!guestName || !contact}
                className={actionButtonClasses}
              >
                <Plus size={18} strokeWidth={2.5} /> Invite Guest
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className={tableHeaderClasses}>Guest Info</th>
                      <th
                        className={`${tableHeaderClasses} text-right w-16`}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {guestList.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="p-10 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <UserPlus size={32} />
                            <p className="text-xs font-medium uppercase tracking-widest">
                              No Guests
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      guestList.map((g, i) => (
                        <tr key={i} className="hover:bg-sky-50/50 transition-colors duration-200 group"
                        >
                          <td className={tableCellClasses}>
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                {g.image ? (
                                  <img
                                    src={g.image}
                                    alt=""
                                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-gray-300 border border-gray-100">
                                    <Users size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-800 text-sm truncate leading-none mb-1">
                                  {g.name}
                                </p>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tight truncate">
                                  {g.designation || "Special Guest"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className={`${tableCellClasses} text-right`}>
                            <button
                              onClick={() => removeGuest(i)}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6VendorSponsor;
