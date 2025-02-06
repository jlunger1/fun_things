"use client";

import { useState } from "react";
import { validateForm } from "../utils/formValidation";
import { auth } from "../utils/firebase";
import { useGoogleMaps } from "../hooks/useGoogleMaps";
import { useImageUpload } from "../hooks/useImageUpload";
import ImageUpload from "../utils/imageUpload";
import ThingCard from "./ThingCard"; // ✅ Importing ThingCard for live preview

export default function AddContent() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(""); // ✅ Separate location state
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [accessibility, setAccessibility] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setLoading] = useState(false);

  const { inputRef, locationCoords } = useGoogleMaps(setLocation); // ✅ Set location, not description
  const { image, imagePreview, setImage, handleImageChange } = useImageUpload();
  const [imagePreviewState, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async () => {
    setMessage("");
    setErrors({}); // ✅ Clear previous errors
    setLoading(true);

    // ✅ Perform validation first
    const validationErrors = validateForm({
        title,
        url,
        description,
        location,
        locationCoords,
        image,
    });

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false); // ✅ Stop loading if validation fails
        return;
    }

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
            location: { address: location, latitude: locationCoords?.lat, longitude: locationCoords?.lng },
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
            setImagePreview(null); // ✅ Reset image preview

            // ✅ Reset file input manually
            if (inputRef.current) {
                inputRef.current.value = "";
            }

            // ✅ Reset ThingCard preview image
            setImagePreview("");

            // Update ThingCard preview
            liveThing.id = result.id;
            liveThing.title = title;
            liveThing.url = url;
            liveThing.description = description;
            liveThing.image_url = ""; // ✅ Blank out image after submission
            liveThing.pets_allowed = petsAllowed;
            liveThing.accessibility = accessibility;

        } else {
            setMessage(`Error: ${result.error}`);
        }
    } catch (error) {
        setMessage("Error submitting activity.");
        console.error("Error:", error);
    }

    setLoading(false);
  };

  // ✅ Live ThingCard Data
  const liveThing = {
    id: Date.now(), // Temporary ID for preview
    title: title || "Untitled Activity", // Default text if empty
    url: url || "#",
    description: description || "No description yet.",
    image_url: imagePreviewState || "", // ✅ Use preview state
    pets_allowed: petsAllowed,
    accessibility: accessibility,
  };

  return (
    <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Create Your Activity</h2>

      {/* ✅ Darker message text */}
      {message && <p className="text-gray-900 font-semibold text-center mt-2">{message}</p>}

      {/* ✅ Live Preview of ThingCard */}
      <ThingCard
        thing={liveThing}
        onNextActivity={() => {}}
        isLoggedIn={false} // No auth logic needed for preview
        onRequireLogin={() => {}}
        showRegister={false}
      />

      {/* Image Upload */}
      <ImageUpload handleImageChange={handleImageChange} imagePreview={imagePreviewState} />

      {/* Form Fields */}
      <label className="block">
        <span className="text-gray-700">Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-md bg-gray-100 text-gray-900"
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
      </label>

      <label className="block">
        <span className="text-gray-700">URL</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border rounded-md bg-gray-100 text-gray-900"
        />
        {errors.url && <p className="text-red-500 text-sm">{errors.url}</p>}
      </label>

      {/* ✅ Fixed: Location and Description Are Separate */}
      <label className="block">
        <span className="text-gray-700">Location</span>
        <input
          ref={inputRef}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Select a location..."
          className="w-full p-2 border rounded-md bg-gray-100 text-gray-900"
        />
        {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
      </label>

      <label className="block">
        <span className="text-gray-700">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md bg-gray-100 text-gray-900"
          rows={3}
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
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
        <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">
          Submit
        </button>
      </div>
    </div>
  );  
}
