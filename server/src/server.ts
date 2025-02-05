import express from "express";
import cors from "cors";
import path from "path";
import { getAnswer } from "./openai";

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/build")));
}

// API route example
app.post("/api/openai", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { query } = req.body;
  console.log("query", query);
  const answer = await getAnswer(query);
  // console.log("answer", answer);
  res.send({ answer });
});

app.get("/api", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send({ express: "Hello From Express" });
});

// Handle React routing in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/build/index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
