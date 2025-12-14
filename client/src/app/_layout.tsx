import { Stack } from "expo-router";
import { SocketProvider } from "@/hooks/useSocketContext";
import "../../global.css";
import { GameProvider } from "@/hooks/useGameContext";

export default function RootLayout() {
  return (
    <SocketProvider>
      <GameProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </GameProvider>
    </SocketProvider>
  );
}
