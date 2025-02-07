import ChatPage from "./pages/ChatPage";
import { ChatProvider } from "./context/ChatContext";
import { LoadingProvider } from "./context/LoadingContext";

function App() {
  return (
    <LoadingProvider>
      <ChatProvider>
        <ChatPage />
      </ChatProvider>
    </LoadingProvider>
  );
}

export default App;
