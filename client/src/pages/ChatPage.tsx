import React, { useRef, useState } from "react";
import styles from "./chat.module.css";
import ChatList from "../Components/Sidebar/ChatList";
import MessageList from "../Components/Chat/ChatMessages/MessageList";
import {
  gerLocalStorageSideBarWidth,
  setLocalStorageSideBarWidth,
} from "../utils/localStorage";

const ChatPage: React.FC = () => {
  // Track the width of the sidebar
  const [sidebarWidth, setSidebarWidth] = useState(
    // gerLocalStorageSideBarWidth(250),
    250,
  );

  // Refs to handle dragging
  const isResizingRef = useRef(false);
  const lastDownXRef = useRef(0);

  // Optional min/max
  const minWidth = 150;
  const maxWidth = 600;

  // Mouse down on the drag handle
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isResizingRef.current = true;
    lastDownXRef.current = e.clientX;
    e.preventDefault(); // Prevent text selection, etc.
  };

  // Mouse move on the container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;
    // How far the mouse has moved since last tick
    const offset = e.clientX - lastDownXRef.current;
    const newWidth = sidebarWidth + offset;

    // Enforce min/max
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
      // setLocalStorageSideBarWidth(newWidth);
      // Update lastDownX so we can calculate next offset
      lastDownXRef.current = e.clientX;
    }
  };

  // Mouse up on the container (stop resizing)
  const handleMouseUp = () => {
    isResizingRef.current = false;
  };

  return (
    <div
      className={styles["chat-container"]}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Sidebar with dynamic width */}
      <aside
        className={styles["chat-sidebar"]}
        style={{ width: sidebarWidth }}
      >
        {/* Your chat list */}
        <ChatList />

        {/* The vertical "drag" handle on the right edge */}
        <div
          className={styles["drag-handle"]}
          onMouseDown={handleMouseDown}
        ></div>
      </aside>

      {/* Main chat area */}
      <main className={styles["chat-main"]}>
        <MessageList />
      </main>
    </div>
  );
};

export default ChatPage;
