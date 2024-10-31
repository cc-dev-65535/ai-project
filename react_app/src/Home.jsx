import { useContext, useState } from "react";
import { AuthContext } from "./auth";
import { useMutation } from "@tanstack/react-query";

const URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:4000/api";

const Home = () => {
  const { status, user } = useContext(AuthContext);
  console.log(user);

  if (!status) {
    return <h1>Not logged in</h1>;
  }

  return (
    <>
      {user.permissions === "USER" ? (
        <>
          <h1>User Home</h1>
          <UserHome />
        </>
      ) : (
        <>
          <h1>Admin Home</h1>
          <AdminHome />
        </>
      )}
    </>
  );
};

const getModelResponse = async ({ inputText }) => {
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: inputText,
    }),
  });
  return response;
};

const UserHome = () => {
  const [modelText, setModelText] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const onInputChange = (event) => {
    setInputText(event.target.value);
  };

  const { mutateAsync } = useMutation({
    mutationFn: getModelResponse,
    onSuccess: async (data) => {
      if (data.ok) {
        const jsonData = await data.json();
        console.log(jsonData);
        setModelText(jsonData.data);
      } else {
        console.log(data);
        setModelText("Some error occurred");
      }
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  return (
    <>
      <input
        type="text"
        placeholder="Enter story prompt"
        value={inputText}
        onChange={onInputChange}
      />
      <button
        onClick={() => {
          setLoading(true);
          setModelText("");
          mutateAsync({ inputText });
        }}
      >
        Get model response
      </button>
      {loading && <p>Loading...</p>}
      <p style={{ whiteSpace: "pre-wrap" }}>{modelText}</p>
    </>
  );
};

const AdminHome = () => {
  const [modelText, setModelText] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const onInputChange = (event) => {
    setInputText(event.target.value);
  };

  const { mutateAsync } = useMutation({
    mutationFn: getModelResponse,
    onSuccess: async (data) => {
      if (data.ok) {
        const jsonData = await data.json();
        console.log(jsonData);
        setModelText(jsonData.data);
      } else {
        console.log(data);
        setModelText("Some error occurred");
      }
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  return (
    <>
      <p>Admin stuff goes here</p>
      <input
        type="text"
        placeholder="Enter story prompt"
        value={inputText}
        onChange={onInputChange}
      />
      <button
        onClick={() => {
          setLoading(true);
          setModelText("");
          mutateAsync({ inputText });
        }}
      >
        Get model response
      </button>
      {loading && <p>Loading...</p>}
      <p style={{ whiteSpace: "pre-wrap" }}>{modelText}</p>
    </>
  );
};

export default Home;
