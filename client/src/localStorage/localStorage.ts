import { v7 } from "uuid";
import { Version } from "../context/ChatContext";

export const setLocalStorageSelectedVersion = (version: Version) => {
  localStorage.setItem("selectedVersion", JSON.stringify(version));
};

export const getLocalStorageSelectedVersion = (): Version => {
  const savedSelectedVersionJSON = localStorage.getItem("selectedVersion");
  let selectedVersion = null;
  if (savedSelectedVersionJSON) {
    selectedVersion = JSON.parse(savedSelectedVersionJSON);
    return selectedVersion;
  }
  return {
    id: v7(),
    name: 'Embeddings'
  }
};
