import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

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
  return response.json();
};

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { mutateAsync } = useMutation({
    mutationFn: postSignup,
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutateAsync({ username, password });
      }}
    >
      <label>Username</label>
      <input
        type="text"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button type="submit">Signup</button>
    </form>
  );
};

export default Signup;
