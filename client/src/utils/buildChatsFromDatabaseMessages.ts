import { v7 } from "uuid";
import {
  DatabaseMessage,
  Chat,
  EmbeddingVersion,
} from "../context/ChatContext";

export const buildChatsFromDatabaseMessages = (
  retrievedMessages: DatabaseMessage[],
): Chat[] => {
  const grouped = retrievedMessages.reduce<{
    [key: EmbeddingVersion]: DatabaseMessage[];
  }>((acc, item) => {
    if (!acc[item.chatName || "test-chat-message-name"]) {
      acc[item.chatName || "test-chat-message-name"] = []; // Initialize array if it doesn't exist
    }
    acc[item.chatName || "test-chat-message-name"].push(item);
    return acc;
  }, {});

  // Convert the grouped object into the chats
  const chats = Object.entries(grouped).map(([chatName, messages]) => ({
    id: messages[0]?.chatId || v7(),
    name: chatName,
    messages,
  }));
  return chats;
};
