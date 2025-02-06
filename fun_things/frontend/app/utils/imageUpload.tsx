interface ImageUploadProps {
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
}

export default function ImageUpload({ handleImageChange, imagePreview }: ImageUploadProps) {
  return (
    <label className="block">
      <span className="text-gray-700">Upload an Image</span>
      <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full mt-1" />
      {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full h-auto" />}
    </label>
  );
}

