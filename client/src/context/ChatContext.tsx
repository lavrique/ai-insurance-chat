import React, {
  createContext,
  useState,
  ReactNode,
  use,
  useEffect,
} from "react";
import { getAllMessages } from "../services/firebase";
import { v7 } from "uuid";

export type ChatVersion = "Embeddings-v0.0.1" | string;

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  version: string;
  note?: string;
}

interface Chat {
  id: ChatVersion;
  name: string;
  messages: Message[];
}

interface ChatContextType {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  activeChatId: ChatVersion;
  // addNewChat: () => void;
  setActiveChat: (id: string) => void;
  addMessageToChat: (
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
  const [activeChatId, setActiveChatId] = useState<ChatVersion>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAllMessagesCallback = async () => {
      const messages = await getAllMessages();
      const grouped = messages
        .reduce<{ [key: ChatVersion]: Message[] }>((acc, item) => {
          if (!acc[item.version]) {
            acc[item.version] = []; // Initialize array if it doesn't exist
          }
          acc[item.version].push(item);
          return acc;
        }, {});

      // Convert the grouped object into the desired array structure
      const containerItems = Object.entries(grouped).map(
        ([version, messages]) => ({
          id: version,
          name: version,
          messages,
        }),
      );

      console.log("debug --- chats", containerItems);
      setChats(containerItems);
      setActiveChat(containerItems[0].id);
    };
    getAllMessagesCallback();
  }, []);

  // const addNewChat = () => {
  //   const newChat: Chat = {
  //     id: (chats.length + 1).toString(),
  //     name: `Chat ${chats.length + 1}`,
  //     messages: [],
  //   };
  //   setChats([...chats, newChat]);
  //   setActiveChatId(newChat.id);
  // };

  const setActiveChat = (id: ChatVersion) => {
    setActiveChatId(id);
  };

  const addMessageToChat = (
    chatId: ChatVersion,
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
                { id: v7(), text, sender, version: chatId },
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
        // addNewChat,
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
