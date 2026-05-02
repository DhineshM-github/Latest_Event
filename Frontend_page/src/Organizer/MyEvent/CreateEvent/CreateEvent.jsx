import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { completeEvent, updateEvent } from "../../../Services/api";

import Step1EventDetails from "./steps/Step1EventDetails";
import Step2Booking from "./steps/Step2Booking";
import Step3LayoutStall from "./steps/step3layout";
import Step4Documents from "./steps/Step4Documents";
import Step5Terms from "./steps/Step5Terms";
import Step6VendorSponsor from "./steps/Step6VendorSponsor";

const CreateEvent = ({ onBack, editData }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const Redexorganizer = useSelector((state) => state.user);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };
  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;
  const [popup, setPopup] = useState({
    show: false,
    message: "",
  });
  useEffect(() => {
    if (popup.show) {
      const timer = setTimeout(() => {
        setPopup({ show: false, message: "" });
      }, 1000);

      return () => clearTimeout(timer); // cleanup
    }
  }, [popup.show]);

  const [formData, setFormData] = useState({
    eventDetails: editData?.details
      ? {
        category: editData.details.category,
        eventName: editData.details.event_name,
        description: editData.details.description,
        amenities: editData.details.amenities || "",
        tags: editData.details.tags || "",
        includeProgram: editData.details.include_program === "True" ? "Yes" : "No",
        visibility: editData.details.visibility || "Public",
        mail: editData.details.mail === 1 || editData.details.mail === true,
        whatsapp: editData.details.whatsapp === 1 || editData.details.whatsapp === true,
        print: editData.details.print === 1 || editData.details.print === true,
        visitorMail: editData.details.visitor_mail === 1 || editData.details.visitor_mail === true,
        visitorName: editData.details.visitor_name === 1 || editData.details.visitor_name === true,
        visitorPhoto: editData.details.visitor_photo === 1 || editData.details.visitor_photo === true,
        visitorMobile: editData.details.visitor_mobile === 1 || editData.details.visitor_mobile === true,
        documentProof: editData.details.document_proof === 1 || editData.details.document_proof === true,
        dayPass: editData.details.day_pass === 1 || editData.details.day_pass === true,
        isInternationalInclude: editData.details.is_international_include === 1 || editData.details.is_international_include === true,
        aadhar: editData.details.aadhar === 1 || editData.details.aadhar === true,
        passport: editData.details.passport === 1 || editData.details.passport === true,
        welcomeKit: editData.details.welcome_kit === 1 || editData.details.welcome_kit === true,
        food: editData.details.food === 1 || editData.details.food === true,
        eventType: editData.details.event_type || "OneTime",
        occurrence: editData.details.occurrence || "",
        startDate: editData.details.start_date,
        startTime: editData.details.start_time,
        endDate: editData.details.end_date,
        endTime: editData.details.end_time,
        venue: editData.details.venue,
        address: editData.details.address,
      }
      : {},
    booking: editData?.booking
      ? {
        bookingStartDate: editData.booking.booking_start_date,
        bookingEndDate: editData.booking.booking_end_date,
        capacity: editData.booking.capacity,
        passType: editData.booking.pass_type,
        entryType: editData.booking.entry_type,
        chargeType: editData.booking.charge_type,
      }
      : {},
    layout: editData?.layout
      ? {
        floorType: editData.layout.master?.floor_type,
        dayBased: editData.layout.master?.day_based,
        personPass: editData.layout.master?.person_pass,
        includeTax: editData.layout.master?.include_tax,
        stalls: editData.layout.stalls?.map(st => ({
          stallName: st.stall_name,
          size: st.stall_size,
          sizeRange: st.size_range,
          visibility: st.visibility,
          type: st.stall_type,
          priceINR: st.price_inr,
          priceUSD: st.price_usd,
          primeSeat: st.prime_seat,
          primePriceINR: st.prime_price_inr,
          primePriceUSD: st.prime_price_usd
        })),
        amenities: editData.layout.amenities?.map(am => ({
          stallName: am.stall_name,
          amenity: am.amenity,
          qty: am.qty
        }))
      }
      : { stalls: [] },
    documents: {
      banner: null,
      docs: [],
      existingFiles: editData?.files || []
    },
    terms: editData?.terms?.map(t => ({
      policyGroup: t.policy_group,
      policyType: t.policy_type,
      policyName: t.policy_name
    })) || [],
    vendors: editData?.vendor_data
      ? {
        vendors: editData.vendor_data.vendors?.map(v => ({
          vendorType: v.vendor_type,
          vendorName: v.vendor_name,
          passCount: v.pass_count
        })),
        sponsors: editData.vendor_data.sponsors?.map(s => ({
          sponsorName: s.sponsor_name,
          sponsorship: s.sponsorship_type
        })),
        guests: editData.vendor_data.guests?.map(g => ({
          name: g.guest_name,
          designation: g.designation,
          contact: g.contact,
          image: g.image
        }))
      }
      : { vendors: [], sponsors: [], guests: [] },
  });

  const validateStep = (checkAll = false) => {
    const event = formData.eventDetails || {};
    const booking = formData.booking || {};
    const layout = formData.layout || {};
    const documents = formData.documents || {};

    const showError = (msg, stepNum) => {
      setPopup({ show: true, message: msg });
      if (checkAll && stepNum) setStep(stepNum);
      return false;
    };
    if (checkAll || step === 1) {
      if (!event.eventName) return showError("Event Name is required", 1);
      if (!event.category) return showError("Event Category is required", 1);
      if (!event.description)
        return showError("Event Description is required", 1);
      if (!event.includeProgram)
        return showError("Include Program selection is required", 1);
      if (!event.visibility)
        return showError("Visibility selection is required", 1);
      if (!event.startDate) return showError("Start Date is required", 1);
      if (!event.startTime) return showError("Start Time is required", 1);
      if (!event.endDate) return showError("End Date is required", 1);
      if (!event.endTime) return showError("End Time is required", 1);
      if (!event.venue) return showError("Venue is required", 1);
      if (!event.address) return showError("Address is required", 1);
    }

    // Step 2: Booking
    if (checkAll || step === 2) {
      if (!booking.bookingStartDate)
        return showError("Booking Start Date is required", 2);
      if (!booking.bookingEndDate)
        return showError("Booking End Date is required", 2);
      if (!booking.capacity) return showError("Event Capacity is required", 2);
      if (!booking.passType) return showError("Pass Type is required", 2);
      if (!booking.entryType) return showError("Entry Type is required", 2);
      if (!booking.chargeType) return showError("Charge Type is required", 2);
    }

    // Step 3 & beyond validation can be skipped or simplified for updates if needed,
    // but for now we keep it same.
    if (!editData) {
      // Step 3: Layout & Stall
      if (checkAll || step === 3) {
        if (!layout.stalls || layout.stalls.length === 0) {
          return showError("At least one stall must be added", 3);
        }
      }

      // Step 4: Documents
      if (checkAll || step === 4) {
        if (!documents.banner) return showError("Event Banner (Image/Video) is required", 4);
      }

      // Step 5: Terms
      if (checkAll || step === 5) {
        if (!formData.terms || formData.terms.length === 0)
          return showError("Terms must be added", 5);
      }

      // Step 6: Vendor/Sponsor
      if (checkAll || step === 6) {
        const {
          vendors = [],
          sponsors = [],
        } = formData.vendors || {};
        if (
          vendors.length === 0 &&
          sponsors.length === 0
        ) {
          return showError(
            "At least one Vendor, Sponsor or Guest is required",
            6,
          );
        }
      }
    }

    return true;
  };

  useEffect(() => {
    if (organizer?.name) {
      setFormData((prev) => ({
        ...prev,
        eventDetails: {
          ...prev.eventDetails,
          created_by: organizer.name,
        },
      }));
    }
  }, [organizer?.name]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validateStep(true)) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();

      // JSON fields
      fd.append("eventDetails", JSON.stringify({
        ...formData.eventDetails,
        created_by: organizer.name,
        user_id: organizer.id,
      }));
      fd.append("booking", JSON.stringify(formData.booking));
      fd.append("layout", JSON.stringify(formData.layout));
      fd.append("terms", JSON.stringify(formData.terms));
      fd.append("vendors", JSON.stringify(formData.vendors));

      // Files
      if (formData.documents.banner) {
        fd.append("banner", formData.documents.banner);
      }

      formData.documents.docs.forEach((doc, index) => {
        fd.append(`docs_${index}`, doc.file);
        fd.append(`doc_type_${index}`, doc.type);
        fd.append(`doc_number_${index}`, doc.number);
      });
      fd.append("doc_count", formData.documents.docs.length);

      // Call Update or Create
      let res;
      if (editData) {
        res = await updateEvent(editData.id, fd);
      } else {
        res = await completeEvent(fd);
      }
      console.log("Response:", res);

      setPopup({
        show: true,
        message: editData ? "Event Updated Successfully ✅" : "Event Created Successfully ✅",
        type: "success",
      });

      // 🚀 Redirect after 2 sec
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        message: err.response?.data?.error || "Something went wrong ❌",
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>

      <div className="flex gap-6 border-b pb-2 mb-6 text-sm">
        <span className={step === 1 ? "font-bold text-indigo-600" : ""}>
          Event Details
        </span>
        <span className={step === 2 ? "font-bold text-indigo-600" : ""}>
          Booking
        </span>
        <span className={step === 3 ? "font-bold text-indigo-600" : ""}>
          Layout & Stall
        </span>
        <span className={step === 4 ? "font-bold text-indigo-600" : ""}>
          Documents
        </span>
        <span className={step === 5 ? "font-bold text-indigo-600" : ""}>
          Terms
        </span>
        <span className={step === 6 ? "font-bold text-indigo-600" : ""}>
          Vendor
        </span>
      </div>

      {step === 1 && (
        <Step1EventDetails formData={formData} setFormData={setFormData} />
      )}

      {step === 2 && (
        <Step2Booking formData={formData} setFormData={setFormData} />
      )}

      {step === 3 && (
        <Step3LayoutStall formData={formData} setFormData={setFormData} />
      )}

      {step === 4 && (
        <Step4Documents formData={formData} setFormData={setFormData} />
      )}

      {step === 5 && (
        <Step5Terms formData={formData} setFormData={setFormData} />
      )}

      {step === 6 && (
        <Step6VendorSponsor formData={formData} setFormData={setFormData} />
      )}

      <div className="flex justify-between mt-10">
        <button
          onClick={() => (step === 1 ? onBack() : setStep(step - 1))}
          className="border px-4 py-2 rounded"
        >
          Back
        </button>

        {step < 6 ? (
          <button
            onClick={() => {
              if (!validateStep()) return;
              setStep(step + 1);
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
              }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
      {popup.show && (
        <div className="fixed top-16 right-6 z-50">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 animate-slideIn
      ${popup.type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}
          >
            <span className="font-semibold">{popup.message}</span>

            <button
              onClick={() => setPopup({ show: false, message: "", type: "" })}
              className="text-white font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;
