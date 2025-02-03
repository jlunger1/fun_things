"use client";

import { useState } from "react";
import axios from "axios";
import { auth } from "../utils/firebase";
import { MdAccessible } from "react-icons/md";
import { FaPaw } from "react-icons/fa";
import { ArrowUpward, Delete } from "@mui/icons-material"; // MUI icons
import { FiEdit2 } from "react-icons/fi"; // Edit icon

export default function AddContent() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [accessibility, setAccessibility] = useState(false);
  const [step, setStep] = useState(1);
  const [, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("url", url);
      formData.append("pets_allowed", petsAllowed.toString());
      formData.append("accessibility", accessibility.toString());
      if (image) formData.append("image", image);

      await axios.post("http://127.0.0.1:8000/core/add-activity/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Activity submitted successfully!");
    } catch (error) {
      setMessage("Error submitting activity.");
      console.error("Error:", error);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setTitle("");
    setUrl("");
    setDescription("");
    setPetsAllowed(false);
    setAccessibility(false);
    setStep(1);
    setMessage("");
  };

  return (
    <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg relative">
      {/* Centered Title */}
      <h2 className="text-2xl font-bold text-gray-800 text-center">Create Your Activity</h2>

      {message && <p className="text-green-600 text-center mt-2">{message}</p>}

      {!imagePreview ? (
        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-[50vh] md:h-[60vh] bg-gray-200 rounded-lg shadow-md mt-6">
          <div className="text-gray-500 text-lg">Click to add an image</div>
          <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      ) : (
        <>
          <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-200 rounded-lg shadow-md mt-6 overflow-hidden">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />

            {(accessibility || petsAllowed) && (
              <div className="absolute top-4 left-4 flex gap-3 text-white drop-shadow-lg z-20">
                {petsAllowed && <FaPaw className="text-4xl" />}
                {accessibility && <MdAccessible className="text-4xl" />}
              </div>
            )}

            {title && (
              <div className="absolute bottom-16 right-4 text-right">
                <h2 className="text-white text-2xl font-bold inline-block">
                  <a href={url || "#"} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {title}
                  </a>
                </h2>
                <button onClick={() => setStep(2)} className="ml-2 text-white">
                  <FiEdit2 />
                </button>
              </div>
            )}

            {description && (
              <div className="absolute inset-y-0 left-0 w-2/3 bg-black/70 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 z-10">
                <p className="text-lg">{description}</p>
                <button onClick={() => setStep(4)} className="absolute right-4 top-2 text-white">
                  <FiEdit2 />
                </button>
              </div>
            )}

            <button onClick={handleReset} className="absolute bottom-4 right-4 p-3 bg-red-600 text-white rounded-full hover:bg-red-700">
              <Delete />
            </button>
          </div>

          {/* Step-by-Step Forms (Only show until Additional Features appear) */}
          {step >= 2 && step < 5 && (
            <div className="mt-4 relative">
              <input
                type="text"
                value={step === 2 ? title : step === 3 ? url : step === 4 ? description : ""}
                onChange={(e) =>
                  step === 2
                    ? setTitle(e.target.value)
                    : step === 3
                    ? setUrl(e.target.value)
                    : step === 4
                    ? setDescription(e.target.value)
                    : null
                }
                placeholder={
                  step === 2
                    ? "Enter title"
                    : step === 3
                    ? "Add a URL (optional)"
                    : step === 4
                    ? "Add a description..."
                    : ""
                }
                className="w-full p-3 border rounded text-gray-900 pr-10"
              />
              <button
                onClick={() => setStep(step + 1)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-700 hover:text-blue-600 transition rounded-full"
              >
                <ArrowUpward />
              </button>
            </div>
            )}

            {/* Additional Features + Submit Button */}
            {step === 5 && (
            <div className="mt-4">
              <label className="block font-bold text-gray-800">Additional Features</label>
              <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={petsAllowed} onChange={() => setPetsAllowed(!petsAllowed)} className="w-5 h-5" />
                <span className="text-gray-800">Pets Allowed</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={accessibility} onChange={() => setAccessibility(!accessibility)} className="w-5 h-5" />
                <span className="text-gray-800">Accessibile</span>
              </label>
              </div>

              {/* Submit Button (Shows up with Additional Features) */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
