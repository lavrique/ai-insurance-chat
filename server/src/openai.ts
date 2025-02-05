import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

type StoredEmbedding = {
  text: string;
  embedding: number[];
  file: string;
  chunkId: string;
};
type StoredChunk = StoredEmbedding & { score: any };

const apiKey =
  "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";

const openai = new OpenAI({ apiKey });

const embeddedVectors: StoredEmbedding[] = JSON.parse(
  fs.readFileSync("embeddings.json", "utf8"),
);

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
  topN = 3,
): Promise<StoredChunk[]> {
  // Get the embedding for the user query
  const queryResponse = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
  });
  const queryEmbedding = queryResponse.data[0].embedding;

  // Score each chunk using cosine similarity as a score
  const scoredChunks: StoredChunk[] = embeddedVectors.map((chunk: any) => {
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
    `Nu furniza informatii suplimentari sau presupuneri inafara de ce se gaseste in conditii` +
    `Asigurarile din care poti extrage informatii sunt doar pentru calatorie.`
  );
}

export const getAnswer = async (query: string): Promise<string> => {
  const topChunks: StoredChunk[] = await retrieveTopChunks(query, 4);
  const prompt = buildPrompt(query, topChunks);

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Ești un asistent specializat în asigurări." +
          "Produsele pe care le cunosti sunt asigurari de tipul travel",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2, // Lower temperature for factual responses
  });

  if (!chatResponse.choices[0].message.content) {
    console.log("No response from GPT-4o");
    return "";
  }
  return chatResponse.choices[0].message.content;
};
