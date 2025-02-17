"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import axios from "axios";
import ThingCard from "@/app/components/ThingCard";
import FirebaseAuth from "@/app/components/FirebaseAuth";
import { Home, AccountCircle, AddBox } from "@mui/icons-material";
import { auth } from "@/app/utils/firebase";
import { useUserLocation } from "@/app/hooks/useUserLocation";
import { useRouter, useSearchParams } from "next/navigation";

interface Activity {
  id: number;
  image_url?: string;
  title: string;
  url: string;
  description: string;
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 px-4 md:px-8 lg:px-12 py-6 relative">
      <Suspense fallback={<div>Loading...</div>}>
        <HomePageContent />
      </Suspense>
    </div>
  );
}

function HomePageContent() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const { location, error, getLocation } = useUserLocation();
  const longitude = location?.longitude;
  const latitude = location?.latitude;

  const searchParams = useSearchParams();
  const activityIdFromURL = searchParams.get("activity_id");
  const router = useRouter();

  // Track whether fetching has already happened to prevent multiple fetches
  const hasFetchedActivity = useRef(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoadingLocation(true);
      await getLocation();
      setIsLoadingLocation(false);
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    if (!isLoadingLocation && latitude && longitude && !hasFetchedActivity.current) {
      hasFetchedActivity.current = true; // Prevent duplicate fetching
      fetchActivity(true, activityIdFromURL ? Number(activityIdFromURL) : undefined);
    }
  }, [latitude, longitude, activityIdFromURL, isLoadingLocation]);

  const fetchActivity = async (isInitialFetch = false, activityId?: number) => {
    if (!latitude || !longitude) return; // Ensure we do not fetch without valid location data

    setInitialLoading(isInitialFetch);
    try {
      const res = await axios.get<Activity>(
        `http://127.0.0.1:8000/core/get-activity/?latitude=${latitude}&longitude=${longitude}`,
      );
      setActivity(res.data);
    } catch (error) {
      console.error("❌ Error fetching activity:", error);
    }
    setInitialLoading(false);
  };

  const handleProtectedClick = (path: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
    } else {
      router.push(path);
    }
  };

  if (isLoadingLocation || !latitude || !longitude) {
    return (
      <div className="w-full max-w-5xl flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 text-lg">Getting your location...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl">
      <header className="w-full text-center my-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Fun Thing Near Me
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Discover something cool near you!
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={() => router.push("/")}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            <Home fontSize="large" />
          </button>
          <button
            onClick={() => handleProtectedClick("/profile")}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            <AccountCircle fontSize="large" />
          </button>
          <button
            onClick={() => handleProtectedClick("/add_content")}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            <AddBox fontSize="large" />
          </button>
        </div>
      </header>

      <main className="w-full flex-grow flex flex-col items-center">
        {initialLoading ? (
          <p className="text-gray-500 text-lg text-center">Loading...</p>
        ) : (
          activity && (
            <ThingCard
              thing={activity}
              onNextActivity={() => fetchActivity(false)}
              isLoggedIn={isLoggedIn}
              onRequireLogin={() => setShowAuthModal(true)}
              showRegister={showAuthModal}
            />
          )
        )}
      </main>

      <footer className="mt-auto py-6 text-gray-500 text-sm text-center">
        Made with ❤️ by FunThing
      </footer>

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
