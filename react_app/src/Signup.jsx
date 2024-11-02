import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const URL =
  process.env.NODE_ENV === "production" ? "/signup" : "http://localhost:4000/signup";

const postSignup = async ({ username, password }) => {
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
    <div>
    <h1>Signup</h1>
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
      <button type="submit">Signup</button>
    </form>
    </div>
  );
};

export default Signup;
