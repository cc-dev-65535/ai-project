import express from "express";
import "dotenv/config";
import { login, signup, validateJwtToken } from "./auth.js";

let API_URL = "http://localhost:5000/";
if (process.env.NODE_ENV === "production") {
  API_URL = "https://api.example.com/";
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* AUTHENTICATION API ROUTES */
app.post("/login", async (req, res, next) => {
  try {
    const token = await login(req.body);
    if (!token) {
      res.status(401).send({ response: "Invalid username or password" });
      return;
    }
    res.status(200).send({ response: "Logged in successfully", token });
  } catch (err) {
    next(err);
  }
});

// TODO: need to validate the username and password used for signup?
app.post("/signup", async (req, res, next) => {
  try {
    await signup(req.body);
    res.status(200).send({ response: "Signed up successfully" });
  } catch (err) {
    next(err);
  }
});

/* MODEL API ROUTES */
app.get("/api", validateJwtToken, async (req, res, next) => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    res.send(data);
  } catch (err) {
    next(err);
  }
});

/* FRONTEND ROUTES */
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(path.resolve(), "public") });
});

app.listen(4000);
