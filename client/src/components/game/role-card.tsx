import { useGameContext } from "@/hooks/useGameContext";
import { View, Text } from "react-native";

export default function RoleCard() {
  const { currentPlayer } = useGameContext()
  return <View className="mb-6 p-4 bg-gray-100 rounded-lg">
    <Text className="text-lg font-semibold mb-1">Your Role</Text>
    <Text className="text-2xl font-bold">
      {currentPlayer?.role?.name}
    </Text>
    <Text className="text-sm text-gray-600 capitalize">
      {currentPlayer?.role?.team}
    </Text>
    {currentPlayer?.role?.ability && (
      <Text className="text-sm text-gray-700 mt-2">
        {currentPlayer.role.ability}
      </Text>
    )}
  </View>
}
