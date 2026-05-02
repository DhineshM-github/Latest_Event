import React, { useEffect, useState, useRef } from "react";
import CustomTimePicker from "../CustomTimePicker";
import { get_Venues_details } from "../../../../Services/api";
import { Calendar, Clock } from "lucide-react";
const Step1EventDetails = ({ formData, setFormData }) => {
  const [venues, setVenues] = useState([]);
  /* inside component */
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const [errors, setErrors] = useState({});
  const todayLocal = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .split("T")[0];

  const validateEventName = (value) => {
    if (!value) {
      return "Event Name is required";
    }

    if (!/^[A-Za-z\s]+$/.test(value)) {
      return "Only letters and spaces allowed";
    }

    if (value.length > 20) {
      return "Max 20 characters allowed";
    }

    return "";
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await get_Venues_details();
      setVenues(res);
    } catch (error) {
      console.error("Error fetching venues", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "startDate") {
      const v = value < todayLocal ? todayLocal : value;
      setFormData((prev) => {
        const next = {
          ...prev,
          eventDetails: {
            ...prev.eventDetails,
            startDate: v,
          },
        };
        if (next.eventDetails.endDate && next.eventDetails.endDate < v) {
          next.eventDetails.endDate = v;
        }
        return next;
      });
      return;
    }
    if (name === "endDate") {
      const minForEnd = formData.eventDetails?.startDate || todayLocal;
      const v = value < minForEnd ? minForEnd : value;
      setFormData((prev) => ({
        ...prev,
        eventDetails: {
          ...prev.eventDetails,
          endDate: v,
        },
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      eventDetails: {
        ...prev.eventDetails,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-gray-50/50 rounded-2xl">
      {/* ---------------- LEFT SECTION ---------------- */}
      <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Event Info</h3>
        </div>

        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Event Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.eventDetails?.category || ""}
              onChange={handleChange}
              className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer text-gray-600"
            >
              <option value="">Select Category</option>
              <option>Music</option>
              <option>Business</option>
              <option>Technology</option>
              <option>Education</option>
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              name="eventName"
              placeholder="Enter a catchy name"
              value={formData.eventDetails?.eventName || ""}
              onChange={(e) => {
                const value = e.target.value;
                handleChange(e);
                const errorMsg = validateEventName(value);
                setErrors((prev) => ({
                  ...prev,
                  eventName: errorMsg,
                }));
              }}
              className={`w-full bg-gray-50 border-0 ring-1 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${errors.eventName ? "ring-red-500" : "ring-gray-200"
                }`}
            />
            {errors.eventName && (
              <p className="text-red-500 text-xs mt-1.5 ml-1 animate-pulse">
                {errors.eventName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              About Event <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              placeholder="Tell us what makes it special..."
              value={formData.eventDetails?.description || ""}
              onChange={handleChange}
              maxLength={200}
              rows="3"
              className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Amenities
            </label>
            <textarea
              name="amenities"
              placeholder="What will guests enjoy?"
              value={formData.eventDetails?.amenities || ""}
              onChange={handleChange}
              maxLength={100}
              rows="2"
              className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Tags
            </label>
            <input
              name="tags"
              placeholder="e.g. #music, #festival"
              value={formData.eventDetails?.tags || ""}
              onChange={handleChange}
              className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* ---------------- MIDDLE SECTION ---------------- */}
      <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Settings</h3>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Include Program <span className="text-red-500">*</span>
              </label>
              <div className="flex bg-gray-50 p-1 rounded-xl ring-1 ring-gray-200">
                {["Yes", "No"].map((opt) => (
                  <label key={opt} className="flex-1">
                    <input
                      type="radio"
                      name="includeProgram"
                      value={opt}
                      className="hidden peer"
                      checked={formData.eventDetails?.includeProgram === opt}
                      onChange={handleChange}
                    />
                    <div
                      className="text-center py-2 rounded-lg cursor-pointer transition-all 
                      peer-checked:bg-[oklch(70.2%_0.183_293.541)] 
                      peer-checked:text-white 
                      peer-checked:shadow-sm 
                      text-gray-500 text-sm font-medium"
                    >
                      {opt}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Visibility <span className="text-red-500">*</span>
              </label>
              <div className="flex bg-gray-50 p-1 rounded-xl ring-1 ring-gray-200">
                {["Public", "Private"].map((opt) => (
                  <label key={opt} className="flex-1">
                    <input
                      type="radio"
                      name="visibility"
                      value={opt}
                      className="hidden peer"
                      checked={formData.eventDetails?.visibility === opt}
                      onChange={handleChange}
                    />
                    <div className="text-center py-2 rounded-lg cursor-pointer transition-all peer-checked:bg-white peer-checked:text-indigo-600 peer-checked:shadow-sm text-gray-500 text-sm font-medium">
                      {opt}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
              Communication
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "mail", label: "Email" },
                { id: "whatsapp", label: "WhatsApp" },
                { id: "print", label: "Print" },
              ].map((item) => (
                <label key={item.id} className="relative group cursor-pointer">
                  <input
                    type="checkbox"
                    name={item.id}
                    className="hidden peer"
                    checked={formData.eventDetails?.[item.id] || false}
                    onChange={handleChange}
                  />
                  <div className="bg-gray-50 ring-1 ring-gray-200 rounded-xl py-2.5 text-center text-xs font-semibold text-gray-500 transition-all peer-checked:ring-2 peer-checked:ring-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700">
                    {item.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
              On-Spot Requirements
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "visitorMail", label: "Email ID" },
                { id: "visitorName", label: "Full Name" },
                { id: "visitorPhoto", label: "Photo" },
                { id: "visitorMobile", label: "Mobile" },
                { id: "documentProof", label: "ID Proof" },
              ].map((item) => (
                <label key={item.id} className="cursor-pointer group">
                  <div className="flex items-center p-2.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 group-hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      name={item.id}
                      checked={formData.eventDetails?.[item.id] || false}
                      className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      onChange={handleChange}
                    />
                    <span className="ml-2.5 text-xs font-medium text-gray-600">
                      {item.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center p-3 rounded-xl bg-indigo-50/50 ring-1 ring-indigo-100 cursor-pointer hover:bg-indigo-50 transition-all">
              <input
                type="checkbox"
                name="dayPass"
                checked={formData.eventDetails?.dayPass || false}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 border-indigo-300 focus:ring-indigo-500"
              />
              <span className="ml-3 text-sm font-semibold text-gray-600">
                Day Pass
              </span>
            </label>
            <label className="flex items-center p-3 rounded-xl bg-purple-50/50 ring-1 ring-purple-100 cursor-pointer hover:bg-purple-50 transition-all">
              <input
                type="checkbox"
                name="isInternationalInclude"
                checked={formData.eventDetails?.isInternationalInclude || false}
                onChange={handleChange}
                className="w-4 h-4 rounded text-purple-600 border-purple-300 focus:ring-purple-500"
              />
              <span className="ml-3 text-sm font-semibold text-gray-600">
                International
              </span>
            </label>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Mandatory Documents
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 cursor-pointer hover:bg-gray-100 transition-all">
                <input
                  type="checkbox"
                  name="aadhar"
                  checked={formData.eventDetails?.aadhar || false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span className="ml-3 text-sm font-semibold text-gray-600">Aadhar Card</span>
              </label>
              {formData.eventDetails?.isInternationalInclude && (
                <label className="flex items-center p-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 cursor-pointer hover:bg-gray-100 transition-all animate-fadeIn">
                  <input
                    type="checkbox"
                    name="passport"
                    checked={formData.eventDetails?.passport || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="ml-3 text-sm text-gray-600">Passport</span>
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Food Provision (LEFT) */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Food Provision
              </label>
              <div>
                <label className="flex items-center p-3 rounded-xl bg-purple-50/50 ring-1 ring-purple-100 cursor-pointer hover:bg-purple-50 transition-all">
                  <input
                    type="checkbox"
                    name="food"
                    checked={formData.eventDetails?.food || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-purple-600 border-purple-300 focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-600">
                    Include Food
                  </span>
                </label>
              </div>
            </div>

            {/* Welcome Kit (RIGHT) */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Welcome Kit
              </label>
              <div>
                <label className="flex items-center p-3 rounded-xl bg-indigo-50/50 ring-1 ring-indigo-100 cursor-pointer hover:bg-indigo-50 transition-all">
                  <input
                    type="checkbox"
                    name="welcomeKit"
                    checked={formData.eventDetails?.welcomeKit || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-indigo-600 border-indigo-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-600">
                    Include Welcome Kit
                  </span>
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ---------------- RIGHT SECTION ---------------- */}
      <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Time & Place</h3>
        </div>

        <div className="space-y-5">
          <div className="flex bg-gray-50 p-1 rounded-xl ring-1 ring-gray-200">
            {[
              { id: "OneTime", label: "One-Time" },
              { id: "Recurring", label: "Recurring" },
            ].map((opt) => (
              <label key={opt.id} className="flex-1">
                <input
                  type="radio"
                  name="eventType"
                  value={opt.id}
                  className="hidden peer"
                  checked={formData.eventDetails?.eventType === opt.id}
                  onChange={handleChange}
                />
                <div className="text-center py-2.5 rounded-lg cursor-pointer transition-all peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-sm text-gray-500 text-sm font-semibold">
                  {opt.label}
                </div>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Start Date
              </label>
              <input
                ref={startDateRef}
                type="date"
                name="startDate"
                value={formData.eventDetails?.startDate || ""}
                min={todayLocal}
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.eventDetails?.startTime || ""}
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                End Date
              </label>
              <input
                ref={endDateRef}
                type="date"
                name="endDate"
                value={formData.eventDetails?.endDate || ""}
                min={formData.eventDetails?.startDate || todayLocal}
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.eventDetails?.endTime || ""}
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          {formData.eventDetails?.eventType === "Recurring" && (
            <div className="animate-slideDown">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                Frequency
              </label>
              <select
                name="occurrence"
                value={formData.eventDetails?.occurrence || ""}
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
              >
                <option value="">Select Frequency</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Location Venue <span className="text-red-500">*</span>
            </label>
            <select
              name="venue"
              value={formData.eventDetails?.venue || ""}
              onChange={handleChange}
              className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer mb-3"
            >
              <option value="">Search Venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.venue_name}>
                  {venue.venue_name} ({venue.city_name})
                </option>
              ))}
            </select>
            <textarea
              name="address"
              placeholder="Detailed Address"
              value={formData.eventDetails?.address || ""}
              onChange={handleChange}
              rows="2"
              className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1EventDetails;
