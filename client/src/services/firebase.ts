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
} from "firebase/firestore";
import { ChatVersion, Message } from "../context/ChatContext";

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

export type FirebaseChat = Message & ChatVersion;

export const getAllMessages = async (): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc")); // Order by createdAt in ascending order

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No chats found!");
      return [];
    }

    const messages = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as unknown as Message[];

    return messages;
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    return [];
  }
};

export const insertMessage = async (message: Message): Promise<string> => {
  try {
    console.log("serverTimestamp", JSON.stringify(serverTimestamp()));
    const messagesRef = collection(db, "messages");
    const docRef = await addDoc(messagesRef, {
      ...message,
      createdAt: serverTimestamp(),
    });
    console.log("Message added successfully");
    return docRef.id;
  } catch (error) {
    console.error("Error inserting message:", error);
    return "Error inserting message";
  }
};

export const addNoteToMessage = async (
  messageId: string,
  note: string,
): Promise<void> => {
  try {
    const messageRef = doc(db, "messages", messageId);

    await updateDoc(messageRef, {
      note, // ✅ Update only the note
    });

    console.log("Note added successfully to message:", messageId);
  } catch (error) {
    console.error("Error updating message:", error);
  }
};
