import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const api = axios.create({ baseURL: API, timeout: 15000 });

export const formatINR = (value) => {
  if (value === null || value === undefined) return null;
  return `₹${Number(value).toLocaleString("en-IN")}`;
};
