import React, { useState } from "react";
import { Save, Trash2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const RoleWiseScreenMapping = () => {
  const [roleName, setRoleName] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [checkAll, setCheckAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState([]);

  const roleOptions = ["Super Admin", "Event Manager", "Organizer", "Exhibitor"];

  const moduleOptions = [
    "Dashboard",
    "Event",
    "Program",
    "Approval",
    "Accounts",
    "Sponsership",
    "User settings",
    "User",
    "Master",
    "Help & Support",
    "Stall Management",
    "Report",
  ];

  const rows = [];

  const filteredRows = rows.filter(
    (row) =>
      row.moduleName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      row.screenName.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleCheckAll = (e) => {
    setCheckAll(e.target.checked);
    if (e.target.checked) {
      setCheckedRows(filteredRows.map((_, i) => i));
    } else {
      setCheckedRows([]);
    }
  };

  const handleRowCheck = (index) => {
    setCheckedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-6 py-4">
      <div className="w-full rounded-md border border-[#d9e0ea] bg-white shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e3e8ef] px-4 py-3">
          <h1 className="text-[24px] font-semibold tracking-tight text-[#4d6483]">
            Role Wise Screen Mapping
          </h1>
          <div className="flex items-center gap-3">
            <button className="flex h-11 w-11 items-center justify-center rounded-md border border-[#d9e0ea] bg-white text-[#5b6f8e] transition hover:bg-[#f8fafc]">
              <Save size={20} strokeWidth={1.8} />
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-md border border-[#d9e0ea] bg-white text-[#5b6f8e] transition hover:bg-[#f8fafc]">
              <Trash2 size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4 p-3">

          {/* Left Panel */}
          <div className="col-span-12 rounded-md border border-[#d9e0ea] bg-white px-6 py-4 lg:col-span-4">
            <h2 className="mb-5 text-[21px] font-medium text-[#3b5cff]">
              Role Details
            </h2>

            {/* Role Name */}
            <div className="mb-6">
              <label className="mb-2 block text-[16px] font-semibold text-black">
                Role Name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="h-[46px] w-full appearance-none rounded-md border border-[#cfd7e3] bg-white px-4 pr-12 text-[16px] text-[#6b7280] outline-none focus:border-[#8aa4d6]"
                >
                  <option value="">Role Name</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={22}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5b6472]"
                />
              </div>
            </div>

            {/* Module Name */}
            <div>
              <label className="mb-2 block text-[16px] font-semibold text-black">
                Module Name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="h-[46px] w-full appearance-none rounded-md border border-[#cfd7e3] bg-white px-4 pr-12 text-[16px] text-[#6b7280] outline-none focus:border-[#8aa4d6]"
                >
                  <option value="">Module Name</option>
                  {moduleOptions.map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={22}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5b6472]"
                />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-12 rounded-md border border-[#d9e0ea] bg-white px-6 py-4 lg:col-span-8">
            <div className="rounded-sm border border-[#dfe5ee]">

              {/* Search */}
              <div className="border-b border-[#dfe5ee] px-6 py-4">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search Keyword"
                  className="h-[48px] w-full max-w-[312px] rounded-md border border-[#cfd7e3] px-4 text-[16px] text-[#6b7280] outline-none placeholder:text-[#7b8595] focus:border-[#8aa4d6]"
                />
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead>
            <tr className="bg-sky-600 text-white">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={checkAll}
                          onChange={handleCheckAll}
                          className="h-6 w-6 rounded border border-[#c9d1db] accent-[#4b6cb7]"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <span>Module Name</span>
                          <span className="text-[22px] leading-none text-[#667085]">↑↓</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1">
                          <span>Screen Name</span>
                          <span className="text-[22px] leading-none text-[#667085]">↑↓</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="border-b border-[#e2e8f0] px-4 py-2 text-left text-[15px] text-[#4b5563]"
                        >
                          No Data Found
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, index) => (
                        <tr key={index} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                          <td className="border-b border-[#e2e8f0] px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={checkedRows.includes(index)}
                              onChange={() => handleRowCheck(index)}
                              className="h-5 w-5 accent-[#4b6cb7]"
                            />
                          </td>
                          <td className="border-b border-[#e2e8f0] px-4 py-3 text-[15px] text-[#4b5563]">
                            {row.moduleName}
                          </td>
                          <td className="border-b border-[#e2e8f0] px-4 py-3 text-[15px] text-[#4b5563]">
                            {row.screenName}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer / Pagination */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-[#dfe5ee] px-4 py-4 text-[#6b7280] md:flex-row">
                <div className="w-[80px]" />

                <div className="flex flex-wrap items-center justify-center gap-2 text-[16px]">
                  <span>
                    Showing 0 to 0 of {filteredRows.length} entries
                  </span>

                  <div className="ml-2 flex items-center overflow-hidden rounded-md border border-[#eceff4] bg-[#f7f8fb]">
                    <button className="flex h-10 w-10 items-center justify-center border-r border-[#eceff4] text-[#a0a7b4] hover:bg-white hover:text-[#4d6483]">
                      <ChevronsLeft size={18} />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center border-r border-[#eceff4] text-[#a0a7b4] hover:bg-white hover:text-[#4d6483]">
                      <ChevronLeft size={18} />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center border-r border-[#eceff4] text-[#a0a7b4] hover:bg-white hover:text-[#4d6483]">
                      <ChevronRight size={18} />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center text-[#a0a7b4] hover:bg-white hover:text-[#4d6483]">
                      <ChevronsRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="h-10 min-w-[92px] appearance-none rounded-md border border-[#d9e0ea] bg-[#f8fafc] px-3 pr-10 text-[16px] text-[#6b7280] outline-none"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8595]"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleWiseScreenMapping;