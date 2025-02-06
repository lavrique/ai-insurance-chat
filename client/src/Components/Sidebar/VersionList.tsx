import React, { useEffect, useRef, useState } from "react";
import styles from "./VersionList.module.css";
import { useChatContext, Version } from "../../context/ChatContext";
import {
  getLocalStorageSelectedVersion,
  setLocalStorageSelectedVersion,
} from "../../localStorage/localStorage";

const VersionList: React.FC = () => {
  // Example list of versions
  const chatContext = useChatContext();

  const { versions, setActiveVersion, activeVersionId } = chatContext;

  const [selectedVersion, setSelectedVersion] = useState(
    getLocalStorageSelectedVersion(),
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const version = versions.find(
      (version) => version.id === activeVersionId,
    );
    if (version) {
      setSelectedVersion({ ...version });
    }
  }, [activeVersionId]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleVersionSelect = (version: Version) => {
    setActiveVersion(version.id);
    setLocalStorageSelectedVersion(version);
    setShowDropdown(false);
  };

  // 2) useEffect to register a global click-away listener
  useEffect(() => {
    // Only listen if the dropdown is shown
    if (showDropdown) {
      const handleClickOutside = (event: MouseEvent) => {
        // Make sure the ref is set
        if (!dropdownRef.current) return;

        // The event target is the element that was clicked
        if (
          // Cast event.target to an Element to use contains
          event.target instanceof Element &&
          !dropdownRef.current.contains(event.target)
        ) {
          // If the click was outside the dropdown, close it
          setShowDropdown(false);
        }
      };

      // Register the event
      document.addEventListener("mousedown", handleClickOutside);
      // Cleanup function
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDropdown]);

  return (
    <div className={styles.versionListContainer}>
      <h2 className={styles.title}>Versions</h2>
      <div className={styles.selectedVersion} onClick={toggleDropdown}>
        {/* TODO see if this can be change */}
        {selectedVersion?.name}
        <span className={styles.dropdownIcon}>▼</span>
      </div>

      {showDropdown && (
        <ul ref={dropdownRef} className={styles.versionsDropdown}>
          {versions.map((version) => (
            <li
              key={version.id}
              className={styles.dropdownItem}
              onClick={() => handleVersionSelect(version)}
            >
              {version.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VersionList;
