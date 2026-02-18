import { useGameContext } from "@/hooks/useGameContext";
import { useSocketContext } from "@/hooks/useSocketContext";
import { PauseTimerRequest, RequestEnum, ResetTimerRequest, StartTimerRequest, } from "@botc/shared";
import { View, Text, Pressable } from "react-native";

export default function Timer() {
  const { currentPlayer, gameRoom, running, timeRemaining } = useGameContext()
  const { client } = useSocketContext()
  const displayMinutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0')
  const displaySeconds = String(timeRemaining % 60).padStart(2, '0')

  const handleStartPress = () => {
    if (!gameRoom) return
    const startTimerRequest: StartTimerRequest = { code: gameRoom.code }
    client.send(RequestEnum.StartTimer, startTimerRequest)
    console.log('Timer Start Sent')
  }
  const handlePausePress = () => {
    if (!gameRoom) return
    const pauseTimerRequest: PauseTimerRequest = { code: gameRoom.code }
    client.send(RequestEnum.PauseTimer, pauseTimerRequest)
  }

  const handleResetPress = () => {
    if (!gameRoom) return
    const resetTimerRequest: ResetTimerRequest = { code: gameRoom.code }
    client.send(RequestEnum.ResetTimer, resetTimerRequest)
  }

  return (
    <View className="bg-gray-100 rounded-lg p-4 mb-2 items-center">
      <Text className="text-3xl font-bold mb-3">
        {displayMinutes}:{displaySeconds}
      </Text>
      {currentPlayer?.host &&
        <View className="flex-row gap-3">
          <Pressable
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={running ? handlePausePress : handleStartPress}
          >
            <Text className="text-white font-medium">{running ? 'Pause' : 'Start'}</Text>
          </Pressable>
          <Pressable
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={handleResetPress}
          >
            <Text className="text-white font-medium">Reset</Text>
          </Pressable>
        </View>}
    </View>
  )
}
