import { useEffect } from "react";

export const useClickOutsideOfElement = (
  elementRef: React.RefObject<HTMLUListElement | null>,
  isElementVisible: boolean,
) => {
  // 2) useEffect to register a global click-away listener
  useEffect(() => {
    // Only listen if the dropdown is shown
    if (isElementVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        // Make sure the ref is set
        if (!elementRef?.current) return;

        // The event target is the element that was clicked
        if (
          // Cast event.target to an Element to use contains
          event.target instanceof Element &&
          !elementRef.current.contains(event.target)
        ) {
          // If the click was outside the dropdown, close it
          // setShowDropdown(false);
          // setShowDropdown(false);
        }
      };

      // Register the event
      document.addEventListener("mousedown", handleClickOutside);
      // Cleanup function
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isElementVisible]);
};
