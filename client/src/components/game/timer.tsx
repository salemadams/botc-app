import { useGameContext } from "@/hooks/useGameContext";
import { View, Text, Pressable } from "react-native";

interface TimerProps {
  timeRemaining: number
  running: boolean
  handleStartClick: () => void
  handlePauseClick: () => void
  handleResetClick: () => void
}
export default function Timer({ timeRemaining, running, handleStartClick, handlePauseClick, handleResetClick }: TimerProps) {
  const { currentPlayer } = useGameContext()
  const displayMinutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0')
  const displaySeconds = String(timeRemaining % 60).padStart(2, '0')

  return (
    <View className="bg-gray-100 rounded-lg p-4 mb-2 items-center">
      <Text className="text-3xl font-bold mb-3">
        {displayMinutes}:{displaySeconds}
      </Text>
      {currentPlayer?.host &&
        <View className="flex-row gap-3">
          <Pressable
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={running ? handlePauseClick : handleStartClick}
          >
            <Text className="text-white font-medium">{running ? 'Pause' : 'Start'}</Text>
          </Pressable>
          <Pressable
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={handleResetClick}
          >
            <Text className="text-white font-medium">Reset</Text>
          </Pressable>
        </View>}
    </View>
  )
}
