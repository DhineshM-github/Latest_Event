import React, { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Header } from "../Organizer/Header";
import {
  BarChart3,
  CalendarDays,
  Mic,
  CheckCircle,
  DatabaseSearch,
  Backpack,
  CircleCheckBig,
  UserCog,
  BetweenHorizontalEnd,
  HelpCircle,
  Store,
  FileCode,
  Users,
  Home
} from "lucide-react";

export const Sidebar = () => {
  const [activePanel, setActivePanel] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();

  // Optimized loading state on route change
  React.useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 400); // Quick transition for responsiveness
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const togglePanel = (panelName) => {
    if (activePanel !== panelName) {
      // Trigger loading when switching to a new panel category
      setIsPageLoading(true);
      setTimeout(() => setIsPageLoading(false), 400);
    }
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  const menu = [
    { name: "Dashboard", icon: <BarChart3 size={18} />, panel: "dashboard" },
    { name: "My Event", icon: <CalendarDays size={18} />, panel: "myevent" },
    { name: "Program", icon: <Mic size={18} />, panel: "Program" },
    { name: "Account", icon: <DatabaseSearch size={18} />, panel: "Account" },
    {
      name: "Sponsorships",
      icon: <Backpack size={18} />,
      panel: "Sponsorships",
    },
    { name: "Approval", icon: <CircleCheckBig size={18} />, panel: "Approval" },
    {
      name: "Users Setting",
      icon: <UserCog size={18} />,
      panel: "User&Setting",
    }, {
      name: "Users",
      icon: <Users size={18} />,
      panel: "Users",
    },
    {
      name: "Master",
      icon: <BetweenHorizontalEnd size={18} />,
      panel: "Master",
    },
    { name: "Help", icon: <HelpCircle size={18} />, panel: "Help&Support" },
    {
      name: "Stall Management",
      icon: <Store size={18} />,
      panel: "Stall&Management",
    },
    { name: "Report", icon: <FileCode size={18} />, panel: "Report" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* HEADER FULL WIDTH */}

      <Header />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ICON SIDEBAR */}

        <div
          style={{
            width: "70px",
            height: "100%",
            background: "#e0f2fe",
            position: "relative",
            zIndex: 50,
          }}
        >
          {/* Scrollable Container (Wider to prevent tooltip clipping) */}
          <div
            className="hide-scrollbar"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "250px", // Enough for tooltips
              height: "100%",
              overflowY: "auto",
              overflowX: "visible",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              pointerEvents: "none", 
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start", 
              paddingTop: "15px",
              paddingLeft: "15px", 
              gap: "14px",
            }}
          >
          <div
            onMouseEnter={() => setHovered("home")}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: "relative",
              padding: "8px",
              cursor: "pointer",
              borderRadius: "12px",
              background: location.pathname === "/OrganizerHome" ? "#0284c7" : "transparent",
              color: location.pathname === "/OrganizerHome" ? "white" : "#0c4a6e",
              transition: "all 0.3s ease",
              pointerEvents: "auto", // Re-enable clicks for icons
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={() => {
              navigate("/OrganizerHome");
              setActivePanel(null);
            }}
          >
            <Home size={19} />

            {/* HOME TOOLTIP */}
            {hovered === "home" && (
              <div
                style={{
                  position: "absolute",
                  left: "100%",
                  top: "50%",
                  transform: "translateY(-50%) translateX(15px)",
                  background: "#0ea5e9",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0,165,233,0.3)",
                  whiteSpace: "nowrap",
                  fontSize: "12px",
                  fontWeight: "700",
                  zIndex: 2000,
                  pointerEvents: "none",
                }}
              >
                Home
                {/* Arrow */}
                <div style={{
                  position: "absolute",
                  left: "-4px",
                  top: "50%",
                  transform: "translateY(-50%) rotate(45deg)",
                  width: "8px",
                  height: "8px",
                  background: "#0ea5e9",
                }} />
              </div>
            )}
          </div>

          <div style={{ width: "40px", height: "1px", background: "#0c4a6e22", margin: "5px 0", pointerEvents: "none" }} />
          {menu.map((item, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                if (item.panel) {
                  togglePanel(item.panel);
                }
              }}
              style={{
                position: "relative",
                padding: "10px",
                borderRadius: "12px",
                cursor: "pointer",
                pointerEvents: "auto", // Re-enable clicks
                background:
                  hovered === i || activePanel === item.panel
                    ? "#ffffff"
                    : "transparent",
                color: hovered === i || activePanel === item.panel ? "#0ea5e9" : "#0c4a6e",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {item.icon}

              {/* TOOLTIP */}
              {hovered === i && (
                <div
                  style={{
                    position: "absolute",
                    left: "100%",
                    top: "50%",
                    transform: "translateY(-50%) translateX(15px)",
                    background: "#0ea5e9",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    boxShadow: "0 4px 12px rgba(0,165,233,0.3)",
                    whiteSpace: "nowrap",
                    fontSize: "12px",
                    fontWeight: "700",
                    zIndex: 2000,
                    pointerEvents: "none",
                  }}
                >
                  {item.name}
                  {/* Arrow */}
                  <div style={{
                    position: "absolute",
                    left: "-4px",
                    top: "50%",
                    transform: "translateY(-50%) rotate(45deg)",
                    width: "8px",
                    height: "8px",
                    background: "#0ea5e9",
                  }} />
                </div>
              )}
            </div>
          ))}
          </div>
        </div>

        {/* DASHBOARD PANEL */}

        {activePanel === "dashboard" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Dashboard
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{
                  cursor: "pointer",
                  fontWeight:
                    location.pathname === "/OrganizerHome/livedashboard"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/OrganizerHome/livedashboard"
                      ? "#0284c7"
                      : "black",
                }}
                onClick={() => {
                  navigate("/OrganizerHome/livedashboard");
                  setActivePanel(null);
                }}
              >
                Live Dashboard
              </span>

              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/livedashfoodboard");
                  setActivePanel(null);
                }}
              >
                Live Food Dashboard
              </span>

              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Organizerdashboard");
                  setActivePanel(null);
                }}
              >
                Organizer Dashboard
              </span>
            </div>
          </div>
        )}

        {/* MY EVENT PANEL */}

        {activePanel === "myevent" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              My Events
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/AddonCheckIn");
                  setActivePanel(null);
                }}
              >
                Add-On Check-In / Check-Out
              </span>

              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/SportBooking");
                  setActivePanel(null);
                }}
              >
                Add-On Spot
              </span>
              <span
                style={{
                  cursor: "pointer",
                  fontWeight:
                    location.pathname === "/OrganizerHome/Coupon"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/OrganizerHome/Coupon"
                      ? "#0284c7"
                      : "black",
                }}
                onClick={() => {
                  navigate("/OrganizerHome/Coupon");
                  setActivePanel(null);
                }}
              >
                Coupon
              </span>

              <span
                style={{
                  cursor: "pointer",
                  fontWeight:
                    location.pathname === "/OrganizerHome/CrenteEvent"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/OrganizerHome/CrenteEvent"
                      ? "#0284c7"
                      : "black",
                }}
                onClick={() => {
                  navigate("/OrganizerHome/CrenteEvent");
                  setActivePanel(null);
                }}
              >
                Create Event
              </span>
              <span
                style={{
                  cursor: "pointer",
                  fontWeight:
                    location.pathname === "/OrganizerHome/EventCheckIn"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/OrganizerHome/EventCheckIn"
                      ? "#0284c7"
                      : "black",
                }}
                onClick={() => {
                  navigate("/OrganizerHome/EventCheckIn");
                  setActivePanel(null);
                }}
              >
                Event Check-In/Check-Out
              </span>
              <span
                style={{
                  cursor: "pointer",
                  fontWeight:
                    location.pathname === "/OrganizerHome/FoodCheckIn"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/OrganizerHome/FoodCheckIn"
                      ? "#0284c7"
                      : "black",
                }}
                onClick={() => {
                  navigate("/OrganizerHome/FoodCheckIn");
                  setActivePanel(null);
                }}
              >
                Food Check-In/Check-Out
              </span>
              <span
                style={{
                  cursor: "pointer",
                  fontWeight:
                    location.pathname === "/OrganizerHome/messages"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/OrganizerHome/messages"
                      ? "#0284c7"
                      : "black",
                }}
                onClick={() => {
                  navigate("/OrganizerHome/messages");
                  setActivePanel(null);
                }}
              >
                Messages & Greetings
              </span>

              <span
                style={{
                  cursor: "pointer",
                  fontWeight:
                    location.pathname === "/OrganizerHome/Pass"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/OrganizerHome/Pass"
                      ? "#0284c7"
                      : "black",
                }}
                onClick={() => {
                  navigate("/OrganizerHome/Pass");
                  setActivePanel(null);
                }}
              >
                Pass
              </span>
              <span
                style={{
                  cursor: "pointer",
                  fontWeight:
                    location.pathname === "/OrganizerHome/Todo_task"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/OrganizerHome/Todo_task"
                      ? "#0284c7"
                      : "black",
                }}
                onClick={() => {
                  navigate("/OrganizerHome/Todo_task");
                  setActivePanel(null);
                }}
              >
                Todo Task
              </span>
              <span
                style={{
                  cursor: "pointer",
                  fontWeight:
                    location.pathname === "/OrganizerHome/Verify_Event"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/OrganizerHome/Verify_Event"
                      ? "#0284c7"
                      : "black",
                }}
                onClick={() => {
                  navigate("/OrganizerHome/Verify_Event");
                  setActivePanel(null);
                }}
              >
                Verify Event
              </span>
            </div>
          </div>
        )}

        {/* MY EVENT PANEL */}

        {activePanel === "Program" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Program
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Abstract_Verification");
                  setActivePanel(null);
                }}
              >
                Abstract Verification
              </span>

              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/BulkPassPage");
                  setActivePanel(null);
                }}
              >
                Bulk and Pass Generation
              </span>

              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/CreateProgram");
                  setActivePanel(null);
                }}
              >
                Create Program
              </span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/ProgramCheckin");
                  setActivePanel(null);
                }}
              >
                Program Check In
              </span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/ProgramVerification");
                  setActivePanel(null);
                }}
              >
                Program Verification
              </span>
            </div>
          </div>
        )}

        {activePanel === "Help&Support" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Help & Support
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Complaint_page");
                  setActivePanel(null);
                }}
              >
                Complaint
              </span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Feedback_page");
                  setActivePanel(null);
                }}
              >
                Feedback
              </span>
            </div>
          </div>
        )}
        {activePanel === "Sponsorships" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Sponsorships
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/SponsorshipPage");
                  setActivePanel(null);
                }}
              >
                Sponsorships
              </span>
            </div>
          </div>
        )}

        {activePanel === "Account" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Accounts
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Receipt");
                  setActivePanel(null);
                }}
              >
                Receipt
              </span>
            </div>
          </div>
        )}
        {activePanel === "Report" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Report
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/EventReports");
                  setActivePanel(null);
                }}
              >
                Receipt
              </span>
            </div>
          </div>
        )}

        {activePanel === "Stall&Management" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Stall Management
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Manage_Stall");
                  setActivePanel(null);
                }}
              >
                Manage Stall
              </span>
            </div>
          </div>
        )}
        {activePanel === "Approval" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Approval
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/AdminApproval");
                  setActivePanel(null);
                }}
              >
                Approval Work Flow
              </span>
            </div>
          </div>
        )}

        {activePanel === "User&Setting" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              User Setting
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Billing");
                  setActivePanel(null);
                }}
              >
                My Billing
              </span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Contacts");
                  setActivePanel(null);
                }}
              >
                My Contacts
              </span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/MyProfile");
                  setActivePanel(null);
                }}
              >
                My Profile
              </span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/MyPlan");
                  setActivePanel(null);
                }}
              >
                My Plan
              </span>
            </div>
          </div>
        )}

        {activePanel === "Users" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              User
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/ExhibitorSpotRegistration");
                  setActivePanel(null);
                }}
              >
                Exhibitor Spot Registration
              </span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Exhibitor");
                  setActivePanel(null);
                }}
              >
                Exhibitor
              </span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/RoleScreen");
                  setActivePanel(null);
                }}
              >
                RoleScreen
              </span>
              
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/UserScreen");
                  setActivePanel(null);
                }}
              >
                UserScreen
              </span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/User");
                  setActivePanel(null);
                }}
              >
                User
              </span>
            </div>
          </div>
        )}
        {activePanel === "Master" && (
          <div
            style={{
              width: "260px",
              height: "100%", overflowY: "auto",
              background: "#e0f2fe",
              padding: "25px",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              zIndex: 40,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Master
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/PolicyPage");
                  setActivePanel(null);
                }}
              >
                Policy
              </span>

              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Venu");
                  setActivePanel(null);
                }}
              >
                Venue
              </span>

              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigate("/OrganizerHome/Vendor");
                  setActivePanel(null);
                }}
              >
                Vendor
              </span>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}

        <div style={{ flex: 1, height: "100%", overflowY: "auto", padding: "20px", position: "relative", background: "#f8fafc" }}>
          {(isPageLoading || activePanel) && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(248, 250, 252, 0.95)",
                zIndex: 100,
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "4px solid #f1f5f9",
                  borderTopColor: "#7c2d92",
                  animation: "spin 1s cubic-bezier(0.5, 0, 1, 1) infinite"
                }} />
                <div style={{
                  position: "absolute",
                  inset: "10px",
                  borderRadius: "50%",
                  border: "4px solid transparent",
                  borderBottomColor: "#5ed6eeff",
                  animation: "spin 1.5s linear infinite"
                }} />
                <div style={{
                  position: "absolute",
                  inset: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    background: "#7c2d92",
                    borderRadius: "50%",
                    animation: "pulse 1.5s infinite"
                  }} />
                </div>
              </div>
              <h2 style={{
                marginTop: "32px",
                color: "#1e293b",
                fontWeight: "800",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "16px",
                fontFamily: "'Outfit', sans-serif"
              }}>
                {activePanel ? "Select an Option" : "Loading Experience"}
              </h2>
              <p style={{ color: "#64748b", fontSize: "12px", marginTop: "8px" }}>
                {activePanel ? `Exploration in progress...` : "Synchronizing data with the universe"}
              </p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(2); opacity: 0.5; }
                }
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          )}
          
          <div style={{ display: (isPageLoading || activePanel) ? "none" : "block", height: "100%" }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div >
  );
};
