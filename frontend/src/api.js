const BASE_URL = "https://laundry-queue-app.onrender.com";

export const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem("token");

  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });
};

// ✅ LOGIN (FIXED)
export const loginUser = (userData) => {
  return fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
};

// ✅ SIGNUP (FIXED)
export const signupUser = (userData) => {
  return fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
};