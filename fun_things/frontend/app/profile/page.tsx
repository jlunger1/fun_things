"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, AccountCircle, AddBox } from "@mui/icons-material";
import Profile from "@/app/components/Profile";
import FirebaseAuth from "@/app/components/FirebaseAuth";
import { auth } from "@/app/utils/firebase";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 px-4 md:px-8 lg:px-12 py-6 relative">
      <div className="w-full max-w-5xl">
        {/* HEADER */}
        <header className="w-full text-center my-6">
          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-center gap-6 mt-4">
            <button
              onClick={() => router.push("/")}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              <Home fontSize="large" />
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              <AccountCircle fontSize="large" />
            </button>
            <button
              onClick={() => router.push("/add_content")}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              <AddBox fontSize="large" />
            </button>
          </div>
        </header>

        {/* PROFILE CONTENT */}
        <main className="w-full flex-grow flex flex-col items-center">
          {isLoggedIn ? (
            <Profile />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Log In
            </button>
          )}
        </main>

        {/* FOOTER */}
        <footer className="mt-auto py-6 text-gray-500 text-sm text-center">
          Made with ❤️ by FunThingNearMe
        </footer>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FirebaseAuth
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={() => setIsLoggedIn(true)}
          />
        </div>
      )}
    </div>
  );
}
