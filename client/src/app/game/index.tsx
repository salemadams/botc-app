import { useGameContext } from "@/hooks/useGameContext";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { LeaveRoomRequest } from "../../../../shared/types/game";
import { SocketEvent } from "../../../../shared/types/events";
import { useSocketContext } from "@/hooks/useSocketContext";
export default function GamePage() {
  const { client } = useSocketContext();
  const { gameRoom } = useGameContext();
  useEffect(() => {
    return () => {
      if (gameRoom && gameRoom.code) {
        const leaveRequest: LeaveRoomRequest = {
          code: gameRoom.code,
        };
        client.send(SocketEvent.LeaveRoom, leaveRequest);
      }
    };
  }, []);
  return (
    <View className="flex justify-center items-center w-full h-full">
      {gameRoom && gameRoom.players.length > 0 ? (
        <View>
          <Text>Host Page</Text>
          <Text>Host: {gameRoom.players.find((p) => p.host)?.name}</Text>
          <Text>Game Code: {gameRoom.code}</Text>
          {gameRoom.players.length > 0 ? (
            gameRoom.players.map((p) => p.host && <Text key={p.socketId}>{p.name}</Text>)
          ) : (
            <Text>Lobby is empty</Text>
          )}
        </View>
      ) : (
        <Text>...Loading</Text>
      )}
    </View>
  );
}
