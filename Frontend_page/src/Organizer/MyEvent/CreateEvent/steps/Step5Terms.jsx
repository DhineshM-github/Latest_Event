import React, { useEffect, useState } from "react";
import { getPolicies } from "../../../../Services/api";
import { useSelector } from "react-redux";
const Step5Terms = ({ formData, setFormData }) => {
  const [policyData, setPolicyData] = useState({});
  const [policyGroup, setPolicyGroup] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [policyName, setPolicyName] = useState("");
  const Redexorganizer = useSelector((state) => state.user);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;
  useEffect(() => {
    if (organizer?.id) {
      fetchPolicies();
    }
  }, [organizer?.id]);
  // ✅ Define function OUTSIDE
  const fetchPolicies = async () => {
    try {
      const res = await getPolicies(organizer.id);

      console.log("API Response:", res);

      // ✅ Extract correct array
      const policies = res.data || [];

      const grouped = {};

      policies.forEach((item) => {
        const group = item.policy_group;
        const type = item.policy_type;
        const name = item.policy_name;

        if (!grouped[group]) grouped[group] = {};
        if (!grouped[group][type]) grouped[group][type] = [];

        grouped[group][type].push(name);
      });

      setPolicyData(grouped);
    } catch (error) {
      console.error("Failed to load policies", error);
    }
  };

  // ✅ Call when organizer changes

  const addPolicy = () => {
    if (!policyGroup || !policyType || !policyName) return;

    const newPolicy = { policyGroup, policyType, policyName };
    const existing = formData.terms || [];

    const isDuplicate = existing.some(
      (p) =>
        p.policyGroup === policyGroup &&
        p.policyType === policyType &&
        p.policyName === policyName
    );

    if (isDuplicate) {
      alert("Already added");
      return;
    }

    setFormData({
      ...formData,
      terms: [...existing, newPolicy],
    });

    setPolicyGroup("");
    setPolicyType("");
    setPolicyName("");
  };

  const selectClasses = "w-full h-[45px] px-6 py-2 rounded-full bg-white border border-gray-200 text-black font-bold transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-sm appearance-none bg-[url('data:image/svg+xml;utf8,<svg fill=\"%236b7280\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')] bg-no-repeat bg-[right_1rem_center] cursor-pointer mb-4";
  const labelClasses = "block text-[12px] font-bold text-gray-500 mb-2 ml-4 tracking-wider";
  const cardClasses = "bg-white p-8 rounded-3xl shadow-sm border border-gray-100";
  const sectionTitleClasses = "text-xl font-bold text-gray-800 mb-6 border-l-4 border-purple-500 pl-4";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: SELECTION FORM */}
        <div className={`${cardClasses} space-y-6`}>
          <h2 className={sectionTitleClasses}>Terms & Conditions</h2>

          <div className="space-y-2">
            <label className={labelClasses}>Policy Group<span className="text-red-500">*</span> </label>
            <select
              value={policyGroup}
              onChange={(e) => {
                setPolicyGroup(e.target.value);
                setPolicyType("");
                setPolicyName("");
              }}
              className={`w-full px-5 py-3 rounded-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${policyGroup ? "text-black" : "text-gray-800"
                }`}
            >
              <option value="">Select Group</option>
              {Object.keys(policyData).map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Policy Type <span className="text-red-500">*</span> </label>
            <select
              value={policyType}
              onChange={(e) => {
                setPolicyType(e.target.value);
                setPolicyName("");
              }}
              className={`w-full px-5 py-3 rounded-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${policyGroup ? "text-black" : "text-gray-800"
                }`}
              disabled={!policyGroup}
            >
              <option value="">Select Type</option>
              {policyGroup &&
                Object.keys(policyData[policyGroup] || {}).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Policy Name <span className="text-red-500">*</span> </label>
            <select
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              className={`w-full px-5 py-3 rounded-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${policyGroup ? "text-black" : "text-gray-800"
                }`}
              disabled={!policyGroup || !policyType}
            >
              <option value="">Select Policy</option>
              {policyGroup && policyType &&
                (policyData[policyGroup][policyType] || []).map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
            </select>
          </div>

          <button
            onClick={addPolicy}
            disabled={!policyGroup || !policyType || !policyName}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add to Selection
          </button>
        </div>

        {/* RIGHT: PREVIEW TABLE */}
        <div className={cardClasses}>
          <h2 className={sectionTitleClasses}>Selected Policies</h2>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Group</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Name</th>
                  </tr>
                </thead>

                <tbody>
                  {(formData.terms || []).length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-12 text-center text-gray-400  bg-gray-50/30 font-['Times New Roman']">
                        <svg className="w-8 h-8 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        No policies added yet. Select from the left to preview.
                      </td>
                    </tr>
                  ) : (
                    (formData.terms || []).map((p, i) => (
                      <tr key={i} className="hover:bg-sky-50/50 transition-colors duration-200 group">

                        {/* Policy Group */}
                        <td className="px-6 py-4 border-b border-gray-100 text-sm font-bold text-black">
                          {p.policyGroup}
                        </td>

                        {/* Policy Type */}
                        <td className="p-1 border-b border-gray-100 text-sm">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold tracking-wide">
                            {p.policyType}
                          </span>
                        </td>

                        {/* Policy Name */}
                        <td className="px-6 py-4 border-b border-gray-100 text-sm text-black font-bold">
                          {p.policyName}
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
  );
};

export default Step5Terms;