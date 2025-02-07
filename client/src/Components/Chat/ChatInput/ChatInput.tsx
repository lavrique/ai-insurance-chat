import React, { useState } from "react";
import styles from "./ChatInput.module.css";
import ThinkingIndicator from "./ThinkingIndicator";
import useAppStore from "../../../hooks/useAppStore";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const { isMessageAnswerLoading } = useAppStore(
    (state) => state.uiState,
  );
  const handleSend = () => {
    if (text.trim() !== "") {
      onSendMessage(text);
      setText("");
    }
  };

  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents adding a new line
      handleSend();
    }
  };

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement;
    setText(target.value);

    // Auto-resize the textarea
    target.style.height = "auto";
    if (target.scrollHeight > 50) {
      target.style.height = `${target.scrollHeight}px`;
    }
  };

  return (
    <>
      {isMessageAnswerLoading && <ThinkingIndicator />}
      <div className={styles.chatInput}>
        <textarea
          className={styles.input}
          placeholder="Type a message..."
          value={text}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
          rows={1} // Start with one row
        />
        <button className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </>
  );
};

export default ChatInput;
