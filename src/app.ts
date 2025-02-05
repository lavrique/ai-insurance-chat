import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();


const apiKey = process.env.OPENAI_API_KEY;

type StoredEmbedding = {
  text: string;
  embedding: number[];
  file: string;
  chunkId: string;
};
type StoredChunk = StoredEmbedding & { score: any };

const testCreateVectors = async () => {
  const openai = new OpenAI({ apiKey });
  const filePath1 = "Generali - Călătorie - Sporturi Extreme.txt";
  const filePath2 = "Omniasig - Calatorie - Safe Travel.txt";

  async function getEmbedding(text: any): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });
    return response.data[0].embedding;
  }

  function readChunksFromFile(filePath: string): string[] {
    const rawText = fs.readFileSync(filePath, "utf8");
    const rawChunks = rawText.split("\n\n");
    return rawChunks.map((chunk) => chunk.trim()).filter(Boolean);
  }

  async function embedFile(filePath: string): Promise<StoredEmbedding[]> {
    const chunks: string[] = readChunksFromFile(filePath);
    const embeddingsData = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embedding = await getEmbedding(chunkText);
      embeddingsData.push({
        text: chunkText,
        embedding,
        file: path.basename(filePath),
        chunkId: `${path.basename(filePath)}_chunk_${i}`,
      });
      console.log(`Embedded chunk #${i} from file: ${filePath}`);
    }

    return embeddingsData;
  }

  const embededFile1 = await embedFile(filePath1);
  const embededFile2 = await embedFile(filePath2);

  const concated: StoredEmbedding[] = embededFile1.concat(embededFile2);
  fs.writeFileSync("embeddings.json", JSON.stringify(concated, null, 2));
};

const testUseVectors = async () => {
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
    const scoredChunks: StoredChunk[] = embeddedVectors.map(
      (chunk: any) => {
        return {
          ...chunk,
          score: cosineSimilarity(queryEmbedding, chunk.embedding),
        };
      },
    );

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

  async function getAnswer(query: string): Promise<any> {
    const topChunks: StoredChunk[] = await retrieveTopChunks(query, 4);
    const prompt = buildPrompt(query, topChunks);

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Ești un asistent specializat în asigurări.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2, // Lower temperature for factual responses
    });

    return chatResponse.choices[0].message.content;
  }

  const answer = await getAnswer(
    "la generali Asigurarea plateste dauna direct?",
  );

  console.log("\n\n", answer);
  console.log("\n\n");
};

// testCreateVectors();
// testUseVectors();
