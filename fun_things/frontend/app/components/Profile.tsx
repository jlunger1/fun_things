"use client";

import { useState, useEffect } from "react";

export default function Profile({ onLogin, onLogout }: { onLogin: () => void; onLogout: () => void }) {
  const [user, setUser] = useState<{ username: string; email: string; city: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      fetch("http://127.0.0.1:8000/api/profile/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Unauthorized");
          }
          return res.json();
        })
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
          setLoading(false);
          onLogout(); // ✅ Ensure logout updates global state
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    onLogout(); // ✅ Ensure logout updates global state
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-3xl font-bold text-gray-800">Profile</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : user ? (
        <>
          <p className="text-gray-600 mt-3">👤 <strong>Username:</strong> {user.username}</p>
          <p className="text-gray-600">📧 <strong>Email:</strong> {user.email}</p>
          <p className="text-gray-600">📍 <strong>City:</strong> {user.city || "Not set"}</p>

          <button
            onClick={handleLogout}
            className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-500 mt-4">You are not logged in.</p>
          <button
            onClick={onLogin}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </>
      )}
    </div>
  );
}
