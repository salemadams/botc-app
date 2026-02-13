import { useGameContext } from "@/hooks/useGameContext";
import { Player } from "@botc/shared";
import { FlatList, Pressable, Text } from "react-native";

interface PlayerListProps {
  setSelectedPlayer: (player: Player) => void;
  setModalVisible: (visible: boolean) => void;
}

export default function PlayerList({ setSelectedPlayer, setModalVisible }: PlayerListProps) {
  const { gameRoom, currentPlayer } = useGameContext()
  return <FlatList
    data={gameRoom!.players}
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
}
