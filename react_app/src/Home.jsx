import { useContext, useState } from "react";
import { AuthContext } from "./auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LOADING,
  LOADING_ERROR,
  LOGIN_REQUIRED,
  MAX_CALLS,
  SPEECH_ERROR,
} from "./user-strings";

const API_VERSION = "/API/v1";

const MODEL_URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/api`
    : `http://localhost:4000${API_VERSION}/api`;
const API_CALL_URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/api-calls`
    : `http://localhost:4000${API_VERSION}/api-calls`;
const API_CALL_USER_URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/api-calls-user`
    : `http://localhost:4000${API_VERSION}/api-calls-user`;
const ENDPOINT_CALL_URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/api-calls-endpoint`
    : `http://localhost:4000${API_VERSION}/api-calls-endpoint`;
const STORY_URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/story`
    : `http://localhost:4000${API_VERSION}/story`;

const Home = () => {
  const authState = useContext(AuthContext);

  if (!authState?.status) {
    return <h1 className="text-center">{LOGIN_REQUIRED}</h1>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">
              {authState.user.permissions === "USER"
                ? "User Home"
                : "Admin Home"}
            </h2>
            {authState.user.permissions === "USER" ? (
              <UserHome />
            ) : (
              <AdminHome />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getModelResponse = async ({ inputText }) => {
  const response = await fetch(MODEL_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: inputText,
    }),
  });

  try {
    const data = await response.json();
    console.log("Raw API response:", data); // Debug log
    if (!response.ok)
      throw new Error(data.error || "Error fetching model response");
    return data;
  } catch (error) {
    console.error("API error:", error); // Debug log
    throw new Error(
      "Server returned an invalid response. Check if the server is running and accessible."
    );
  }
};

const getApiCallsUser = async () => {
  const response = await fetch(API_CALL_USER_URL, {
    method: "GET",
    credentials: "include",
  });

  try {
    const data = await response.json();
    if (!response.ok) throw new Error("Error fetching API call data");
    return data;
  } catch (error) {
    throw new Error(
      "Server returned an invalid response. Check if the server is running and accessible."
    );
  }
};

const storyAPICall = async (url, method, data = null, headers = {}) => {
  const option = {
    method: method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (data) option.body = JSON.stringify(data);

  try {
    console.log("Story API request:", url, option);
    const response = await fetch(url, option);
    const data = await response.json();
    console.log("Story API response:", data);
    if (!response.ok)
      throw new Error(data.error || "Error fetching database response");
    return data;
  } catch (error) {
    console.error("API error:", error);
    throw new Error(
      "Server returned an invalid response. Check if the server is running and accessible."
    );
  }
};

const storyAPI = {
  post: (url, data) => storyAPICall(url, "POST", data),
};

const UserHome = () => {
  const [modelText, setModelText] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data: apiCallsData } = useQuery({
    queryKey: ["api-calls", user.username],
    queryFn: getApiCallsUser,
  });

  const speak = () => {
    console.log("Attempting to speak:", modelText); // Debug log
    if (!modelText) {
      console.log("No text to speak"); // Debug log
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(modelText);
    utterance.rate = speechRate;

    utterance.onstart = () => {
      console.log("Speech started"); // Debug log
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      console.log("Speech ended"); // Debug log
      setIsSpeaking(false);
    };
    utterance.onerror = (event) => {
      console.error("Speech error:", event); // Debug log
      setIsSpeaking(false);
      setError(SPEECH_ERROR);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    console.log("Stopping speech"); // Debug log
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const onInputChange = (event) => {
    setInputText(event.target.value);
  };

  const { mutateAsync } = useMutation({
    mutationFn: getModelResponse,
    onSuccess: (data) => {
      console.log("Setting model text:", data.data); // Debug log
      setModelText(data.data);
      setError(null);
    },
    onError: (error) => {
      console.error("Mutation error:", error); // Debug log
      setError(error.message);
      setModelText("");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["api-calls"]);
      setLoading(false);
    },
  });

  return (
    <div
      className="d-flex flex-column"
      style={{ width: "100%", maxWidth: "600px", gap: "10px" }}
    >
      <div className="card mb-3">
        <div className="card-body">
          <p>
            Current API calls: {apiCallsData?.data?.api_calls ?? "loading..."}
          </p>
          {(apiCallsData?.data?.api_calls ?? 0) > 20 && (
            <p className="text-danger">{MAX_CALLS}</p>
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Enter story prompt"
        value={inputText}
        onChange={onInputChange}
        className="form-control"
      />
      <button
        onClick={() => {
          console.log("Generating response for:", inputText); // Debug log
          setLoading(true);
          setModelText("");
          setSaved(false);
          mutateAsync({ inputText });
        }}
        className="btn btn-primary"
        disabled={loading || !inputText}
      >
        Get Model Response
      </button>
      <button
        onClick={isSpeaking ? stopSpeaking : speak}
        className={`btn ${isSpeaking ? "btn-danger" : "btn-success"} w-100`}
      >
        {isSpeaking ? "Stop Reading" : "Read Story"}
      </button>

      {loading && <p>{LOADING}</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {modelText && (
        <div className="mt-3">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Generated Story</h5>
              <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                {modelText}
              </p>
              <button
                onClick={async () => {
                  setSaving(true);
                  await storyAPI.post(STORY_URL, {
                    story: modelText,
                    title: inputText.slice(0, 36),
                  });
                  setSaving(false);
                  setSaved(true);
                }}
                className="btn btn-primary"
                disabled={saving || saved}
              >
                {saving ? "Saving..." : saved ? "Story Saved" : "Save Story"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Text-to-Speech Controls</h5>
          <div className="d-flex align-items-center gap-2 mb-3">
            <label>Speed:</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="form-range flex-grow-1"
              style={{ maxWidth: "200px" }}
            />
            <span>{speechRate}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getApiCalls = async () => {
  const response = await fetch(API_CALL_URL, {
    method: "GET",
    credentials: "include",
  });

  try {
    const data = await response.json();
    if (!response.ok) throw new Error("Error fetching API call data");
    return data;
  } catch (error) {
    throw new Error(
      "Server returned an invalid response. Check if the server is running and accessible."
    );
  }
};

const getEndpointCalls = async () => {
  const response = await fetch(ENDPOINT_CALL_URL, {
    method: "GET",
    credentials: "include",
  });

  try {
    const data = await response.json();
    if (!response.ok) throw new Error("Error fetching API call data");
    return data;
  } catch (error) {
    throw new Error(
      "Server returned an invalid response. Check if the server is running and accessible."
    );
  }
};

const AdminHome = () => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["api-calls"],
    queryFn: getApiCalls,
  });

  const {
    isLoading: isLoadingEndpoints,
    isError: isEndpointError,
    data: endpointData,
  } = useQuery({
    queryKey: ["endpoint-calls"],
    queryFn: getEndpointCalls,
  });

  return (
    <div>
      <h3>Admin Dashboard</h3>
      <h4>API Usage</h4>
      {isLoading && <p>{LOADING}</p>}
      {isError && <p>{LOADING_ERROR}</p>}
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
      <h4>Endpoint Usage</h4>
      {isLoadingEndpoints && <p>{LOADING}</p>}
      {isEndpointError && <p>{LOADING_ERROR}</p>}
      {endpointData && (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Requests</th>
            </tr>
          </thead>
          <tbody>
            {endpointData.data.map((endpoint, index) => (
              <tr key={index}>
                <td>{endpoint.endpoint}</td>
                <td>{endpoint.method}</td>
                <td>{endpoint.requests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home;
