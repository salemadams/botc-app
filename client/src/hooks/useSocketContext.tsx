import SocketIoClient from "@/services/SocketIoClient";
import { createContext, ReactNode, useContext, useState } from "react";

interface SocketContextType {
  client: SocketIoClient;
  userName: string;
  setUsername: (name: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(() => new SocketIoClient());
  const [userName, setUsername] = useState("");
  return (
    <SocketContext.Provider value={{ client, userName, setUsername }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};
