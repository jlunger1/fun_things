"use client"; // Ensures client-side rendering

import { useState } from "react";
import axios from "axios";

export default function AuthModal({ onClose, onAuthSuccess }: { onClose: () => void; onAuthSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false); // Tracks if we're in login mode

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
  
    try {
      let res;
      if (isLogin) {
        // LOGIN REQUEST
        res = await axios.post("http://127.0.0.1:8000/core/login/", {
          username: formData.username,
          password: formData.password,
        });
      } else {
        // REGISTER REQUEST
        res = await axios.post("http://127.0.0.1:8000/api/register/", formData);
      }
  
      // ✅ Ensure tokens are stored
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
  
      setMessage(isLogin ? "Login successful! 🎉" : "User registered successfully! 🎉");
  
      // ✅ Ensure parent component knows user is logged in
      onAuthSuccess();
  
      // ✅ Close modal
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      setError(error.response?.data?.error || (isLogin ? "Login failed." : "Registration failed."));
    }
  
    setLoading(false);
  };
  
  
  return (
    <div className="relative w-full max-w-sm">
      {/* Cancel Button - Top Right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
      >
        ✖
      </button>

      <h2 className="text-3xl font-bold text-gray-800 text-center">
        {isLogin ? "Log In" : "Create an Account"}
      </h2>
      <p className="text-gray-500 text-center mb-6">
        {isLogin ? "Welcome back! Log in to continue." : "Join to explore fun activities near you!"}
      </p>

      {message && <p className="text-green-600 text-center font-semibold">{message}</p>}
      {error && <p className="text-red-500 text-center font-semibold">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username (Always Required) */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          onChange={handleChange}
          required
        />

        {/* Email & City (Only for Register) */}
        {!isLogin && (
          <>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={handleChange}
              required
            />
          </>
        )}

        {/* Password (Always Required) */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          onChange={handleChange}
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl font-semibold hover:opacity-90 transform transition duration-200 active:scale-95"
          disabled={loading}
        >
          {loading ? (isLogin ? "Logging in..." : "Registering...") : isLogin ? "Log In" : "Sign Up"}
        </button>
      </form>

      {/* Toggle Between Login & Register */}
      <p className="text-center text-gray-500 mt-4">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:underline font-semibold"
        >
          {isLogin ? "Sign Up" : "Log In"}
        </button>
      </p>
    </div>
  );
}
