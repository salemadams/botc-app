import { View, Text, Button, Modal, Pressable, FlatList, TextInput, KeyboardAvoidingView, ScrollView } from "react-native";
import { router } from "expo-router";
import { useGameContext } from "@/hooks/useGameContext";
import { useSocketContext } from "@/hooks/useSocketContext";
import {
  LeaveRoomRequest,
  Message,
  NotifyPlayerRequest,
  Player,
  RequestEnum,
  SendMessageRequest,
  ToggleAliveRequest,
} from "@botc/shared";
import { useState } from "react";

export default function SessionPage() {
  const { gameRoom, currentPlayer, messages, addMessage } = useGameContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [messageInput, setMessageInput] = useState('')
  const { client } = useSocketContext();

  const leaveGame = () => {
    if (gameRoom && gameRoom.code) {
      const leaveRequest: LeaveRoomRequest = { code: gameRoom.code };
      client.send(RequestEnum.LeaveRoom, leaveRequest);
      router.navigate("/home");
    }
  };
  const notifyPlayer = (socketId: string) => {
    const notifyRequest: NotifyPlayerRequest = { socketId: socketId };
    client.send(RequestEnum.NotifyPlayer, notifyRequest);
  };
  const onModalClose = () => {
    setModalVisible(false)
    setMessageInput('')
  }
  const sendMessage = () => {
    if (!messageInput || !selectedPlayer || !currentPlayer || !gameRoom) return;
    const sendMessageRequest: SendMessageRequest = { fromSocket: currentPlayer.socketId, toSocket: selectedPlayer.socketId, message: messageInput }
    client.send(RequestEnum.SendMessage, sendMessageRequest)
    const message: Message = { message: messageInput, fromSelf: true }
    addMessage(selectedPlayer.socketId, message)
  }
  const toggleAlive = (sockedId: string) => {
    if (gameRoom && gameRoom.code) {
      const toggleAliveRequest: ToggleAliveRequest = { socketId: sockedId, code: gameRoom.code };
      client.send(RequestEnum.ToggleAlive, toggleAliveRequest)
      setSelectedPlayer((prevPlayer: Player | null) => {
        if (!prevPlayer) {
          return prevPlayer
        }
        return { ...prevPlayer, alive: !prevPlayer.alive }
      })
    }
  }

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
            transparent={true}
            visible={modalVisible}
          >
            <KeyboardAvoidingView className="flex-1" behavior="padding">
              <Pressable className="flex-1" onPress={() => onModalClose()} />
              <View className="bg-white rounded-t-2xl">
                <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
                  <Text className="text-xl font-bold">
                    {selectedPlayer?.name ?? "Player Details"}
                  </Text>
                  <Pressable onPress={() => onModalClose()}>
                    <Text className="text-lg">✕</Text>
                  </Pressable>
                </View>
                {selectedPlayer && (
                  <View className="p-4">
                    {currentPlayer?.host && selectedPlayer.role && (
                      <>
                        <Text className="text-base mb-2">
                          Role: {selectedPlayer.role.name}
                        </Text>
                        <Text className="text-sm text-gray-600 capitalize">
                          Team: {selectedPlayer.role.team}
                        </Text>
                        {currentPlayer?.host && (
                          <View className="flex flex-row gap-2 mt-4">
                            <Pressable
                              className="bg-blue-500 px-4 py-2 rounded-lg self-start"
                              onPress={() =>
                                notifyPlayer(selectedPlayer.socketId)
                              }
                            >
                              <Text className="text-white font-medium">
                                Notify
                              </Text>
                            </Pressable>
                            <Pressable
                              className="bg-blue-500 px-4 py-2 rounded-lg self-start"
                              onPress={() => toggleAlive(selectedPlayer.socketId)}
                            >
                              <Text className="text-white font-medium">
                                {selectedPlayer.alive ? 'Kill' : 'Revive'}
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </>
                    )}
                    {messages[selectedPlayer.socketId] && messages[selectedPlayer.socketId].length > 0 && (
                      <ScrollView className="max-h-48 mt-4 border border-gray-300 rounded-lg p-3" contentContainerClassName="gap-2">
                        {messages[selectedPlayer.socketId].map((msg, index) => (
                          <View
                            key={index}
                            className={`max-w-[75%] px-3 py-2 rounded-xl ${msg.fromSelf
                              ? "self-end bg-blue-500"
                              : "self-start bg-gray-200"
                              }`}
                          >
                            <Text className={msg.fromSelf ? "text-white" : "text-black"}>
                              {msg.message}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                    <View className="flex-row gap-2 mt-4 mb-6">
                      <TextInput className='flex-1 h-10 border border-gray-300 rounded-lg px-4 text-base' value={messageInput} onChangeText={setMessageInput} />
                      <Pressable onPress={sendMessage} className="bg-blue-500 h-10 px-4 rounded-lg justify-center">
                        <Text className="text-white font-medium">Send</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      ) : (
        <Text>...Loading</Text>
      )}
    </View>
  );
}
