import { View, Text, Button, Modal, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { useGameContext } from "@/hooks/useGameContext";
import { useSocketContext } from "@/hooks/useSocketContext";
import {
  LeaveRoomRequest,
  NotifyPlayerRequest,
  Player,
} from "../../../../shared/types/game";
import { SocketEvent } from "../../../../shared/types/events";
import { useState } from "react";

export default function SessionPage() {
  const { gameRoom, currentPlayer } = useGameContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const { client } = useSocketContext();

  const leaveGame = () => {
    if (gameRoom && gameRoom.code) {
      const leaveRequest: LeaveRoomRequest = { code: gameRoom.code };
      client.send(SocketEvent.LeaveRoom, leaveRequest);
      router.navigate("/home");
    }
  };
  const notifyPlayer = (socketId: string) => {
    const notifyRequest: NotifyPlayerRequest = { socketId: socketId };
    client.send(SocketEvent.NotifyPlayer, notifyRequest);
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
                  <Text className="text-base">{item.name}</Text>
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

          <Modal
            animationType="slide"
            visible={modalVisible}
            presentationStyle="pageSheet"
          >
            <View className="flex-1 bg-white">
              <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
                <Text className="text-xl font-bold">
                  {selectedPlayer?.name ?? "Player Details"}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Text className="text-lg">✕</Text>
                </Pressable>
              </View>
              {selectedPlayer && (
                <View className="p-4">
                  <Text className="text-base mb-2">
                    Name: {selectedPlayer.name}
                  </Text>
                  {currentPlayer?.host && selectedPlayer.role && (
                    <>
                      <Text className="text-base mb-2">
                        Role: {selectedPlayer.role.name}
                      </Text>
                      <Text className="text-sm text-gray-600 capitalize">
                        Team: {selectedPlayer.role.team}
                      </Text>
                      {currentPlayer?.host && (
                        <View className="mt-4">
                          <Pressable
                            className="bg-blue-500 px-4 py-2 rounded-lg self-start"
                            onPress={() =>
                              notifyPlayer(selectedPlayer.socketId)
                            }
                          >
                            <Text className="text-white font-medium">Notify</Text>
                          </Pressable>
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          </Modal>
        </View>
      ) : (
        <Text>...Loading</Text>
      )}
    </View>
  );
}
