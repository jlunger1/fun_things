import { auth } from "@/utils/firebase";

export async function uploadImage(image: File) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("User not authenticated");

  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch("http://127.0.0.1:8000/core/upload-image/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    console.warn("Image upload failed.");
    return "";
  }

  const data = await response.json();
  return data.image_url;
}

export async function submitForm(data: any) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("User not authenticated");

  const response = await fetch("http://127.0.0.1:8000/core/create-activity/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  return response;
}

