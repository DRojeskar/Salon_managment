import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const registerUser = (data) => {
  const payload = { ...data };
  if (!payload.role) {
    payload.role = "customer";
  }
  return API.post("/auth/register", payload);
};

export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

export const createAdminUser = (data) => {
  return API.post("/auth/register", {
    ...data,
    role: "admin",
  }, {
    headers: {
      "x-admin-secret": data.adminSecret,
    },
  });
};