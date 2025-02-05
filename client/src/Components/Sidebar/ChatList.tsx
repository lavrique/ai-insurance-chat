import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import ChatItem from "./ChatItem";
import styles from "./ChatList.module.css";

const ChatList: React.FC = () => {
  const chatContext = useContext(ChatContext);

  if (!chatContext) return null;

  // const { chats, activeChatId, setChats, addNewChat, setActiveChat } =
  const { chats, activeChatId, setChats, setActiveChat } =
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
      {/* <button className={styles.newChatButton} onClick={addNewChat}> */}
      <button className={styles.newChatButton} onClick={() => {}}>
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
