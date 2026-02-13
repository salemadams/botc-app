import { useSocketContext } from "@/hooks/useSocketContext";
import { useEffect, useState } from "react";
import { Button, TextInput, View } from "react-native";
import { JoinRoomRequest, LeaveRoomRequest, RoomJoinedEvent, RequestEnum, EventEnum } from "@botc/shared";
import { useGameContext } from "@/hooks/useGameContext";
import { router } from "expo-router";

export default function JoinPage() {
  const [gameCode, setGameCode] = useState("");
  const { setGameRoom, setCurrentPlayer } = useGameContext();
  const { client, userName } = useSocketContext();
  useEffect(() => {
    client.subscribe(EventEnum.RoomJoined, (event: RoomJoinedEvent) => {
      setCurrentPlayer(event.currentPlayer);
      router.navigate("./game/lobby");
      setGameRoom(event.room);
    });
    return () => {
      if (gameCode.length > 0) {
        const leaveRequest: LeaveRoomRequest = { code: gameCode };
        client.send(RequestEnum.LeaveRoom, leaveRequest);
      }
    };
  }, []);
  const handleCodeSubmit = () => {
    const joinRequest: JoinRoomRequest = { code: gameCode, name: userName };
    client.send(RequestEnum.JoinRoom, joinRequest);
  };

  return (
    <View className="flex justify-center items-center w-full h-full">
      <TextInput
        className="w-2/4 h-10 border border-gray-300 rounded-lg px-4 text-base"
        placeholder="Game Code"
        keyboardType="numeric"
        value={gameCode}
        onChangeText={setGameCode}
      />
      <Button title="Submit" onPress={handleCodeSubmit}></Button>
    </View>
  );
}
