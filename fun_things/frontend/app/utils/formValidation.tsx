export function validateForm({ title, url, description, location, locationCoords, image }: any) {
  const errors: Record<string, string> = {};

  if (!title.trim()) errors.title = "Title is required.";
  if (!url.trim()) {
    errors.url = "URL is required.";
  } else if (!/^https?:\/\/.+\..+/.test(url)) {
    errors.url = "Invalid URL format. Must start with http:// or https://";
  }
  if (!description.trim()) errors.description = "Description is required.";
  if (!location.trim() || !locationCoords) errors.location = "Please select a valid location.";
  if (!image) errors.image = "Please upload an image.";

  return errors;
}

