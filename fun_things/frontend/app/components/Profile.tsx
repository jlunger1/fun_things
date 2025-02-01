"use client";

import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

export default function Profile() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // ✅ Optionally reload the page to reflect logout state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-3xl font-bold text-gray-800">Profile</h2>
      <p className="text-gray-500 mt-4">You are logged in.</p>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
