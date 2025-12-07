import { useSocketContext } from "@/hooks/useSocketContext";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const { client } = useSocketContext();
  const gameCode = Math.floor(Math.random() * 9000) + 1000;
  client.send("joinRoom", { code: gameCode, host: true });
  useEffect(() => {
    return () => client.send("leaveRoom", gameCode);
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Host Page</Text>
      <Text>Game Code: {gameCode}</Text>
    </View>
  );
}
