import { FirebaseOptions, initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  EmbeddingVersion,
  Message,
  DatabaseMessage,
  DatabaseVersion,
} from "../context/ChatContext";

const MESSAGES = process.env.REACT_APP_MESSAGES_COLLECTION as string;

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.REACT_APP_CLIENT_APY_KEY,
  authDomain: process.env.REACT_APP_CLIENT_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_CLIENT_PROJECT_ID,
  storageBucket: process.env.REACT_APP_CLIENT_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_CLIENT_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_CLIENT_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export type FirebaseChat = Message & EmbeddingVersion;

export const getAllVersions = async (): Promise<DatabaseVersion[]> => {
  try {
    const messagesRef = collection(db, "versions");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No versions found!");
      return [];
    }

    const versions = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as unknown as DatabaseVersion[];
    console.log("debug --- fetched versions", versions);
    return versions;
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    return [];
  }
};

export const getAllMessages = async (
  versionId: string,
): Promise<DatabaseMessage[]> => {
  try {
    const messagesRef = collection(db, MESSAGES);
    const q = query(
      messagesRef,
      where("versionName", "==", doc(db, "versions", versionId)),
      orderBy("createdAt", "asc"),
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No messages found for version:", versionId);
      return [];
    }

    const messages = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as DatabaseMessage[];

    return messages;
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    return [];
  }
};

export const insertMessage = async (
  message: Omit<DatabaseMessage, "createdAt">,
): Promise<string> => {
  try {
    console.log("serverTimestamp", JSON.stringify(serverTimestamp()));
    const messagesRef = collection(db, MESSAGES);
    const docRef = await addDoc(messagesRef, {
      ...message,
      versionName: doc(db, "versions", message.versionName),
      createdAt: serverTimestamp(),
    });
    console.log("Message added successfully");
    return docRef.id;
  } catch (error) {
    console.error("Error inserting message:", error);
    // TODO make proper error handling
    return "Error inserting message";
  }
};

export const addNoteToMessage = async (
  messageId: string,
  note: string,
): Promise<void> => {
  try {
    const messageRef = doc(db, MESSAGES, messageId);

    await updateDoc(messageRef, {
      note, // ✅ Update only the note
    });

    console.log("Note added successfully to message:", messageId);
  } catch (error) {
    console.error("Error updating message:", error);
  }
};
