import db from "./db.js";

let API_URL = "http://localhost:5000/";
if (process.env.NODE_ENV === "production") {
  API_URL = "https://api.example.com/";
}

// TODO: need to add an api key for the api?
const callApi = async () => {
  const response = await fetch(API_URL);
  return response;
};

const updateApiCallsCount = async (username) => {
  let conn = null;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // get the current api_calls count
    const [rows] = await db.execute(
      "SELECT * FROM api_usage WHERE username = ?",
      [username]
    );
    if (rows.length === 0) {
      throw new Error("db error, user not found");
    }
    const apiCalls = rows[0].api_calls + 1;
    // update the api_calls count
    const [response] = await db.execute(
      "UPDATE api_usage SET api_calls = ? WHERE username = ?",
      [apiCalls, username]
    );
    if (response.affectedRows === 0) {
      throw new Error("db error, failed to update api_calls column");
    }

    await conn.commit();
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const getApiCallsCount = async (username) => {
  // get the current api_calls count
  const [rows] = await db.execute(
    "SELECT * FROM api_usage WHERE username = ?",
    [username]
  );
  if (rows.length === 0) {
    throw new Error("db error, user not found");
  }
  return rows[0].api_calls;
};

export { callApi, updateApiCallsCount, getApiCallsCount };
