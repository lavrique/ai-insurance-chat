import { OpenAI } from "openai";
import fs from "fs";
import fsPromise from "fs/promises";
import config from "./config";

type StoredEmbedding = {
  text: string;
  embedding: number[];
  file: string;
  chunkId: string;
};
type StoredChunk = StoredEmbedding & { score: any };

const apiKey = config.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

const embeddedVectors: Record<string, StoredEmbedding[]> = {};

const runGetEmbeddedVectors = async () => {
  console.log("********* files START READ *********");
  const files = await fsPromise.readdir("../versionModels");
  files.forEach((versionModelName) => {
    const jsonFile = JSON.parse(
      fs.readFileSync(`../versionModels/${versionModelName}`, "utf8"),
    );
    Object.assign(embeddedVectors, { [versionModelName]: jsonFile });
  });
  console.log("********* files FINISHED READ *********", files);
};

runGetEmbeddedVectors();

const cosineSimilarity = (vecA: any, vecB: any) => {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Retrieves the top N relevant chunks for a given user query.
 */
async function retrieveTopChunks(
  query: string,
  topN: number,
  version: string,
): Promise<StoredChunk[]> {
  // Get the embedding for the user query
  const queryResponse = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
  });
  const queryEmbedding = queryResponse.data[0].embedding;

  console.log("debug --- version", version);
  console.log("debug --- embeddedVectors", Object.keys(embeddedVectors));

  // Score each chunk using cosine similarity as a score
  const scoredChunks: StoredChunk[] = embeddedVectors[
    `${version.toLowerCase()}.json`
  ].map((chunk: any) => {
    return {
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    };
  });

  // Sort by descending score and return the top N chunks
  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topN);
}

function buildPrompt(query: string, topChunks: StoredChunk[]) {
  let contextText = "";
  topChunks.forEach((chunk, idx) => {
    contextText += `Chunk ${idx + 1} (from ${chunk.file || "unknown file"}):\n${chunk.text}\n\n`;
  });

  // return `Ești un expert în vanzari. Utilizatorul a întrebat: "${query}"\n\n` +
  //     `Iată câteva extrase relevante din documente:\n\n${contextText}\n` +
  //     `Furnizează un răspuns concis în limba română, menționând detalii relevante.`;
  return (
    `Ești un expert în asigurări. Utilizatorul a întrebat: "${query}"\n\n` +
    `Iată câteva extrase relevante din documente:\n\n${contextText}\n` +
    `Furnizează un răspuns concis în limba română, menționând detalii relevante.` +
    `Asigurarile din care poti extrage informatii sunt doar pentru calatorie.`
  );
}

export const getAnswer = async (
  query: string,
  version: string,
): Promise<string> => {
  console.log("start getting chunks from query");
  const topChunks: StoredChunk[] = await retrieveTopChunks(
    query,
    10,
    version,
  );
  console.log("finish getting chunks from query");
  const prompt = buildPrompt(query, topChunks);

  console.log("start request to openapi");
  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Ești un asistent specializat în asigurări." +
          "Produsele pe care le cunosti sunt asigurari de tipul travel" +
          "Extragi raspunsurile din chunks. Nu ii spui niciodata utilizatorului despre chunks sau (Chunk number)" +
          "Nu furniza informatii suplimentari sau presupuneri inafara extrase relevante din documente",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2, // Lower temperature for factual responses
  });
  console.log("finish request to openapi");

  if (!chatResponse.choices[0].message.content) {
    console.log("No response from GPT-4o");
    return "";
  }
  return chatResponse.choices[0].message.content;
};
