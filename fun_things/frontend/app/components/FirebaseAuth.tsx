"use client";

import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { EmailAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import "firebaseui/dist/firebaseui.css"; // Keep FirebaseUI styles
import axios from "axios";

export default function FirebaseAuth({ onClose, onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Track Sign-In vs Sign-Up
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      // ✅ Get Firebase token
      const token = await userCredential.user.getIdToken();

      // ✅ Send token to Django for registration/login
      // try {
      //  await axios.post("http://127.0.0.1:8000/core/register-or-login/", {}, {
      //    headers: { Authorization: `Bearer ${token}` },
      //  });
      // } catch (error) {
      //  console.error("❌ Error registering user in Django:", error);
      // }

      onAuthSuccess(); // Notify parent that authentication succeeded
      onClose(); // Close modal
    } catch (error: any) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">{isSignUp ? "Sign Up" : "Sign In"}</h2>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <form onSubmit={handleAuth} className="space-y-4 mt-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700" disabled={loading}>
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 text-blue-600 hover:underline">
        {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
      </button>

      <button onClick={onClose} className="mt-4 text-gray-600 hover:underline block">Close</button>
    </div>
  );
}
