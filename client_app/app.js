import express from "express";
import "dotenv/config";
import { fileURLToPath } from "url"; // Required for ES module __dirname equivalent
import path from "path";
import { callModel } from "./api.js";
import { sanitizeJsonBody, checkEmail } from "./inputValidation.js";
import {
  login,
  signup,
  validateJwtToken,
  forgotPassword,
  resetPassword,
} from "./auth.js";
import {
  logEndpointCall,
  updateApiCallsCount,
  getApiCallsCount,
  getApiCallsCountUser,
  getEndpointCallsCount,
  saveStory,
  deleteStory,
  getAllStories,
  editTitle,
} from "./apiCalls.js";
import cors from "cors";
import cookieParser from "cookie-parser";

// Create __dirname equivalent for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files from the correct public directory
app.use(express.static(path.join(__dirname, "public")));

const API_VERSION = "/API/v1";

/* AUTHENTICATION API ROUTES */
// Returns 400 on missing username or password
// Returns 401 on login error
// Returns 200 on success
app.post(API_VERSION + "/login", logEndpointCall, async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password) {
      res.status(400).send({ message: "Invalid username or password" });
      return;
    }
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

// Returns 200 on success
app.post(API_VERSION + "/logout", logEndpointCall, (req, res, next) => {
  res.clearCookie("token", {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  // res.cookie('token', {maxAge: 0});
  res.status(200).send({ message: "Logged out successfully" });
});

// Returns 401 on not logged in error
// Returns 200 on success
app.post(API_VERSION + "/login-check", validateJwtToken, (req, res, next) => {
  res
    .status(200)
    .send({ message: "Already logged in", payload: res.locals.payload });
});

// Returns 400 on invalid email username, or invalid password, or username already taken
// Returns 200 on success
app.post(
  API_VERSION + "/signup",
  logEndpointCall,
  checkEmail,
  async (req, res, next) => {
    try {
      if (!req.body.username || !req.body.password) {
        res.status(400).send({ message: "Invalid username or password" });
        return;
      }
      await signup(req.body);
      res.status(200).send({ message: "Signed up successfully" });
    } catch (err) {
      res.status(400).send({ message: "Bad request, username already taken" });
      return;
    }
  }
);

// Returns 400 on invalid email username
// Returns 200 on success
app.post(
  API_VERSION + "/forgot-password",
  logEndpointCall,
  async (req, res, next) => {
    try {
      if (!req.body.username) {
        res.status(400).send({ message: "Invalid username" });
        return;
      }
      await forgotPassword(req.body);
      res.status(200).send({ message: "Forgot password link created" });
    } catch (err) {
      res.status(400).send({ message: "Bad request, check username" });
      return;
    }
  }
);

// Returns 400 on invalid password or link
// Returns 200 on success
app.post(
  API_VERSION + "/reset-password",
  logEndpointCall,
  async (req, res, next) => {
    try {
      if (!req.body.password) {
        res.status(400).send({ message: "Invalid password" });
        return;
      }
      await resetPassword(req.body, req.query);
      res.status(200).send({ message: "Password changed" });
    } catch (err) {
      res.status(400).send({ message: "Bad request, check link" });
      return;
    }
  }
);

/* MODEL API ROUTES */
// Returns 400 on missing input
// Returns 401 on not logged in error
// Returns 500 on model error
// returns 200 on success
app.post(
  API_VERSION + "/api",
  logEndpointCall,
  validateJwtToken,
  updateApiCallsCount,
  sanitizeJsonBody,
  async (req, res, next) => {
    try {
      if (!req.body.input) {
        res.status(400).send({ message: "Invalid input" });
        return;
      }
      const response = await callModel(req.body);
      if (response.ok) {
        const data = await response.json();
        // remove <sep> and [ WP ] text strings from the response
        data.data = sanitizeStory(data.data);
        res.status(200).send(data);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

const sanitizeStory = (story) => {
  return story.replace(/<sep>/g, "").replace(/\[\s*W\s*P\s*\]/g, "");
};

/* API CALLS USAGE ROUTES */
// Returns 401 on not logged in error
// Returns 403 on not admin error
// Returns 200 on success
app.get(
  API_VERSION + "/api-calls",
  logEndpointCall,
  validateJwtToken,
  updateApiCallsCount,
  async (req, res, next) => {
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
  }
);

// Returns 401 on not logged in error
// Returns 200 on success
app.get(
  API_VERSION + "/api-calls-user",
  logEndpointCall,
  validateJwtToken,
  updateApiCallsCount,
  async (req, res, next) => {
    try {
      const data = await getApiCallsCountUser(res.locals.payload.username);
      res.status(200).send({ data });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

// Return 403 on not admin error
// Returns 401 on not logged in error
// Returns 200 on success
app.get(
  API_VERSION + "/api-calls-endpoint",
  logEndpointCall,
  validateJwtToken,
  updateApiCallsCount,
  async (req, res, next) => {
    if (res.locals.payload.permissions !== "ADMIN") {
      res.status(403).send({ message: "Forbidden" });
      return;
    }
    try {
      const data = await getEndpointCallsCount();
      res.status(200).send({ data });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

/* DATABASE ROUTES */
// Returns 401 on not logged in error
// Returns 400 on missing required fields
// Returns 200 on success
app.post(
  API_VERSION + "/story",
  logEndpointCall,
  validateJwtToken,
  updateApiCallsCount,
  sanitizeJsonBody,
  async (req, res, next) => {
    try {
      const username = res.locals.payload.username;
      const { story, title } = req.body;
      if (!username || !story) {
        return res.status(400).send({ error: "Missing required fields" });
      }

      await saveStory(username, title, story);

      res.status(200).send({ message: "Story saved successfully" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

// Returns 401 on not logged in error
// Returns 400 on missing required fields
// Returns 200 on success
app.get(
  API_VERSION + "/story",
  logEndpointCall,
  validateJwtToken,
  updateApiCallsCount,
  async (_, res, next) => {
    try {
      const username = res.locals.payload.username;
      if (!username) {
        return res.status(400).send({ error: "Username is required" });
      }

      const stories = await getAllStories(username);

      res.status(200).send(stories);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

// Returns 401 on not logged in error
// Returns 400 on missing required fields
// Returns 200 on success
app.delete(
  API_VERSION + "/story",
  logEndpointCall,
  validateJwtToken,
  updateApiCallsCount,
  async (req, res, next) => {
    try {
      const { storyId } = req.query;
      if (!storyId) {
        return res.status(400).send({ error: "Story ID is required" });
      }

      await deleteStory(storyId);

      res.status(200).send({ message: "Story deleted successfully" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

// Returns 401 on not logged in error
// Returns 400 on missing required fields
// Return 201 on success
app.put(
  API_VERSION + "/story",
  logEndpointCall,
  validateJwtToken,
  updateApiCallsCount,
  sanitizeJsonBody,
  async (req, res, next) => {
    try {
      const { storyId, newTitle } = req.body;
      if (!storyId || !newTitle) {
        return res
          .status(400)
          .send({ error: "Story ID and new title are required" });
      }

      await editTitle(storyId, newTitle);

      res.status(201).send({ message: "Title updated successfully" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

/* FRONTEND ROUTES */
app.get(API_VERSION + "/docs", (req, res) => {
  res.sendFile("swagger.html", {
    root: path.join(path.resolve(), "public"),
  });
});

app.get("/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "swagger.html"));
});

app.get("/swagger.json", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "swagger.json"));
});

app.listen(4000);
