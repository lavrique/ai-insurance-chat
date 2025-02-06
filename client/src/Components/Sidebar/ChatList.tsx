import React, { useContext } from "react";
import { ChatContext, useChatContext } from "../../context/ChatContext";
import ChatItem from "./ChatItem";
import styles from "./ChatList.module.css";

const ChatList: React.FC = () => {
  const chatContext = useChatContext();

  const { chats, activeChatId, setChats, addNewChat, setActiveChat } =
    chatContext;

  const handleRenameChat = (id: string, newName: string) => {
    // setChats((prevChats) =>
    //   prevChats.map((chat) =>
    //     chat.id === id ? { ...chat, name: newName } : chat,
    //   ),
    // );
  };

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.title}>Chats</h2>
      <button className={styles.newChatButton} onClick={addNewChat}>
        + New Chat
      </button>
      <ul className={styles.list}>
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isSelected={chat.id === activeChatId}
            onSelect={() => setActiveChat(chat.id)}
            onRename={handleRenameChat}
          />
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
