import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined,
);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider
      value={{ isLoading, showLoading, hideLoading }}
    >
      {children}
      {isLoading && <LoadingOverlay />}
    </LoadingContext.Provider>
  );
};

export const useLoadingContext = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

// The actual loading UI
const LoadingOverlay = () => {
  console.log("Loading overlay rendered"); // Debugging output
  return (
    <div
      style={{
        position: "fixed", // Cover the entire screen
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
        display: "flex",
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        zIndex: 1000, // Ensure it's on top of other elements
      }}
    >
      <div
        style={{
          border: "4px solid rgba(255, 255, 255, 0.3)", // Light border
          borderTop: "4px solid #ffffff", // White border for spinning effect
          borderRadius: "50%", // Make it circular
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite", // Spin animation
        }}
      ></div>

      {/* Optional: Add some text below the spinner */}
      <p
        style={{
          marginLeft: "10px",
          color: "#ffffff",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        Loading...
      </p>

      {/* Define the spin animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
