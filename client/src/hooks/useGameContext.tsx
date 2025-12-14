import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  GameRoom,
  JoinRoomErrorEvent,
  PlayerJoinedEvent,
  PlayerLeftEvent,
} from "../../../shared/types/game";
import { useSocketContext } from "./useSocketContext";
import { SocketEvent } from "../../../shared/types/events";

interface GameContextType {
  gameRoom?: GameRoom;
  setGameRoom: (room?: GameRoom) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameRoom, setGameRoom] = useState<GameRoom | undefined>(undefined);
  const { client } = useSocketContext();
  useEffect(() => {
    const unsubscribers = [
      client.subscribe(SocketEvent.PlayerJoined, (event: PlayerJoinedEvent) => {
        setGameRoom((prevRoom?: GameRoom) => {
          if (!prevRoom) return prevRoom;
          return { ...prevRoom, players: [...prevRoom.players, event.player] };
        });
      }),
      client.subscribe(SocketEvent.PlayerLeft, (event: PlayerLeftEvent) => {
        setGameRoom((prevRoom?: GameRoom) => {
          if (!prevRoom) return prevRoom;
          return {
            ...prevRoom,
            players: prevRoom.players.filter((p) => p.socketId !== event.socketId),
          };
        });
      }),
      client.subscribe(SocketEvent.RoomLeft, () => {
        router.navigate("./home");
        setGameRoom(undefined);
      }),
      client.subscribe(SocketEvent.JoinRoomError, (event: JoinRoomErrorEvent) =>
        console.log(event.message),
      ),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);
  return <GameContext.Provider value={{ gameRoom, setGameRoom }}>{children}</GameContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
