import React, { useContext, useEffect, useRef } from "react";
import ChatInput from "../ChatInput/ChatInput";
import { ChatContext, useChatContext } from "../../../context/ChatContext";
import styles from "./MessageList.module.css";
import { insertMessage } from "../../../services/firebase";
import { v7 } from "uuid";
import { useLoadingContext } from "../../../context/LoadingContext";
import UserMessage from "./UserMessage";
import BotMessage from "./BotMessage";

const MessageList: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { showLoading, hideLoading } = useLoadingContext();
  const chatContext = useChatContext();

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  const { chats, activeChatId, addMessageToChat, activeVersionId } =
    chatContext;
  const activeChat = chats.find((chat) => chat.id === activeChatId);

  useEffect(() => {
    if ((activeChat?.messages?.length ?? 0) > 0) {
      scrollToBottom();
    }
  }, [activeChat?.messages]);

  if (!activeChat)
    return (
      <p className={styles.noChat}>Add a new chat to start asking questions for you needs!</p>
    );

  const handleOnSendMessage = async (text: string) => {
    showLoading();
    const idQuestion = await insertMessage({
      id: v7(),
      text,
      chatId: activeChatId,
      chatName: activeChat.name,
      sender: "user",
      versionName: activeVersionId,
    });
    addMessageToChat(idQuestion, activeChatId, text, "user");
    console.log("request Made to server");
    // TODO move this to a service
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/openai`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: text }),
      },
    );
    console.log("request arrived from server");
    const { answer } = await response?.json();

    hideLoading();

    const idAnser = await insertMessage({
      // TODO delete this id. it will be retireved rom the document
      id: v7(),
      text: answer,
      sender: "bot",
      chatId: v7(),
      chatName: activeChat.name,
      versionName: activeVersionId,
    });
    addMessageToChat(idAnser, activeChatId, answer, "bot");
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messages}>
        {activeChat.messages.map((msg) =>
          msg.sender === "user" ? (
            <UserMessage key={msg.id} text={msg.text} />
          ) : (
            <BotMessage
              key={msg.id}
              id={msg.id}
              sender={msg.sender}
              text={msg.text}
              note={msg.note}
              version={msg.version}
            />
          ),
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleOnSendMessage} />
    </div>
  );
};

export default MessageList;
