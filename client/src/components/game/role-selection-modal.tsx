import { Modal, View, Text, FlatList, Pressable, Button } from "react-native";
import { GameRoom, Player, Role } from "@botc/shared";
import { getNonHostPlayerCount } from "@/services/LobbyValidation";

interface RoleSelectionModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  gameRoom: GameRoom;
  currentPlayer?: Player;
  roleDistribution: { [key: string]: number };
  toggleRole: (roleId: string) => void;
}

export default function RoleSelectionModal({
  modalVisible,
  setModalVisible,
  gameRoom,
  currentPlayer,
  roleDistribution,
  toggleRole,
}: RoleSelectionModalProps) {
  return <Modal
    animationType="slide"
    visible={modalVisible}
    presentationStyle="pageSheet"
  >
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold mb-2">
          {gameRoom.scriptDetail.meta.name}
        </Text>
        <Text className="text-gray-600 mb-3">
          {
            gameRoom.scriptDetail.roles.filter((r) => !r.disabled)
              .length
          }{" "}
          Roles Enabled
        </Text>
        {getNonHostPlayerCount(gameRoom.players) >= 5 ? (
          <View className="mb-3">
            {Object.entries(roleDistribution).map(
              ([team, required]) => {
                const enabledCount = gameRoom.scriptDetail.roles.filter(
                  (role) => !role.disabled && role.team === team,
                ).length;
                const isSufficient = enabledCount >= required;

                return (
                  <Text
                    key={team}
                    className={
                      isSufficient ? "text-gray-600" : "text-red-600"
                    }
                  >
                    {team.charAt(0).toUpperCase() + team.slice(1)}:{" "}
                    {required}
                    {!isSufficient && " ✘"}
                  </Text>
                );
              },
            )}
          </View>
        ) : (
          <Text className="text-red-600">
            Need 5 players (excluding Storyteller)
          </Text>
        )}
        <Button title="Close" onPress={() => setModalVisible(false)} />
      </View>

      <FlatList
        data={gameRoom.scriptDetail.roles}
        renderItem={({ item }: { item: Role }) => (
          <Pressable
            disabled={!currentPlayer?.host}
            onPress={() => toggleRole(item.id)}
          >
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold">
                  {item.name + " "}
                  {currentPlayer?.host && item.disabled ? "✘" : "✔"}
                </Text>
                <Text className="text-sm text-gray-600 capitalize">
                  {item.team}
                </Text>
              </View>
              <Text className="text-sm text-gray-700">
                {item.ability}
              </Text>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-4"
      />
    </View>
  </Modal>
}
