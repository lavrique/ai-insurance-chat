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
  apiKey: "AIzaSyDg0t7Fv46QEvOaIWM_HJelk01WrTNNbCo",
  authDomain: "my-insurance-chat-bot.firebaseapp.com",
  projectId: "my-insurance-chat-bot",
  storageBucket: "my-insurance-chat-bot.firebasestorage.app",
  messagingSenderId: "848439758298",
  appId: "1:848439758298:web:24e6bf3b65b09a77edc4e3",
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
