import React, { useContext } from "react";
import ChatInput from "./ChatInput";
import { ChatContext } from "../../context/ChatContext";
import styles from "./ChatWindowList.module.css";
import ChatWindowItem from "./ChatWindowItem";
import { insertMessage } from "../../services/firebase";
import { v7 } from "uuid";
import { useLoading } from "../../context/LoadingContext";

const ChatWindow: React.FC = () => {
  const chatContext = useContext(ChatContext);
  const { showLoading, hideLoading } = useLoading();

  // TODO change it to use like in loading
  if (!chatContext) return null;

  const { chats, activeChatId, addMessageToChat } = chatContext;
  const activeChat = chats.find((chat) => chat.id === activeChatId);

  if (!activeChat)
    return (
      <p className={styles.noChat}>Select a chat to start messaging.</p>
    );

  const handleSendMessage = async (text: string) => {
    addMessageToChat(activeChatId, text, "user");
    showLoading();
    await insertMessage({
      id: v7(),
      text,
      sender: "user",
      version: activeChatId,
    });
    console.log("request Made to server");
    const response = await fetch("http://localhost:8080/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: text }),
    });
    console.log("request arrived from server");
    const { answer } = await response?.json();

    hideLoading();

    addMessageToChat(activeChatId, answer, "bot");

    await insertMessage({
      id: v7(),
      text: answer,
      sender: "bot",
      version: activeChatId,
    });
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messages}>
        {activeChat.messages.map((msg) => (
          <ChatWindowItem
            key={msg.id}
            id={msg.id}
            sender={msg.sender}
            text={msg.text}
            note={msg.note}
            version={msg.version}
          />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
