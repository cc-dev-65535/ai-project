import { useContext, useState } from "react";
import { AuthContext } from "./auth";
import { useMutation, useQuery } from "@tanstack/react-query";

const MODEL_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:4000/api";
const API_CALL_URL =
  process.env.NODE_ENV === "production"
    ? "/api-calls"
    : "http://localhost:4000/api-calls";

const Home = () => {
  const { status, user } = useContext(AuthContext);

  if (!status) {
    return <h1 className="text-center">Please log in to continue</h1>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">
              {user.permissions === "USER" ? "User Home" : "Admin Home"}
            </h2>
            {user.permissions === "USER" ? <UserHome /> : <AdminHome />}
          </div>
        </div>
      </div>
    </div>
  );
};
