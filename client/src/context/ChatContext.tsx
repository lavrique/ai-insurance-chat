import React, {
  createContext,
  useState,
  ReactNode,
  use,
  useEffect,
  useContext,
} from "react";
import { getAllMessages } from "../services/firebase";
import { v7 } from "uuid";

export type EmbeddingVersion = "Embeddings-v0.0.1" | string;

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  version: EmbeddingVersion;
  note?: string;
}

export interface DatabaseMessage extends Message {
  chatId: string;
  chatName: string;
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
}

interface ChatContextType {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  activeChatId: EmbeddingVersion;
  addNewChat: (name: string) => void;
  setActiveChat: (id: string) => void;
  addMessageToChat: (
    id: string,
    chatId: string,
    text: string,
    sender: "user" | "bot",
  ) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined,
);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeEmbeddingVersion, setActiveEmbeddingVersion] =
    useState<EmbeddingVersion>("");
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAllMessagesCallback = async () => {
      const retrievedMessages: DatabaseMessage[] = await getAllMessages();
      console.log("debug --- messages response", retrievedMessages);
      const grouped = retrievedMessages.reduce<{
        [key: EmbeddingVersion]: DatabaseMessage[];
      }>((acc, item) => {
        if (!acc[item.chatName || "test-chat-message-name"]) {
          acc[item.chatName || "test-chat-message-name"] = []; // Initialize array if it doesn't exist
        }
        acc[item.chatName || "test-chat-message-name"].push(item);
        return acc;
      }, {});

      // Convert the grouped object into the desired array structure
      const containerItems = Object.entries(grouped).map(
        ([chatName, messages]) => ({
          id: messages[0]?.chatId ||  v7(),
          name: chatName,
          messages,
        }),
      );

      // setChats(containerItems.reverse());
      setChats(containerItems);
      setActiveChat(containerItems[0].id);
    };
    getAllMessagesCallback();
  }, []);

  const addNewChat = (name: string) => {
    const newChat: Chat = {
      id: (chats.length + 1).toString(),
      name,
      messages: [],
    };
    setChats([...chats, newChat]);
    setActiveChatId(newChat.id);
  };

  const setActiveChat = (id: EmbeddingVersion) => {
    setActiveChatId(id);
  };

  const addMessageToChat = (
    id: string,
    chatId: EmbeddingVersion,
    text: string,
    sender: "user" | "bot",
  ) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { id, text, sender, version: chatId },
              ],
            }
          : chat,
      ),
    );
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        activeChatId,
        addNewChat,
        setActiveChat,
        addMessageToChat,
        setIsLoading,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
