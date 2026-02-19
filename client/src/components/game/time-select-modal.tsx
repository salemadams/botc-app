import { Picker } from "@react-native-picker/picker";
import { Modal, Pressable, View, Text } from "react-native";

interface TimeSelectModalProps {
  modalVisible: boolean
  onClose: () => void
  value: number
  setValue: (value: number) => void
  forMinutes: boolean
}

export default function TimeSelectModal({ modalVisible, onClose, value, setValue, forMinutes }: TimeSelectModalProps) {
  return <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
  >
    <Pressable className="flex-1" onPress={onClose} />
    <View className="bg-white rounded-t-2xl">
      <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
        <Text className="text-xl font-bold">
          {forMinutes ? "Minutes" : "Seconds"}
        </Text>
        <Pressable onPress={onClose}>
          <Text className="text-lg">✕</Text>
        </Pressable>
      </View>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => setValue(itemValue)}
        itemStyle={{ color: 'black' }}
      >
        {Array.from({ length: 60 }, (_, i) => (
          <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} />
        ))}
      </Picker>
    </View>
  </Modal>
}
