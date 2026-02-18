import { useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";

export default function Timer() {
  const [minutes, setMinutes] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(minutes * 60 + seconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(0)

  const handleStartClick = () => {
    if (intervalRef.current && running) return
    setRunning(true)
    const intervalId = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current)
          intervalRef.current = 0
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000);
    intervalRef.current = intervalId;
  }
  const handlePauseClick = () => {
    setRunning(false)
    clearInterval(intervalRef.current)
    intervalRef.current = 0
  }
  const handleResetClick = () => {
    if (!intervalRef.current) return
    setRunning(false)
    clearInterval(intervalRef.current)
    intervalRef.current = 0
    setTimeRemaining(minutes * 60 + seconds)
  }

  const displayMinutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0')
  const displaySeconds = String(timeRemaining % 60).padStart(2, '0')

  return (
    <View className="bg-gray-100 rounded-lg p-4 mb-2 items-center">
      <Text className="text-3xl font-bold mb-3">
        {displayMinutes}:{displaySeconds}
      </Text>
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
      </View>
    </View>
  )
}
