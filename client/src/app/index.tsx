import { SocketProvider } from "@/hooks/useSocketContext";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex gap-10 w-full h-full justify-center items-center">
      <Text className="font-semibold text-2xl">Blood on the Clocktower</Text>
      <SocketProvider>
        <Link href="./host" asChild>
          <Pressable>
            <Text>Host</Text>
          </Pressable>
        </Link>

        <Link href="./join" asChild>
          <Pressable>
            <Text>Join</Text>
          </Pressable>
        </Link>
      </SocketProvider>
    </View>
  );
}
