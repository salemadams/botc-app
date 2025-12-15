import { View, Text, Button } from "react-native";
import { useGameContext } from "@/hooks/useGameContext";
import { useSocketContext } from "@/hooks/useSocketContext";
import { LeaveRoomRequest } from "../../../../shared/types/game";
import { SocketEvent } from "../../../../shared/types/events";

export default function SessionPage() {
  const { gameRoom, currentPlayer } = useGameContext();
  const { client } = useSocketContext();

  const leaveGame = () => {
    if (gameRoom && gameRoom.code) {
      const leaveRequest: LeaveRoomRequest = { code: gameRoom.code };
      client.send(SocketEvent.LeaveRoom, leaveRequest);
    }
  };

  return (
    <View className="flex justify-center items-center w-full h-full">
      <Text>{currentPlayer!.role?.name ?? ""}</Text>
      <Button title="Leave Game" onPress={leaveGame}></Button>
    </View>
  );
}
