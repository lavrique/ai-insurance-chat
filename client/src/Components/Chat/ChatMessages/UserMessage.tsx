import { useRef, useState } from "react";
import styles from "./MessageItem.module.css";

type UserMessageProps = {
  text: string;
};

const UserMessage: React.FC<UserMessageProps> = ({ text }) => {
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOnMouseEnter = () => {
    setIsHovered(true);
  };

  const handleOnMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`${styles.message} ${styles.user}`}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
    >
      {text}
    </div>
  );
};
export default UserMessage;
