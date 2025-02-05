import { FirebaseOptions, initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { ChatVersion, Message } from "../context/ChatContext";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDg0t7Fv46QEvOaIWM_HJelk01WrTNNbCo",
  authDomain: "my-insurance-chat-bot.firebaseapp.com",
  projectId: "my-insurance-chat-bot",
  storageBucket: "my-insurance-chat-bot.firebasestorage.app",
  messagingSenderId: "848439758298",
  appId: "1:848439758298:web:24e6bf3b65b09a77edc4e3",
  // databaseURL:
  //   "https://my-insurance-chat-bot-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Use Firestore instead of Realtime DB

// const messagesRef = collection(db, "chatVersions", "UHjaMnO4JfGsOr1b3Fa9", "messages");
// const querySnapshot = await getDocs(collection(db, "chatVersions"));

export type FirebaseChat = Message & ChatVersion;

export const getAllMessages = async (): Promise<Message[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "messages"));

    // const messagesRef = collection(db, "messages");
    // const messagesQuery = query(messagesRef, orderBy("createdAt", "desc")); // Order by timestamp descending
    // const querySnapshot = await getDocs(messagesQuery);

    if (querySnapshot.empty) {
      console.log("No chats found!");
      return [];
    }

    const chats = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as Message[];

    // const chats: Message[] = querySnapshot.docs.data();

    // console.log("Fetched chats:", chats);
    return chats;
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    return [];
  }
};

export const insertMessage = async (message: Message): Promise<void> => {
  try {
    const messagesRef = collection(db, "messages");
    await addDoc(messagesRef, message);
    console.log("Message added successfully");
  } catch (error) {
    console.error("Error inserting message:", error);
  }
};
