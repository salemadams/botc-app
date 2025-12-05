import SocketIoClient from "@/services/SocketIoClient";
import { createContext, ReactNode, useContext, useState } from "react";

interface Player {
  id: string;
  name: string;
}

interface SocketContextType {
  players: Player[];
  setPlayers: (data: Player[]) => void;
  client: SocketIoClient;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [client] = useState(() => new SocketIoClient());

  return (
    <SocketContext.Provider value={{ players, setPlayers, client }}>
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
