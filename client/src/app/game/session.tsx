import { View, Text, Button, Pressable, FlatList, } from "react-native";
import { router } from "expo-router";
import { useGameContext } from "@/hooks/useGameContext";
import { useSocketContext } from "@/hooks/useSocketContext";
import {
  LeaveRoomRequest,
  Player,
  RequestEnum,
} from "@botc/shared";
import { usePlayerModal } from "@/hooks/usePlayerModal";
import PlayerModal from "@/components/game/player-modal";

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

          {currentPlayer.role && (
            <View className="mb-6 p-4 bg-gray-100 rounded-lg">
              <Text className="text-lg font-semibold mb-1">Your Role</Text>
              <Text className="text-2xl font-bold">
                {currentPlayer.role.name}
              </Text>
              <Text className="text-sm text-gray-600 capitalize">
                {currentPlayer.role.team}
              </Text>
              {currentPlayer.role.ability && (
                <Text className="text-sm text-gray-700 mt-2">
                  {currentPlayer.role.ability}
                </Text>
              )}
            </View>
          )}

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

          <FlatList
            data={gameRoom.players}
            renderItem={({ item }: { item: Player }) =>
              !item.host ? (
                <Pressable
                  className="p-3 border-b border-gray-100 flex-row justify-between items-center"
                  onPress={() => {
                    setSelectedPlayer(item);
                    setModalVisible(true);
                  }}
                >
                  <Text className={`${!item.alive && 'text-red-500'} text-base`}>{item.name}</Text>
                  {currentPlayer?.host && (
                    <Text className="text-sm text-gray-600">
                      {item.role?.name}
                    </Text>
                  )}
                </Pressable>
              ) : null
            }
            keyExtractor={(item) => item.socketId}
            contentContainerClassName="pb-4"
          />

          <View className="mt-6">
            <Button title="Leave Game" onPress={leaveGame} />
          </View>
          <PlayerModal modalVisible={modalVisible} onModalClose={onModalClose} selectedPlayer={selectedPlayer} currentPlayer={currentPlayer} notifyPlayer={notifyPlayer} toggleAlive={toggleAlive} messages={messages} sendMessage={sendMessage} messageInput={messageInput} setMessageInput={setMessageInput}></PlayerModal>
        </View>
      ) : (
        <Text>...Loading</Text>
      )}
    </View>
  );
}
