import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getTokenPayload } from "./auth";

const URL =
  process.env.NODE_ENV === "production"
    ? "/login"
    : "http://localhost:4000/login";

const postLogin = async ({ username, password }) => {
  const response = await fetch(URL, {
    method: "POST",
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

const Login = ({ setAuthState }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { mutateAsync } = useMutation({
    mutationFn: postLogin,
    onSuccess: async (data) => {
      if (data.ok) {
        const jsonData = await data.json();
        login(jsonData.token);
        setAuthState({
          status: true,
          user: getTokenPayload(),
        });
        navigate("/");
      } else {
        alert("Invalid username or password");
      }
    },
  });

  return (
    <div>
      <h1>Login</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutateAsync({ username, password });
        }}
      >
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
