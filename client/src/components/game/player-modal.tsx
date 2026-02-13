import { KeyboardAvoidingView, Modal, Pressable, View, Text, ScrollView, TextInput } from "react-native";
import { Message, Player } from "@botc/shared";

interface PlayerModalProps {
  modalVisible: boolean;
  onModalClose: () => void;
  selectedPlayer: Player | null;
  currentPlayer: Player;
  notifyPlayer: (socketId: string) => void;
  toggleAlive: (socketId: string) => void;
  messages: Record<string, Message[]>;
  sendMessage: () => void;
  messageInput: string;
  setMessageInput: (value: string) => void;
}

export default function PlayerModal({ modalVisible, onModalClose, selectedPlayer, currentPlayer, notifyPlayer, toggleAlive, messages, sendMessage, messageInput, setMessageInput }: PlayerModalProps) {
  return <Modal
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
}
