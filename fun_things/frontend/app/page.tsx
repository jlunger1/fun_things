"use client"; // Ensures client-side rendering

import { useState, useEffect } from "react";
import axios from "axios";
import ThingCard from "./components/ThingCard";

interface Activity {
  id: number;
  title: string;
  description: string;
  park_name?: string;
  url?: string;
  image_url?: string;
  hashtags?: string[];
  pets_allowed?: boolean;
  accessibility?: boolean;
}

export default function Home() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true); // Start in loading state

  // Fetch a random activity
  const fetchRandomActivity = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Activity>("http://127.0.0.1:8000/core/random-activity/");
      setActivity(res.data);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
    setLoading(false);
  };

  // Load an initial activity when the component mounts
  useEffect(() => {
    fetchRandomActivity();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      {/* HEADER */}
      <header className="w-full max-w-4xl text-center my-6">
        <h1 className="text-4xl font-bold text-gray-900">Fun Things To Do Near Me</h1>
        <p className="text-gray-600 mt-2">Discover cool activities near you!</p>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-2xl flex flex-col items-center">
        {loading ? (
          <p className="text-gray-500 text-lg">Loading...</p>
        ) : (
          activity && <ThingCard thing={activity} onNextActivity={fetchRandomActivity} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto py-4 text-gray-500 text-sm">
        Made with ❤️ by FunThingsToDoNearMe
      </footer>
    </div>
  );
}
