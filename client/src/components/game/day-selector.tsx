import { useGameContext } from "@/hooks/useGameContext";
import { useSocketContext } from "@/hooks/useSocketContext";
import { ChangeDayRequest, RequestEnum } from "@botc/shared";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, Text } from "react-native";

export default function DaySelector() {
  const { gameRoom, day, currentPlayer } = useGameContext()
  const { client } = useSocketContext()
  const changeDay = (value: number) => {
    if (!gameRoom) return
    const changeDayRequest: ChangeDayRequest = { code: gameRoom.code, day: value }
    client.send(RequestEnum.ChangeDay, changeDayRequest)
  }
  return <View className="flex-row gap-4 justify-center items-center">
    {currentPlayer?.host &&
      <Pressable onPress={() => changeDay(day - 1)} disabled={day <= 1} style={{ opacity: day > 1 ? 1 : 0 }}>
        <Ionicons name="chevron-back" size={24}></Ionicons>
      </Pressable>}
    <Text className="text-lg font-semibold">{gameRoom?.isNight ? 'Night' : 'Day'}: {day}</Text>
    {currentPlayer?.host &&
      <Pressable onPress={() => changeDay(day + 1)}>
        <Ionicons name="chevron-forward" size={24}></Ionicons>
      </Pressable>}
  </View>
}
