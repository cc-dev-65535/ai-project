import express from "express";
import "dotenv/config";
import { callApi, updateApiCalls } from "./api.js";
import { login, signup, validateJwtToken } from "./auth.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* AUTHENTICATION API ROUTES */
app.post("/login", async (req, res, next) => {
  try {
    const token = await login(req.body);
    if (!token) {
      res.status(401).send({ message: "Invalid username or password" });
      return;
    }
    res.status(200).send({ message: "Logged in successfully", token });
  } catch (err) {
    next(err);
  }
});

// TODO: need to validate the username and password used for signup?
app.post("/signup", async (req, res, next) => {
  try {
    await signup(req.body);
    res.status(200).send({ message: "Signed up successfully" });
  } catch (err) {
    next(err);
  }
});

/* MODEL API ROUTES */
app.get("/api", validateJwtToken, async (req, res, next) => {
  try {
    const response = await callApi();
    if (response.ok) {
      const data = await response.json();
      await updateApiCalls(res.locals.payload.username);
      res.status(200).send(data);
    } else {
      throw new Error("API call failed");
    }
  } catch (err) {
    next(err);
  }
});

/* FRONTEND ROUTES */
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(path.resolve(), "public") });
});

app.listen(4000);
