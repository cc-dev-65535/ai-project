import { useState, useEffect, createContext } from "react";

const API_VERSION = "/API/v1";

const LOGIN_CHECK_URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/login-check`
    : `http://localhost:4000${API_VERSION}/login-check`;
const LOGOUT_URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/logout`
    : `http://localhost:4000${API_VERSION}/logout`;

const AuthContext = createContext(null);

const loginCheck = async () => {
  try {
    const response = await fetch(LOGIN_CHECK_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Invalid login");
    }

    const data = await response.json();
    return data.payload;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const logout = async () => {
  try {
    const response = await fetch(LOGOUT_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Invalid login");
    }

    const data = await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { AuthContext, loginCheck, logout };
