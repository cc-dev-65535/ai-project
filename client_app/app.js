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
  saveStory,
  deleteStory,
  getAllStories,
  editTitle,
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

const API_VERSION = "/API/v1";

/* AUTHENTICATION API ROUTES */
app.post(API_VERSION + "/login", logEndpointCall, async (req, res, next) => {
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

app.post(API_VERSION + "/logout", logEndpointCall, (req, res, next) => {
  res.clearCookie("token", {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  // res.cookie('token', {maxAge: 0});
  res.status(200).send({ message: "Logged out successfully" });
});

app.post(API_VERSION + "/login-check", validateJwtToken, (req, res, next) => {
  res
    .status(200)
    .send({ message: "Already logged in", payload: res.locals.payload });
});

app.post(API_VERSION + "/signup", checkEmail, async (req, res, next) => {
  try {
    await signup(req.body);
    res.status(200).send({ message: "Signed up successfully" });
  } catch (err) {
    next(err);
  }
});

/* MODEL API ROUTES */
app.post(
  API_VERSION + "/api",
  logEndpointCall,
  validateJwtToken,
  sanitizeJsonBody,
  async (req, res, next) => {
    try {
      const response = await callModel(req.body);
      if (response.ok) {
        const data = await response.json();
        await updateApiCallsCount(res.locals.payload.username);
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
app.get(
  API_VERSION + "/api-calls",
  validateJwtToken,
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

app.get(
  API_VERSION + "/api-calls-user",
  logEndpointCall,
  validateJwtToken,
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

app.get(
  API_VERSION + "/api-calls-endpoint",
  validateJwtToken,
  async (req, res, next) => {
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
app.post(
  API_VERSION + "/story",
  logEndpointCall,
  validateJwtToken,
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

app.get(API_VERSION + "/story", logEndpointCall, validateJwtToken, async (_, res, next) => {
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
});

app.delete(API_VERSION + "/story", logEndpointCall, validateJwtToken, async (req, res, next) => {
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
});

app.put(
  API_VERSION + "/story",
  logEndpointCall,
  validateJwtToken,
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

      res.status(200).send({ message: "Title updated successfully" });
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

app.listen(4000);
