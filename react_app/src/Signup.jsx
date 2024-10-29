import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const postSignup = async ({ username, password }) => {
  const response = await fetch("http://localhost:4000/signup", {
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
  );
};

export default Signup;
