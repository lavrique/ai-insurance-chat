import fs from "fs/promises";
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

const openai = new OpenAI({ apiKey });

async function getEmbedding(text: any): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });
  return response.data[0].embedding;
}

async function readChunksFromFile(filePath: string): Promise<string[]> {
  const rawText = await fs.readFile(filePath, "utf8");
  const rawChunks = rawText.split("\n\n");
  return rawChunks.map((chunk) => chunk.trim()).filter(Boolean);
}

async function embedFile(filePath: string): Promise<StoredEmbedding[]> {
  const chunks: string[] = await readChunksFromFile(filePath);
  const fileName = path.basename(filePath);
  const embeddingsData = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const embedding = await getEmbedding(chunkText);
    embeddingsData.push({
      text: chunkText,
      embedding,
      file: fileName,
      chunkId: `${fileName}_chunk_${i}`,
    });
    console.log(`Embedded chunk #${i} from file: ${filePath}`);
  }

  return embeddingsData;
}

const getFilePathsToEmbed = async (
  folderPath: string,
): Promise<string[]> => {
  try {
    // Read the contents of the directory
    const files = await fs.readdir(folderPath);

    // Map the file names to their full paths
    const filePaths = files.map((file) => path.join(folderPath, file));

    return filePaths;
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error; // Re-throw the error if you want to handle it elsewhere
  }
};

type CreateVectorsProps = {
  append: boolean;
  resultEmbeddingFileName: string;
};

const createVectors = async () => {
  const filePathsToEmbed = await getFilePathsToEmbed(
    "files/fileToLearnFrom",
  );

  const embeddedFiles = await Promise.all(
    filePathsToEmbed.map(async (filePath) => {
      return embedFile(filePath); // Assume embedFile returns an array
    }),
  );
  // Flatten array if embedFile returns arrays
  const concatenatedEmbeddings: StoredEmbedding[] = embeddedFiles.flat();

  await fs.writeFile(
    "versionModels/embeddings-v0.0.3.json",
    JSON.stringify(concatenatedEmbeddings, null, 2),
    { flag: "wx" },
  );
};

createVectors()


const justTest = async () => {
  // fs.writeFileSync("test/test.txt", "this is a test");
  // moveFile(
  //   "files/fileToLearnFrom/test.txt",
  //   "files/filesAlreadyLerned/test.txt",
  // );

  // await fs.writeFile(
  //   "files/fileToLearnFrom/test.txt",
  //   "just a test hat is not with force",
  //   { flag: "wx" },
  // );

  // const files = await getFilePathsToEmbed("files/fileToLearnFrom");
  // console.log(files);
};

// justTest();
