import db from "./db.js";

const updateApiCallsCount = async (req, res, next) => {
  const username = res.locals.payload.username;
  let conn = null;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // update the api_calls count
    const [response] = await conn.execute(
      "UPDATE api_usage SET api_calls = api_calls + 1 WHERE username = ?",
      [username]
    );
    if (response.affectedRows === 0) {
      throw new Error("db error, failed to update api_calls column");
    }

    await conn.commit();
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    console.log(err);
  } finally {
    if (conn) {
      conn.release();
    }
  }

  next();
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

const logEndpointCall = async (req, res, next) => {
  const pathURL = req.url.split("?")[0];
  try {
    // update the endpoints request count for this specific endpoint
    const [response] = await db.execute(
      "UPDATE endpoint_usage SET requests = requests + 1 WHERE endpoint = ? AND method = ?",
      [pathURL, req.method]
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

const saveStory = async (username, title, story) => {
  let conn = null;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // save the story
    const [response] = await conn.execute(
      "INSERT INTO stories (username, title, content) VALUES (?, ?, ?)",
      [username, title, story]
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
    const [response] = await conn.execute("DELETE FROM stories WHERE id = ?", [
      storyId,
    ]);
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
  console.log(storyId);
  console.log(newTitle);

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // update the story's title
    const [response] = await conn.execute(
      "UPDATE stories SET title = ? WHERE id = ?",
      [newTitle, storyId]
    );
    if (response.affectedRows === 0) {
      throw new Error(
        `db error, story not found or failed to update title on story id: ${storyId} with new title: ${newTitle}`
      );
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

export {
  getEndpointCallsCount,
  logEndpointCall,
  updateApiCallsCount,
  getApiCallsCountUser,
  getApiCallsCount,
  saveStory,
  deleteStory,
  getAllStories,
  editTitle,
};
