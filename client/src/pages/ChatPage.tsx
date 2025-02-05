import React, { useEffect } from "react";
import styles from "./chat.module.css";
import ChatList from "../Components/Sidebar/ChatList";
import ChatWindow from "../Components/Chat/ChatWindowList";
import { getAllMessages } from "../services/firebase";

const ChatPage: React.FC = () => {
  return (
    <div className={styles["chat-container"]}>
      {/* Sidebar with chat history */}
      <aside className={styles["chat-sidebar"]}>
        <ChatList />
      </aside>

      {/* Main Chat Window */}
      <main className={styles["chat-main"]}>
        <ChatWindow />
      </main>
    </div>
  );
};

export default ChatPage;
