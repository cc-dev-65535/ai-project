import { useContext, useState } from "react";
import { AuthContext } from "./auth";
import { useMutation } from "@tanstack/react-query";

const Home = () => {
  const { status, user } = useContext(AuthContext);
  console.log(user);

  return <>{status ? <UserHome /> : <h1>Not logged in</h1>}</>;
};

const getModelResponse = async () => {
  const response = await fetch("http://localhost:4000/api", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response;
};

const UserHome = () => {
  const [modelText, setModelText] = useState("");

  const { mutateAsync } = useMutation({
    mutationFn: getModelResponse,
    onSuccess: async (data) => {
      if (data.ok) {
        jsonData = await data.json();
        console.log(jsonData);
        setModelText(jsonData.data);
      } else {
        alert("Some error occurred");
      }
    },
  });

  return (
    <>
      <button onClick={mutateAsync}>Get model response</button>
      <p>{modelText}</p>
    </>
  );
};

export default Home;
