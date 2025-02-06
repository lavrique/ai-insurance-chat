import { useEffect, useRef, useState } from "react";
import messageItemStyles from "./MessageItem.module.css";
import styles from "./BotMessage.module.css";
import { Message } from "../../../context/ChatContext";
import { addNoteToMessage } from "../../../services/firebase";

type UserMessageProps = {
  text: string;
};

const BotMessage: React.FC<Message> = ({
  id,
  sender,
  text,
  version,
  note,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [noteValue, setNoteValue] = useState(note);
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note && textareaRef.current) {
      textareaRef.current.disabled = true;
      setNoteValue(note);
    }
  }, [note, textareaRef.current]);

  const handleOnMouseEnter = () => {
    setIsHovered(true);
  };

  const handleOnMouseLeave = () => {
    setIsHovered(false);
  };

  const handleOnSaveNote = async () => {
    if (!noteValue) {
      return;
    }
    await addNoteToMessage(id, noteValue);
    // setIsEditEnabled(false);
    if (textareaRef.current) {
      textareaRef.current.disabled = true;
    }
  };

  const handleOnEdit = () => {
    if (note) {
      return;
    }
    setIsEditEnabled((prevValue) => !prevValue);
    if (textareaRef.current) {
      textareaRef.current.disabled = false;
      textareaRef.current.focus();
    }
  };

  const handleInput = (element: React.FormEvent<HTMLTextAreaElement>) => {
    setNoteValue(element.currentTarget.value);

    // Adjust the height of the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to auto to calculate the new height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 20}px`; // Set the new height
    }
  };

  return (
    <div className={messageItemStyles.messageContainer}>
      {(isHovered && !note) || isEditEnabled ? (
        <div
          onClick={handleOnEdit}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
          className={messageItemStyles.editButton}
        >
          Edit
        </div>
      ) : null}
      <div
        className={`${messageItemStyles.message} ${messageItemStyles.bot}`}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
      >
        {text}
        {isEditEnabled || note ? (
          <>
            <textarea
              value={noteValue}
              ref={textareaRef}
              onInput={handleInput}
              placeholder="Write note here.."
              style={{
                height: "64px", // Set the initial height
                width: "100%", // Take the full width of the parent
                resize: "none", // Disable manual resizing
                overflow: "hidden", // Hide the scrollbar
                minHeight: "40px", // Set a minimum height
              }}
            ></textarea>
            <div
              onClick={handleOnSaveNote}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              className={
                note
                  ? styles.saveNoteDisabled
                  : styles.saveNoteButton
              }
            >
              Save Note
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
export default BotMessage;
