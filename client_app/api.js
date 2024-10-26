import db from "./db.js";

let API_URL = "http://localhost:5000/";
if (process.env.NODE_ENV === "production") {
  API_URL = "https://api.example.com/";
}

const callApi = async () => {
  const response = await fetch(API_URL);
  return response;
};

const updateApiCalls = async (username) => {
  const [rows] = await db.execute(
    "SELECT * FROM api_usage WHERE username = ?",
    [username]
  );
  if (rows.length === 0) {
    throw new Error("db error, user not found");
  }
  const apiCalls = rows[0].api_calls + 1;
  const [response] = await db.execute(
    "UPDATE api_usage SET api_calls = ? WHERE username = ?",
    [apiCalls, username]
  );
  console.log(response.affectedRows);
};

const getApiCalls = async (username) => {

}

export { callApi, updateApiCalls };
