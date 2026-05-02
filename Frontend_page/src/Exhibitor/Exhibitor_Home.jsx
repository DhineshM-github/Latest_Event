import React, { useEffect } from "react";
import ExhibitorNavbar from "./Navbar";
import { useSelector } from "react-redux";

const ExhibitorHome = () => {
  const user = useSelector((state) => state.user);

  // ✅ Store user in session (fallback)
  useEffect(() => {
    if (user?.id && user?.name) {
      sessionStorage.setItem("userId", user.id);
      sessionStorage.setItem("userName", user.name);
    }
  }, [user]);

  // ✅ Get user (Redux or Session)
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const displayUser = user?.id ? user : storedUser;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      {/* 🔹 Navbar */}
      <ExhibitorNavbar />

      {/* 🔹 Welcome Section */}
      <div className="flex flex-col items-center justify-center h-[85vh] text-center px-4">
        
        <h1 className="text-4xl font-bold mb-4">
          Welcome Exhibitor 👋
        </h1>

        <p className="text-lg text-slate-300 mb-2">
          Hello, <span className="font-semibold">{displayUser.name || "User"}</span>
        </p>

        {/* Optional Info */}
        <div className="mt-6 text-slate-400 text-sm">
          <p>Manage your event bookings and explore upcoming events.</p>
        </div>

      </div>
    </div>
  );
};

export default ExhibitorHome;