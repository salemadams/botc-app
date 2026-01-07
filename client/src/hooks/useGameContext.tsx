import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  GameRoom,
  GameStartedEvent,
  JoinRoomErrorEvent,
  Player,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  RoleAssignedEvent,
} from "../../../shared/types/game";
import { useSocketContext } from "./useSocketContext";
import { SocketEvent } from "../../../shared/types/events";

interface GameContextType {
  gameRoom?: GameRoom;
  setGameRoom: (room?: GameRoom) => void;
  currentPlayer?: Player;
  setCurrentPlayer: (player?: Player) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameRoom, setGameRoom] = useState<GameRoom | undefined>(undefined);
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>(
    undefined,
  );
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
            players: prevRoom.players.filter(
              (p) => p.socketId !== event.socketId,
            ),
          };
        });
      }),
      client.subscribe(SocketEvent.RoomLeft, () => {
        setGameRoom(undefined);
        router.back();
      }),
      client.subscribe(SocketEvent.JoinRoomError, (event: JoinRoomErrorEvent) =>
        console.log(event.message),
      ),
      client.subscribe(SocketEvent.GameStarted, (event: GameStartedEvent) => {
        setGameRoom(event.room);
        event.room.players.map(
          (p) => !p.host && console.log(`${p.name} is ${p.role!.name}`),
        );
        router.replace("/game/session");
      }),
      client.subscribe(SocketEvent.RoleAssigned, (event: RoleAssignedEvent) => {
        setCurrentPlayer((prev) => {
          if (!prev) return;
          return {
            ...prev,
            role: event.role,
          };
        });
      }),
      client.subscribe(SocketEvent.PlayerNotified, () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
      ),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);
  return (
    <GameContext.Provider
      value={{ gameRoom, setGameRoom, currentPlayer, setCurrentPlayer }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
