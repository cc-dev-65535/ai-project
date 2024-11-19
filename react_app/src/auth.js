import { useState, useEffect, createContext } from "react";

const LOGIN_CHECK_URL =
  process.env.NODE_ENV === "production"
    ? "https://client-app-ebon.vercel.app/login-check"
    : "http://localhost:4000/login-check";
const LOGOUT_URL =
  process.env.NODE_ENV === "production"
    ? "https://client-app-ebon.vercel.app/logout"
    : "http://localhost:4000/logout";

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
