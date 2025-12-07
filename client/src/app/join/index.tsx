import { useSocketContext } from "@/hooks/useSocketContext";
import { useEffect, useState } from "react";
import { Button, TextInput, View } from "react-native";

export default function Index() {
  const [gameCode, setGameCode] = useState("");
  const { client } = useSocketContext();
  useEffect(() => {
    return () => {
      client.send("leaveRoom", gameCode);
    };
  }, []);
  const handleCodeSubmit = () => {
    // Add state for tracking submitted game code (used for proper disconnect on unmount)
    client.send("joinRoom", { code: gameCode, host: false });
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        className="w-2/4 h-10 border border-gray-300 rounded-lg px-4 text-base"
        placeholder="Game Code"
        value={gameCode}
        onChangeText={(code) => setGameCode(code)}
      />
      <Button title="Submit" onPress={handleCodeSubmit}></Button>
    </View>
  );
}
