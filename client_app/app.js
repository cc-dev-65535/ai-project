import express from "express";
import "dotenv/config";
import { callModel } from "./api.js";
import { sanitizeJsonBody, checkEmail } from "./inputValidation.js";
import { login, signup, validateJwtToken } from "./auth.js";
import {
  logEndpointCall,
  updateApiCallsCount,
  getApiCallsCount,
  getApiCallsCountUser,
  getEndpointCallsCount,
} from "./apiCalls.js";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(cors({ credentials: true, origin: "http://localhost:1234" }));
} else {
  app.use(
    cors({
      credentials: true,
      origin: "https://html-starter-inky-alpha.vercel.app",
    })
  );
}

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* AUTHENTICATION API ROUTES */
app.post("/login", async (req, res, next) => {
  try {
    const tokenAndPayload = await login(req.body);
    if (!tokenAndPayload?.token) {
      res.status(401).send({ message: "Invalid username or password" });
      return;
    }
    const { token, payload } = tokenAndPayload;
    res.cookie("token", token, {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.status(200).send({ message: "Logged in successfully", payload });
  } catch (err) {
    next(err);
  }
});

app.post("/logout", (req, res, next) => {
  res.clearCookie("token", {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  // res.cookie('token', {maxAge: 0});
  res.status(200).send({ message: "Logged out successfully" });
});

app.post("/login-check", validateJwtToken, (req, res, next) => {
  res
    .status(200)
    .send({ message: "Already logged in", payload: res.locals.payload });
});

app.post("/signup", checkEmail, async (req, res, next) => {
  try {
    await signup(req.body);
    res.status(200).send({ message: "Signed up successfully" });
  } catch (err) {
    next(err);
  }
});

/* MODEL API ROUTES */
app.post("/api", validateJwtToken, sanitizeJsonBody, async (req, res, next) => {
  try {
    const response = await callModel(req.body);
    if (response.ok) {
      const data = await response.json();
      await updateApiCallsCount(res.locals.payload.username);
      res.status(200).send(data);
    } else {
      throw new Error("API call failed");
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/* API CALLS USAGE ROUTES */
app.get("/api-calls", validateJwtToken, async (req, res, next) => {
  if (res.locals.payload.permissions !== "ADMIN") {
    res.status(403).send({ message: "Forbidden" });
    return;
  }
  try {
    const data = await getApiCallsCount();
    res.status(200).send({ data });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.get("/api-calls-user", validateJwtToken, async (req, res, next) => {
  try {
    const data = await getApiCallsCountUser(res.locals.payload.username);
    res.status(200).send({ data });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.get("/api-calls-endpoint", validateJwtToken, async (req, res, next) => {
  try {
    const data = await getEndpointCallsCount();
    res.status(200).send({ data });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/* FRONTEND ROUTES */
app.get("/api-docs", (req, res) => {
  res.sendFile("index.html", {
    root: path.join(path.resolve(), "public"),
  });
});

app.listen(4000);
