import db from "./db.js";

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

const getApiCallsCountUser = async (username) => {
  // get the current api_calls count for a user
  const [rows] = await db.execute(
    "SELECT * FROM api_usage WHERE username = ?",
    [username]
  );
  if (rows.length === 0) {
    throw new Error("db error, user not found");
  }
  return rows[0];
};

const getApiCallsCount = async () => {
  // get the current api_calls count
  const [rows] = await db.execute("SELECT * FROM api_usage");
  if (rows.length === 0) {
    throw new Error("db error");
  }
  return rows;
};

// TODO: use this middleware to log specific endpoint calls
const logEndpointCall = async (req, res, next) => {
  try {
    // update the api_calls count
    const [response] = await db.execute(
      "UPDATE endpoint_usage SET requests = requests + 1 WHERE endpoint = ?",
      [req.url]
    );
    if (response.affectedRows === 0) {
      console.log("db error, failed to update requests column for endpoint");
    }
  } catch (err) {
    console.log(err);
  }

  next();
};

const getEndpointCallsCount = async () => {
  // get the current endpoint counts for all endpoints
  const [rows] = await db.execute("SELECT * FROM endpoint_usage");
  if (rows.length === 0) {
    throw new Error("db error");
  }
  return rows;
};

export {
  getEndpointCallsCount,
  logEndpointCall,
  updateApiCallsCount,
  getApiCallsCountUser,
  getApiCallsCount,
};
