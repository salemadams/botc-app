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
  EventEnum,
  KillToggledEvent,
  MessageSentEvent,
  Message,
  DayChangedEvent,
} from "@botc/shared";
import { useSocketContext } from "./useSocketContext";

interface GameContextType {
  gameRoom?: GameRoom;
  setGameRoom: (room?: GameRoom) => void;
  currentPlayer?: Player;
  setCurrentPlayer: (player?: Player) => void;
  messages: Record<string, Message[]>
  addMessage: (socketId: string, message: Message) => void
  day: number,
  setDay: (day: number) => void
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameRoom, setGameRoom] = useState<GameRoom | undefined>(undefined);
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>(
    undefined,
  );
  const [day, setDay] = useState(1)
  const { client } = useSocketContext();

  const addMessage = (socketId: string, message: Message) => {
    setMessages((prev) => ({
      ...prev,
      [socketId]: [...(prev[socketId] ?? []), message],
    }));
  };

  useEffect(() => {
    const unsubscribers = [
      client.subscribe(EventEnum.PlayerJoined, (event: PlayerJoinedEvent) => {
        setGameRoom((prevRoom?: GameRoom) => {
          if (!prevRoom) return prevRoom;
          return { ...prevRoom, players: [...prevRoom.players, event.player] };
        });
      }),
      client.subscribe(EventEnum.PlayerLeft, (event: PlayerLeftEvent) => {
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
      client.subscribe(EventEnum.RoomLeft, () => {
        setGameRoom(undefined);
        router.back();
      }),
      client.subscribe(EventEnum.DayChanged, (event: DayChangedEvent) => {
        setDay(event.day)
      }),
      client.subscribe(EventEnum.JoinRoomError, (event: JoinRoomErrorEvent) =>
        console.log(event.message),
      ),
      client.subscribe(EventEnum.GameStarted, (event: GameStartedEvent) => {
        setGameRoom(event.room);
        event.room.players.map(
          (p) => !p.host && console.log(`${p.name} is ${p.role!.name}`),
        );
        router.replace("/game/session");
      }),
      client.subscribe(EventEnum.RoleAssigned, (event: RoleAssignedEvent) => {
        setCurrentPlayer((prev) => {
          if (!prev) return;
          return {
            ...prev,
            role: event.role,
          };
        });
      }),
      client.subscribe(EventEnum.PlayerNotified, () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
      ),
      client.subscribe(EventEnum.KillToggled, (event: KillToggledEvent) => {
        setGameRoom((prevRoom?: GameRoom) => {
          if (!prevRoom) return prevRoom;
          return {
            ...prevRoom,
            players: prevRoom.players.map((p) =>
              p.socketId === event.socketId ? { ...p, alive: event.alive } : p,
            ),
          };
        });
      }),
      client.subscribe(EventEnum.MessageSent, (event: MessageSentEvent) => {
        addMessage(event.fromSocket, event.message);
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);
  return (
    <GameContext.Provider
      value={{ day, setDay, gameRoom, setGameRoom, currentPlayer, setCurrentPlayer, messages, addMessage }}
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
