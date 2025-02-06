import { useState, useRef } from "react";

export function useImageUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageRemove = (e?: React.MouseEvent) => {
    // Prevent the click from bubbling up to parent elements
    e?.stopPropagation();

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);

    // Reset the file input using the ref
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    image,
    imagePreview,
    handleImageChange,
    handleImageRemove,
    fileInputRef, // Export the ref to be used in the input element
  };
}
