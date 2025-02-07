import React from "react";
import styles from "./ThinkingIndicator.module.css";

const ThinkingIndicator: React.FC = () => {
  return (
    <div className={styles.thinkingContainer}>
      <span className={styles.thinkingText}>Thinking</span>
      <span className={styles.dot} style={{ animationDelay: "0s" }}>.</span>
      <span className={styles.dot} style={{ animationDelay: "0.2s" }}>.</span>
      <span className={styles.dot} style={{ animationDelay: "0.4s" }}>.</span>
    </div>
  );
};

export default ThinkingIndicator;
