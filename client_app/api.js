import db from "./db.js";

const API_URL = "https://164.90.154.129:5001/";

const callApi = async ({ input }) => {
  const response = await fetch(API_URL + "api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });
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

const getApiCallsCountUser = async (username) => {
  // get the current api_calls count
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

const saveStory = async (username, story) => {
  let conn = null;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // save the story
    const [response] = await db.execute(
      "INSERT INTO stories (username, content) VALUES (?, ?)",
      [username, story]
    );
    if (response.affectedRows === 0) {
      throw new Error("db error, failed to save story");
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

const deleteStory = async (storyId) => {
  let conn = null;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // delete the story
    const [response] = await conn.execute(
      "DELETE FROM stories WHERE id = ?",
      [storyId]
    );
    if (response.affectedRows === 0) {
      throw new Error("db error, story not found or failed to delete");
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


const getAllStories = async (username) => {
  let conn = null;
  try {
    conn = await db.getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM stories WHERE username = ?",
      [username]
    );

    return rows; 
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const editTitle = async (storyId, newTitle) => {
  let conn = null;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // update the story's title
    const [response] = await conn.execute(
      "UPDATE stories SET title = ? WHERE id = ?",
      [newTitle, storyId]
    );
    if (response.affectedRows === 0) {
      throw new Error("db error, story not found or failed to update title");
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





export { callApi, updateApiCallsCount, getApiCallsCountUser, getApiCallsCount, saveStory };
