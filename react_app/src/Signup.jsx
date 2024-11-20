import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_VERSION = "/API/v1";

const URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/signup`
    : `http://localhost:4000${API_VERSION}/signup`;

const postSignup = async ({ username, password }) => {
  const response = await fetch(URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
  return response;
};

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { mutateAsync } = useMutation({
    mutationFn: postSignup,
    onSuccess: (data) => {
      if (data.ok) {
        navigate("/login");
      } else {
        alert("An error occurred");
      }
    },
  });

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Sign Up</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                mutateAsync({ username, password });
              }}
            >
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
