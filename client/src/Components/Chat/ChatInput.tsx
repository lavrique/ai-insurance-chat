import React, { useState } from "react";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() !== "") {
      onSendMessage(text);
      setText("");
    }
  };

  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className={styles.chatInput}>
      <input
        type="text"
        className={styles.input}
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button className={styles.sendButton} onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;
