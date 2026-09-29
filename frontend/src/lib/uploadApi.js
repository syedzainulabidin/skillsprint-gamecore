const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function uploadForm(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const err = new Error(
      (data && data.error && data.error.message) || `HTTP ${res.status}`,
    );
    err.status = res.status;
    err.code = data && data.error && data.error.code;
    throw err;
  }
  return data;
}
