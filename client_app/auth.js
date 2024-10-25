import db from "./db.js";
import crypto from "crypto";

// TODO: create secure secret in environment variable
const SECRET = "secret";

const createJwtToken = ({ username, name, permissions }) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const payload = Buffer.from(JSON.stringify({ username, name, permissions }))
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
  const token = req.headers.authorization.split(" ")[1];
  const [header, payload, signature] = token.split(".");
  const signatureToVerify = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  if (signature === signatureToVerify) {
    next();
  } else {
    res.status(401).send({ response: "Invalid token" });
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
  const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  if (rows.length === 0 || !validatePassword(password, rows[0])) {
    return null;
  }
  return createJwtToken(rows[0]);
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
};

// TODO: need to check for query errors or failures? Also, handle sql injection
const signup = async ({ username, name, password }) => {
  const { hash, salt } = hashPassword(password);
  const result = await db.query(
    "INSERT INTO users (username, name, hash, salt) VALUES (?, ?, ?, ?)",
    [username, name, hash, salt]
  );
};

export { login, signup, validateJwtToken };
