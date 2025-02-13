import { v7 } from "uuid";
import { Version } from "../context/ChatContext";

export const setLocalStorageSelectedVersion = (version: Version) => {
  localStorage.setItem("selectedVersion", JSON.stringify(version));
};

export const getLocalStorageSelectedVersion = (): Version | null => {
  const savedSelectedVersionJSON = localStorage.getItem("selectedVersion");
  let selectedVersion = null;
  if (savedSelectedVersionJSON) {
    selectedVersion = JSON.parse(savedSelectedVersionJSON);
    return selectedVersion;
  }
  return null;
};

export const setLocalStorageSideBarWidth = (width: number) => {
  localStorage.setItem("sidebarWidth", `${width}`);
};

//TODO see why it does not work properly. When I refresh it flickers
export const gerLocalStorageSideBarWidth = (defaultWidth: number): number => {
  const width = localStorage.getItem("sidebarWidth");
  if (!width) {
    return defaultWidth;
  } else return Number(width);
};
