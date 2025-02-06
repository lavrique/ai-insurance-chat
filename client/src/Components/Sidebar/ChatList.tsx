import React, { useState } from "react";
import { useChatContext } from "../../context/ChatContext";
import ChatItem from "./ChatItem";
import NewChatModal from "./NewChatModal";
import styles from "./ChatList.module.css";
import VersionList from "./VersionList";

const ChatList: React.FC = () => {
  const chatContext = useChatContext();
  const { chats, activeChatId, setActiveChat, addNewChat } = chatContext;

  // Local state to track whether to show/hide the modal
  const [showModal, setShowModal] = useState(false);

  // Handle the + New Chat button
  const openNewChatModal = () => {
    setShowModal(true);
  };

  // Called when user clicks "Create New Chat" in modal
  const handleCreateChat = (name: string) => {
    // This calls your existing chat-creation logic:
    addNewChat(name);

    // Then close the modal:
    setShowModal(false);
  };

  // If user cancels in the modal
  const handleCancel = () => {
    setShowModal(false);
  };

  const handleRenameChat = (id: string, newName: string) => {
    // setChats((prevChats) =>
    //   prevChats.map((chat) =>
    //     chat.id === id ? { ...chat, name: newName } : chat,
    //   ),
    // );
  };

  return (
    <div className={styles.sidebar}>
      <VersionList />
      <h2 className={styles.title}>Chats</h2>

      {/* Button that opens the modal */}
      <button className={styles.newChatButton} onClick={openNewChatModal}>
        + New Chat
      </button>

      {/* Show the modal conditionally */}
      {showModal && (
        <NewChatModal
          onCreate={handleCreateChat}
          onCancel={handleCancel}
        />
      )}

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
