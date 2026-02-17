import { HostReminderInfo, NotifyPlayerRequest, RequestEnum } from "@botc/shared";
import { Modal, View, Text, FlatList, Pressable } from "react-native";
import { useSocketContext } from "@/hooks/useSocketContext";
import { useGameContext } from "@/hooks/useGameContext";

interface HostListModalProps {
  modalVisible: boolean
  onClose: () => void
  reminderInfo: HostReminderInfo[]
}

export default function HostListModal({ modalVisible, onClose, reminderInfo }: HostListModalProps) {
  const { client } = useSocketContext();
  const { day } = useGameContext()

  const filterReminders = () => {
    return reminderInfo.filter((r) => day === 1 ? r.firstNight : !r.firstNight)
  }
  const notifyPlayer = (socketId: string) => {
    const notifyRequest: NotifyPlayerRequest = { socketId: socketId };
    client.send(RequestEnum.NotifyPlayer, notifyRequest);
  };

  return <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
    onRequestClose={onClose}
  >
    <Pressable className="flex-1" onPress={onClose} />
    <View className="bg-white rounded-t-2xl max-h-[75%]">
      <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
        <Text className="text-xl font-bold">Night Reminders</Text>
        <Pressable onPress={onClose}>
          <Text className="text-lg">✕</Text>
        </Pressable>
      </View>
      <FlatList
        data={filterReminders()}
        renderItem={({ item }: { item: HostReminderInfo }) => (
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-lg font-semibold">
                {item.roleName}
              </Text>
              <Text className="text-xs text-gray-500">
                {item.playerName}
              </Text>
            </View>
            <Text className="text-sm text-gray-700 mb-2">
              {item.details}
            </Text>
            <Pressable
              className="bg-blue-500 px-4 py-2 rounded-lg self-start"
              onPress={() => notifyPlayer(item.socketId)}
            >
              <Text className="text-white font-medium">Notify</Text>
            </Pressable>
          </View>
        )}
        keyExtractor={(item) => `${item.socketId}-${item.firstNight}`}
        contentContainerClassName="pb-4"
      />
    </View>
  </Modal>;
}

