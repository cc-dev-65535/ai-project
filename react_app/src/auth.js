import { useState, useEffect, createContext } from "react";

const AuthContext = createContext(null);

const getTokenPayload = () => {
  const token = localStorage.getItem("token");
  if (token === null) {
    return null;
  }
  try {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    return null;
  }
};

const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    return token !== null;
};

const logout = () => {
  localStorage.removeItem("token");
  // window.location.href = "/login";
};

const login = (token) => {
  localStorage.setItem("token", token);
};

export { isLoggedIn, login, logout, getTokenPayload, AuthContext };
