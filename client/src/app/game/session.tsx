import { View, Text, Button, Pressable, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGameContext } from "@/hooks/useGameContext";
import { useSocketContext } from "@/hooks/useSocketContext";
import {
  LeaveRoomRequest,
  RequestEnum,
  ToggleNightRequest,
} from "@botc/shared";
import { usePlayerModal } from "@/hooks/usePlayerModal";
import PlayerModal from "@/components/game/player-modal";
import PlayerList from "@/components/game/player-list";
import RoleCard from "@/components/game/role-card";
import { useHostListModal } from "@/hooks/useHostListModal";
import HostListModal from "@/components/game/host-list-modal";
import DaySelector from "@/components/game/day-selector";
import Timer from "@/components/game/timer";

export default function SessionPage() {
  const { gameRoom, currentPlayer, messages, } = useGameContext();
  const { onModalClose, sendMessage, toggleAlive, notifyPlayer, selectedPlayer, setSelectedPlayer, playerModalVisible, setPlayerModalVisible, messageInput, setMessageInput } = usePlayerModal();
  const { hostListVisible, reminderInfo, setHostListVisible } = useHostListModal()
  const { client } = useSocketContext();

  const leaveGame = () => {
    if (gameRoom && gameRoom.code) {
      const leaveRequest: LeaveRoomRequest = { code: gameRoom.code };
      client.send(RequestEnum.LeaveRoom, leaveRequest);
      router.navigate("/home");
    }
  };

  const toggleNight = () => {
    if (gameRoom && gameRoom.code) {
      const toggleNightRequest: ToggleNightRequest = { code: gameRoom.code }
      client.send(RequestEnum.ToggleNight, toggleNightRequest)
    }
  }

  return (
    <View className="justify-center items-center w-full h-full">
      {gameRoom && currentPlayer ? (
        <View className="w-full px-4">
          <DaySelector></DaySelector>
          <Timer></Timer>
          {currentPlayer.host && (
            <View className="items-center mb-2">
              <Pressable
                className="flex-row items-center gap-2 px-4 py-2 bg-gray-200 rounded-full"
                onPress={toggleNight}
              >
                <Ionicons name="sunny" size={18} color="orange" />
                <Text className="text-sm font-semibold">Switch to {gameRoom?.isNight ? 'Day' : 'Night'}</Text>
              </Pressable>
            </View>
          )}
          <View className="flex-row justify-between">
            <Text className="text-xl font-bold mb-2">Game Session</Text>
            {currentPlayer.host &&
              <Pressable onPress={() => setHostListVisible(true)}>
                <Ionicons name="moon" size={24} color="black" />
              </Pressable>}
          </View>
          <Text className="text-base mb-4">Game Code: {gameRoom.code}</Text>
          {!currentPlayer.host &&
            <RoleCard></RoleCard>}
          <Text className="text-lg font-semibold mb-2">Host:</Text>
          <Pressable
            className="p-3 border-b border-gray-100 flex-row justify-between items-center"
            onPress={() => {
              setSelectedPlayer(gameRoom.players.find((p) => p.host)!);
              setPlayerModalVisible(true);
            }}
          >
            <Text className="text-base">{gameRoom.players.find((p) => p.host)!.name}</Text>
          </Pressable>
          <Text className="text-lg font-semibold mb-2">Players:</Text>
          <PlayerList setSelectedPlayer={setSelectedPlayer} setModalVisible={setPlayerModalVisible}></PlayerList>
          <View className="mt-6">
            <Button title="Leave Game" onPress={leaveGame} />
          </View>
          {reminderInfo &&
            <HostListModal modalVisible={hostListVisible} onClose={() => setHostListVisible(false)} reminderInfo={reminderInfo}></HostListModal>}
          <PlayerModal modalVisible={playerModalVisible} onModalClose={onModalClose} selectedPlayer={selectedPlayer} notifyPlayer={notifyPlayer} toggleAlive={toggleAlive} messages={messages} sendMessage={sendMessage} messageInput={messageInput} setMessageInput={setMessageInput}></PlayerModal>
        </View>
      ) : (
        <Text>...Loading</Text>
      )}
    </View>
  );
}
