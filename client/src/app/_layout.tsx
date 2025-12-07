import { Stack } from "expo-router";
import { SocketProvider } from "@/hooks/useSocketContext";
import "../../global.css";

export default function RootLayout() {
  return (
    <SocketProvider>
      <Stack />
    </SocketProvider>
  );
}
