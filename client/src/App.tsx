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
