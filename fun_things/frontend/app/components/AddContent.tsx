"use client";

import { useState, useRef, useEffect } from "react";
import { auth } from "../utils/firebase";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";
import { MdAccessible } from "react-icons/md";
import { FaPaw } from "react-icons/fa";
import { Favorite, FavoriteBorder, ThumbUp, ThumbDown } from "@mui/icons-material";

export default function AddContent() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState(""); // ✅ URL field is here!
  const [description, setDescription] = useState(""); // ✅ Description field is here!
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [accessibility, setAccessibility] = useState(false);
  const [location, setLocation] = useState(""); 
  const [saved, setSaved] = useState(false);
  const [, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Load Google Maps Places API for location autocomplete
  useEffect(() => {
    loadGoogleMaps(() => {
      if (!inputRef.current) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setLocation(place.formatted_address);
          if (inputRef.current) inputRef.current.value = place.formatted_address;
        }
      });
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("User not authenticated");

        let imageUrl = "";
        if (image) {
            try {
                const formData = new FormData();
                formData.append("image", image);

                const uploadResponse = await fetch("http://127.0.0.1:8000/core/upload-image/", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    console.warn("Image upload failed, continuing without image.");
                } else {
                    const uploadData = await uploadResponse.json();
                    imageUrl = uploadData.image_url;
                }
            } catch (uploadError) {
                console.warn("Image upload error:", uploadError);
            }
        }

        const data = {
            title,
            description,
            url,
            image_url: imageUrl,
            accessibility: !!accessibility,
            pets_allowed: !!petsAllowed,
        };

        const response = await fetch("http://127.0.0.1:8000/core/create-activity/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            setMessage("Activity submitted successfully!");

            // ✅ Clear form fields after submission
            setTitle("");
            setUrl("");
            setDescription("");
            setLocation("");
            setPetsAllowed(false);
            setAccessibility(false);
            setImage(null);
            setImagePreview(null);
            setSaved(false);

            // ✅ Reset file input manually
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        } else {
            setMessage(`Error: ${result.error}`);
        }
    } catch (error) {
        setMessage("Error submitting activity.");
        console.error("Error:", error);
    }

    setLoading(false);
};


  return (
    <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Create Your Activity</h2>
      {message && <p className="text-green-600 text-center mt-2">{message}</p>}

      {/* 🔹 ThingCard-Style Preview */}
      <div className="relative w-full h-[45vh] md:h-[55vh] rounded-2xl overflow-hidden shadow-lg mt-6 bg-gray-300">
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">No Image Available</div>
        )}

        {/* Floating Icons - Top Left (Pets & Accessibility) */}
        {(petsAllowed || accessibility) && (
          <div className="absolute top-4 left-4 flex gap-3 text-white drop-shadow-lg z-20">
            {petsAllowed && <FaPaw className="text-4xl" />}
            {accessibility && <MdAccessible className="text-4xl" />}
          </div>
        )}

        {/* Floating Icons - Top Right (Heart & Thumbs Up/Down) */}
        <div className="absolute top-4 right-4 flex flex-col items-center gap-5 z-20">
          {/* Heart (Favorite) */}
          <button className="hover:scale-110 transition text-white drop-shadow-lg" onClick={() => setSaved(!saved)}>
            {saved ? <Favorite fontSize="large" /> : <FavoriteBorder fontSize="large" />}
          </button>
          {/* Thumbs Up */}
          <button className="hover:scale-110 transition text-white drop-shadow-lg">
            <ThumbUp fontSize="large" />
          </button>
          {/* Thumbs Down */}
          <button className="hover:scale-110 transition text-white drop-shadow-lg">
            <ThumbDown fontSize="large" />
          </button>
        </div>

        {/* Title & Location Overlay */}
        {(title || location) && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
            {title && (
              <h2 className="text-white text-2xl font-bold">
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {title}
                </a>
              </h2>
            )}
            {location && <p className="text-white text-sm">{location}</p>}
          </div>
        )}

        {/* Description Overlay (Appears on the Left Side Only) */}
        {description && (
          <div className="absolute inset-y-0 left-0 w-2/3 bg-black/70 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
            <p className="text-lg">{description}</p>
          </div>
        )}
      </div>

      {/* 🔹 Form Fields */}
      <div className="mt-6 space-y-4">
        {/* Image Upload */}
        <label className="block">
          <span className="text-gray-700">Upload an Image</span>
          <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full mt-1" />
        </label>

        {/* Title */}
        <label className="block">
          <span className="text-gray-700">Title</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 text-gray-900" placeholder="Enter title" />
        </label>

        {/* URL */}
        <label className="block">
          <span className="text-gray-700">URL</span>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 text-gray-900" placeholder="Enter a URL" />
        </label>

        {/* Location Input (Google Maps Autocomplete) */}
        <label className="block">
          <span className="text-gray-700">Location</span>
          <input ref={inputRef} type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Start typing a location..." className="w-full p-2 border rounded-md bg-gray-100 text-gray-900" />
        </label>

        {/* Description */}
        <label className="block">
          <span className="text-gray-700">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md bg-gray-100 text-gray-900" placeholder="Enter description" rows={3} />
        </label>

        {/* Features */}
                <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={petsAllowed} onChange={() => setPetsAllowed(!petsAllowed)} className="w-5 h-5" />
            <span className="text-gray-800">Pets Allowed</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={accessibility} onChange={() => setAccessibility(!accessibility)} className="w-5 h-5" />
            <span className="text-gray-800">Accessible</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">Submit</button>
        </div>
      </div>
    </div>
  );
}
