import express from "express";
import cors from "cors";
import path from "path";
import { getAnswer } from "./openai";
import config from "./config";

const app = express();
const port = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build in production
if (config.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/build")));
}

// API route example
app.post("/api/openai", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { query, version } = req.body;

  const answer = await getAnswer(query, version);
  // const answer =
  //   "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release o";
  res.send({ answer });
});

app.get("/api", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send({ express: "Hello From Express" });
});

// Handle React routing in production
if (config.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/build/index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
