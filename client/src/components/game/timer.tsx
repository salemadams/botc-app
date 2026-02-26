import { useGameContext } from "@/hooks/useGameContext";
import { useSocketContext } from "@/hooks/useSocketContext";
import { ChangeTimerRequest, PauseTimerRequest, RequestEnum, ResetTimerRequest, StartTimerRequest, } from "@botc/shared";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import TimeSelectModal from "./time-select-modal";

export default function Timer() {
  const { currentPlayer, gameRoom, running, timeRemaining, } = useGameContext()
  const [timeSelectModalVisible, setTimeSelectModalVisible] = useState(false)
  const [showMinutesInModal, setShowMinutesInModal] = useState(true)
  const { client } = useSocketContext()
  const [minutesInput, setMinutesInput] = useState(10)
  const [secondsInput, setSecondsInput] = useState(0)
  const displayMinutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0')
  const displaySeconds = String(timeRemaining % 60).padStart(2, '0')

  const handleModalClose = () => {
    if (!gameRoom) return
    const changeTimerRequest: ChangeTimerRequest = { code: gameRoom.code, time: minutesInput * 60 + secondsInput }
    client.send(RequestEnum.ChangeTimer, changeTimerRequest)
    setTimeSelectModalVisible(false)
  }

  const openPicker = (forMinutes: boolean) => {
    setShowMinutesInModal(forMinutes)
    setTimeSelectModalVisible(true)
  }

  const handleStartPress = () => {
    if (!gameRoom) return
    const startTimerRequest: StartTimerRequest = { code: gameRoom.code }
    client.send(RequestEnum.StartTimer, startTimerRequest)
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
      {currentPlayer?.host && !running ? (
        <Pressable className="flex-row mb-3" onPress={() => openPicker(true)}>
          <Text className="text-3xl font-bold text-blue-600">{displayMinutes}</Text>
          <Text className="text-3xl font-bold">:</Text>
          <Pressable onPress={() => openPicker(false)}>
            <Text className="text-3xl font-bold text-blue-600">{displaySeconds}</Text>
          </Pressable>
        </Pressable>
      ) : (
        <Text className="text-3xl font-bold mb-3">
          {displayMinutes}:{displaySeconds}
        </Text>
      )}
      {currentPlayer?.host && (
        <>
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
          </View>
          <TimeSelectModal
            modalVisible={timeSelectModalVisible}
            onClose={handleModalClose}
            value={showMinutesInModal ? minutesInput : secondsInput}
            setValue={showMinutesInModal ? setMinutesInput : setSecondsInput}
            forMinutes={showMinutesInModal}
          />
        </>
      )}
    </View >
  )
}
