const BASE_URL = "https://laundry-queue-app.onrender.com";

export const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem("token");
  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

// Corrected LOGIN
export const loginUser = (userData) => {
  return fetch(`${BASE_URL}/api/users/login`, {   // 🔹 changed /auth/login → /users/login
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
};

// Corrected SIGNUP
export const signupUser = (userData) => {
  return fetch(`${BASE_URL}/api/users/signup`, { // 🔹 changed /auth/register → /users/register
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
};