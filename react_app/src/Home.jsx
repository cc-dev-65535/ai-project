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

const getModelResponse = async ({ inputText }) => {
  const response = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: inputText,
    }),
  });

  // Only parse JSON if response is okay
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Error fetching model response");
  }
};

const getApiCalls = async () => {
  const response = await fetch(API_CALL_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("An error occurred in fetching API calls");
  }
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
    onSuccess: (data) => {
      setModelText(data.data);
    },
    onError: () => {
      setModelText("An error occurred while getting the model response");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  return (
    <div className="d-flex flex-column" style={{ width: "250px", gap: "10px" }}>
      <input
        type="text"
        placeholder="Enter story prompt"
        value={inputText}
        onChange={onInputChange}
        className="form-control"
      />
      <button
        onClick={() => {
          setLoading(true);
          setModelText("");
          mutateAsync({ inputText });
        }}
        className="btn btn-primary"
      >
        Get model response
      </button>
      {loading && <p>Loading...</p>}
      <p style={{ whiteSpace: "pre-wrap" }}>{modelText}</p>
    </div>
  );
};

const AdminHome = () => {
  const [modelText, setModelText] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLoading, isError, data } = useQuery({
    queryKey: ["api-calls"],
    queryFn: getApiCalls,
  });

  const onInputChange = (event) => {
    setInputText(event.target.value);
  };

  const { mutateAsync } = useMutation({
    mutationFn: getModelResponse,
    onSuccess: (data) => {
      setModelText(data.data);
    },
    onError: () => {
      setModelText("An error occurred while getting the model response");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  return (
    <div>
      <h3>Admin Dashboard</h3>
      {isLoading && <p>Loading data...</p>}
      {isError && <p>Error loading data</p>}
      {data && (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Username</th>
              <th>API Calls</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((user, index) => (
              <tr key={index}>
                <td>{user.username}</td>
                <td>{user.api_calls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="d-flex flex-column" style={{ width: "250px", gap: "10px", marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter story prompt"
          value={inputText}
          onChange={onInputChange}
          className="form-control"
        />
        <button
          onClick={() => {
            setLoading(true);
            setModelText("");
            mutateAsync({ inputText });
          }}
          className="btn btn-primary"
        >
          Get model response
        </button>
      </div>
      {loading && <p>Loading...</p>}
      <p style={{ whiteSpace: "pre-wrap" }}>{modelText}</p>
    </div>
  );
};

export default Home;
