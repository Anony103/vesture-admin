import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

// 1️⃣ Define the type for the context value
interface AppContextType {
  user: { name: string } | null;
  setUser: React.Dispatch<React.SetStateAction<{ name: string } | null>>;
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  handleSearchChange: (term: string) => void;
  searchTerm: string;
  setOnSearch: React.Dispatch<
    React.SetStateAction<((term: string) => void) | null>
  >;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

// 2️⃣ Create the context (with undefined default to enforce provider usage)
const AppContext = createContext<AppContextType | undefined>(undefined);

// 3️⃣ Define the provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [theme, setTheme] = useState<string>("light");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [onSearch, setOnSearch] = useState<((term: string) => void) | null>(
    null
  );

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (onSearch) onSearch(term); // ✅ now TypeScript knows onSearch is callable
    },
    [onSearch]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        theme,
        setTheme,
        handleSearchChange,
        searchTerm,
        setOnSearch,
        setSearchTerm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// 4️⃣ Create a custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
