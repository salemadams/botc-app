import { useGameContext } from "@/hooks/useGameContext";
import { Button, Text, View } from "react-native";
import { LeaveRoomRequest, StartGameRequest } from "../../../../shared/types/game";
import { SocketEvent } from "../../../../shared/types/events";
import { useSocketContext } from "@/hooks/useSocketContext";

export default function LobbyPage() {
  const { client } = useSocketContext();
  const { gameRoom, currentPlayer } = useGameContext();

  const startGame = () => {
    if (!gameRoom) return;
    const startGameRequest: StartGameRequest = { code: gameRoom.code };
    client.send(SocketEvent.StartGame, startGameRequest);
  };

  const leaveLobby = () => {
    if (gameRoom && gameRoom.code) {
      const leaveRequest: LeaveRoomRequest = { code: gameRoom.code };
      client.send(SocketEvent.LeaveRoom, leaveRequest);
    }
  };

  return (
    <View className="flex justify-center items-center w-full h-full">
      {gameRoom && gameRoom.players && gameRoom.players.length > 0 ? (
        <View>
          <Text>Host Page</Text>
          <Text>Host: {gameRoom.players.find((p) => p.host)?.name}</Text>
          <Text>Game Code: {gameRoom.code}</Text>
          {gameRoom.players.length > 0 ? (
            gameRoom.players.map((p) => !p.host && <Text key={p.socketId}>{p.name}</Text>)
          ) : (
            <Text>Lobby is empty</Text>
          )}
          {currentPlayer?.host && <Button title="Start Game" onPress={startGame}></Button>}
          <Button title="Leave Lobby" onPress={leaveLobby}></Button>
        </View>
      ) : (
        <Text>...Loading</Text>
      )}
    </View>
  );
}
