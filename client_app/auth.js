import db from "./db.js";
import crypto from "crypto";

const createJwtToken = (username) => {
  return "jwt-token";
};

const validatePassword = (password, { hash, salt }) => {
  const hashToVerify = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === hashToVerify;
};

// TODO: need to check for query errors or failures?
const login = async ({ username, password }) => {
  const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  if (rows.length === 0 || !validatePassword(password, rows[0])) {
    return null;
  }
  return createJwtToken(username);
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
};

// TODO: need to check for query errors or failures?
const signup = async ({ username, name, password }) => {
  const { hash, salt } = hashPassword(password);
  const result = await db.query("INSERT INTO users VALUES (?, ?, ?, ?)", [
    username,
    name,
    hash,
    salt,
  ]);
};

export { login, signup };
