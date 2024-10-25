import express from "express";
import "dotenv/config";
import { login, signup } from "./auth.js";

let API_URL = "http://localhost:5000/";
if (process.env.NODE_ENV === "production") {
  API_URL = "https://api.example.com/";
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* AUTHENTICATION API ROUTES */
// TODO: create different error response codes for different failure cases
app.post("/login", async (req, res) => {
  try {
    const token = await login(req.body);
    if (!token) {
      res.status(401).send({ response: "Invalid username or password" });
      return;
    }
    res.status(200).send({ response: "Logged in successfully", token });
  } catch (e) {
    console.log(e);
    res.status(500).send({ response: "Error logging in" });
    return;
  }
});

// TODO: create different error response codes for different failure cases
app.post("/signup", async (req, res) => {
  try {
    await signup(req.body);
    res.status(200).send({ response: "Signed up successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ response: "Error signing up" });
    return;
  }
});

/* MODEL API ROUTES */
app.get("/api", async (req, res) => {
  const response = await fetch(API_URL);
  const data = await response.json();
  res.send(data);
});

/* FRONTEND ROUTES */
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(path.resolve(), "public") });
});

app.listen(4000);
