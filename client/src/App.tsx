import React, { useEffect } from "react";
import styles from "./App.module.css";
import ChatPage from "./pages/ChatPage";
import { ChatProvider } from "./context/ChatContext";

function App() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}

export default App;
