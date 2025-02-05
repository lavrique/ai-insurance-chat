import ChatPage from "./pages/ChatPage";
import { ChatProvider } from "./context/ChatContext";
import { LoadingProvider } from "./context/LoadingContext";

function App() {
  return (
    <ChatProvider>
      <LoadingProvider>
        <ChatPage />
      </LoadingProvider>
    </ChatProvider>
  );
}

export default App;
