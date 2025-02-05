import React, { useState } from "react";
import styles from "./ChatItem.module.css";

interface ChatItemProps {
  chat: { id: string; name: string };
  isSelected: boolean;
  onSelect: () => void;
  onRename: (id: string, newName: string) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isSelected,
  onSelect,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(chat.name);

  const handleBlur = () => {
    setIsEditing(false);
    if (newName.trim() !== "") {
      onRename(chat.id, newName); // ✅ Ensures the chat name updates
    } else {
      setNewName(chat.name);
    }
  };

  return (
    <li
      className={`${styles.item} ${isSelected ? styles.selected : ""}`}
      onClick={onSelect}
    >
      {isEditing ? (
        <input
          className={styles.input}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)}>{chat.name}</span>
      )}
    </li>
  );
};

export default ChatItem;
