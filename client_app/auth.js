import db from "./db.js";
import crypto from "crypto";

// TODO: create secure secret
const SECRET = "secret";

const createJwtToken = ({ username, permissions }) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const payload = Buffer.from(JSON.stringify({ username, permissions }))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${header}.${payload}.${signature}`;
};

const validateJwtToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send({ response: "No token. Must login first" });
    return;
  }
  const [header, payload, signature] = token.split(".");
  const signatureToVerify = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  if (signature === signatureToVerify) {
    res.locals.payload = JSON.parse(Buffer.from(payload, "base64").toString());
    next();
  } else {
    res.status(401).send({ response: "Invalid token. Must login again" });
  }
};

const validatePassword = (password, { hash, salt }) => {
  const hashToVerify = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === hashToVerify;
};

// TODO: need to check for query errors or failures? Also, handle sql injection
const login = async ({ username, password }) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  if (rows.length === 0 || !validatePassword(password, rows[0])) {
    return null;
  }
  return {
    token: createJwtToken(rows[0]),
    payload: { username: rows[0].username, permissions: rows[0].permissions },
  };
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
};

// TODO: need to check for query errors or failures? Also, handle sql injection
const signup = async ({ username, password }) => {
  const { hash, salt } = hashPassword(password);

  let conn = null;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // create entry in users table for signed up user
    const userResult = await db.execute(
      "INSERT INTO users (username, hash, salt) VALUES (?, ?, ?)",
      [username, hash, salt]
    );
    // create entry in api_usage table for signed up user
    const apiResult = await db.execute(
      "INSERT INTO api_usage (username) VALUES (?)",
      [username]
    );

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

export { login, signup, validateJwtToken };
