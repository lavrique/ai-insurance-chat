import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env") });

export default {
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
};
