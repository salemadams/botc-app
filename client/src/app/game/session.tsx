import { View, Text, Button, Pressable, } from "react-native";
import { router } from "expo-router";
import { useGameContext } from "@/hooks/useGameContext";
import { useSocketContext } from "@/hooks/useSocketContext";
import {
  LeaveRoomRequest,
  RequestEnum,
} from "@botc/shared";
import { usePlayerModal } from "@/hooks/usePlayerModal";
import PlayerModal from "@/components/game/player-modal";
import PlayerList from "@/components/game/player-list";
import RoleCard from "@/components/game/role-card";

export default function SessionPage() {
  const { gameRoom, currentPlayer, messages, } = useGameContext();
  const { onModalClose, sendMessage, toggleAlive, notifyPlayer, selectedPlayer, setSelectedPlayer, modalVisible, setModalVisible, messageInput, setMessageInput } = usePlayerModal();
  const { client } = useSocketContext();

  const leaveGame = () => {
    if (gameRoom && gameRoom.code) {
      const leaveRequest: LeaveRoomRequest = { code: gameRoom.code };
      client.send(RequestEnum.LeaveRoom, leaveRequest);
      router.navigate("/home");
    }
  };

  return (
    <View className="flex justify-center items-center w-full h-full">
      {gameRoom && currentPlayer ? (
        <View className="w-full px-4">
          <Text className="text-xl font-bold mb-2">Game Session</Text>
          <Text className="text-base mb-4">Game Code: {gameRoom.code}</Text>
          <RoleCard></RoleCard>
          <Text className="text-lg font-semibold mb-2">Host:</Text>
          <Pressable
            className="p-3 border-b border-gray-100 flex-row justify-between items-center"
            onPress={() => {
              setSelectedPlayer(gameRoom.players.find((p) => p.host)!);
              setModalVisible(true);
            }}
          >
            <Text className="text-base">{gameRoom.players.find((p) => p.host)!.name}</Text>
          </Pressable>
          <Text className="text-lg font-semibold mb-2">Players:</Text>
          <PlayerList setSelectedPlayer={setSelectedPlayer} setModalVisible={setModalVisible}></PlayerList>
          <View className="mt-6">
            <Button title="Leave Game" onPress={leaveGame} />
          </View>
          <PlayerModal modalVisible={modalVisible} onModalClose={onModalClose} selectedPlayer={selectedPlayer} notifyPlayer={notifyPlayer} toggleAlive={toggleAlive} messages={messages} sendMessage={sendMessage} messageInput={messageInput} setMessageInput={setMessageInput}></PlayerModal>
        </View>
      ) : (
        <Text>...Loading</Text>
      )}
    </View>
  );
}
