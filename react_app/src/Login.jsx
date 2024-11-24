import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setClaims, getClaims } from "./auth";
import { LOGIN_FAILED } from "./user-strings";

const API_VERSION = "/API/v1";

const URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/login`
    : `http://localhost:4000${API_VERSION}/login`;
const URL_FORGOT =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/forgot-password`
    : `http://localhost:4000${API_VERSION}/forgot-password`;

const postLogin = async ({ username, password }) => {
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

const postForgotPassword = async ({ username }) => {
  const response = await fetch(URL_FORGOT, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
    }),
  });
  return response;
};

const Login = ({ setAuthState }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const { mutateAsync } = useMutation({
    mutationFn: postLogin,
    onSuccess: async (data) => {
      if (data.ok) {
        const jsonData = await data.json();
        setAuthState({
          status: true,
          user: jsonData.payload,
        });
        navigate("/");
      } else {
        alert(LOGIN_FAILED);
      }
    },
  });

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Login</h2>
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
                Login
              </button>
            </form>
            <div className="mt-5">
              <button
                className="btn btn-link"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
              >
                Forgot password?
              </button>
              {showForgotPassword && (
                <div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(event) =>
                      setForgotPasswordEmail(event.target.value)
                    }
                  />
                  <button
                    className="btn btn-primary btn-block mt-3"
                    onClick={async () => {
                      const response = await postForgotPassword({
                        username: forgotPasswordEmail,
                      });
                      if (response.ok) {
                        alert("Reset link sent to email");
                      } else {
                        alert("Error sending reset link");
                      }
                    }}
                  >
                    Get reset link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
