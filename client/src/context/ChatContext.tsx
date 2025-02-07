import React, {
  createContext,
  useState,
  ReactNode,
  use,
  useEffect,
  useContext,
} from "react";
import { getAllMessages, getAllVersions } from "../services/firebase";
import { v7 } from "uuid";
import { buildChatsFromDatabaseMessages } from "../utils/buildChatsFromDatabaseMessages";
import useAppStore from "../hooks/useAppStore";

export type EmbeddingVersion = "Embeddings-v0.0.1" | string;

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  // TODO delete version
  version?: EmbeddingVersion;
  note?: string;
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
}

export interface DatabaseMessage extends Message {
  chatId: string;
  chatName: string;
  versionName: string;
}

export interface Version {
  id: string;
  name: string;
  chats: Chat[];
}

export interface DatabaseVersion extends Version {}

interface ChatContextType {
  versions: Version[];
  setActiveVersion: (id: string) => void;
  activeVersionId: string;
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
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined,
);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // TODO improve this. chats no longer necessary. access from version.chats
  const [chats, setChats] = useState<Chat[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>("");
  const [activeChatId, setActiveChatId] = useState<string>("");
  const { setIsAppLoading } = useAppStore(
    (state) => state.uiState,
  );

  useEffect(() => {
    const getAllMessagesCallback = async () => {
      setIsAppLoading(true);
      const retrievedVersions: DatabaseVersion[] = await getAllVersions();
      setVersions(retrievedVersions);
      setActiveVersionId(retrievedVersions[0].id);

      const retrievedMessages: DatabaseMessage[] = await getAllMessages(
        retrievedVersions[0].id,
      );
      console.log("debug --- messages response", retrievedMessages);
      const buildedChats =
        buildChatsFromDatabaseMessages(retrievedMessages);

      setChats(buildedChats);
      setActiveChat(buildedChats?.[0]?.id);
      setIsAppLoading(false);
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

  const setActiveChat = (id: string) => {
    setActiveChatId(id);
  };

  const setActiveVersion = async (id: string) => {
    setActiveVersionId(id);

    // TODO do not retrieve version if already retrieved
    const isVersionAlreadyRetrieved = versions.some(
      (version) => version.id === id,
    );
    setIsAppLoading(true);
    const retrievedMessages: DatabaseMessage[] = await getAllMessages(id);
    setIsAppLoading(false);

    const buildedChats = buildChatsFromDatabaseMessages(retrievedMessages);
    setChats(buildedChats);
    setActiveChat(buildedChats?.[0]?.id);
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
        versions,
        setActiveVersion,
        activeVersionId,
        chats,
        setChats,
        activeChatId,
        addNewChat,
        setActiveChat,
        addMessageToChat,
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
