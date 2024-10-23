import express from "express";

let API_URL = "http://localhost:5000/";
if (process.env.NODE_ENV === "production") {
  API_URL = "https://api.example.com/";
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const response = await fetch(API_URL);
  const data = await response.json();
  res.send(data);
});

app.listen(4000);
