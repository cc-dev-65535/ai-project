import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

const API_VERSION = "/API/v1";

const URL_RESET =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/reset-password`
    : `http://localhost:4000${API_VERSION}/reset-password`;

const postResetPassword = async ({ password, id }) => {
  const response = await fetch(`${URL_RESET}?id=${id}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password,
    }),
  });
  return response;
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const { mutateAsync } = useMutation({
    mutationFn: postResetPassword,
    onSuccess: async (data) => {
      if (data.ok) {
        alert("Password reset successfully");
      } else {
        alert("Error resetting password");
      }
    },
  });

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Reset Password</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                mutateAsync({ password, id: searchParams.get("id") });
              }}
            >
              <div className="form-group">
                <label>Password</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
