import React, { useState } from "react";
import styles from "./NewChatModal.module.css";

interface NewChatModalProps {
  onCreate: (chatName: string) => void;
  onCancel: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onCreate, onCancel }) => {
  const [chatName, setChatName] = useState("");

  const handleCreate = () => {
    if (!chatName.trim()) {
      alert("Please enter a valid chat name");
      return;
    }
    onCreate(chatName.trim());
    setChatName("");
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Create a New Chat</h3>
        <input
          type="text"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          placeholder="Enter chat name"
        />
        <div className={styles.buttons}>
          <button className={styles.createButton} onClick={handleCreate}>
            Create New Chat
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
