import { useGameContext } from "@/hooks/useGameContext";
import { Button, FlatList, Modal, Pressable, Text, View } from "react-native";
import { LeaveRoomRequest, Role, StartGameRequest } from "../../../../shared/types/game";
import { SocketEvent } from "../../../../shared/types/events";
import { useSocketContext } from "@/hooks/useSocketContext";
import { useEffect, useState } from "react";
import { calculateRoleDistribution, validateRoleSelection } from "@/services/LobbyValidation";

export default function LobbyPage() {
  const { client } = useSocketContext();
  const { gameRoom, setGameRoom, currentPlayer } = useGameContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [roleDistribution, setRoleDistribution] = useState(
    calculateRoleDistribution(gameRoom ? gameRoom.players.filter((p) => !p.host).length : 0),
  );
  const [validationResult, setValidationResult] = useState({ valid: true, errors: [] as string[] });

  const getNonHostPlayerCount = () => {
    if (!gameRoom) return 0;
    return gameRoom.players.filter((p) => !p.host).length;
  };

  useEffect(() => {
    const nonHostCount = getNonHostPlayerCount();
    if (nonHostCount < 5 || !gameRoom) return;

    const distribution = calculateRoleDistribution(nonHostCount);
    setRoleDistribution(distribution);

    const validation = validateRoleSelection(gameRoom.scriptDetail.roles, distribution);
    setValidationResult(validation);
  }, [gameRoom?.players, gameRoom?.scriptDetail.roles]);

  const startGame = () => {
    if (!gameRoom) return;
    if (getNonHostPlayerCount() < 5) return;
    if (!validationResult.valid) return;
    const startGameRequest: StartGameRequest = {
      code: gameRoom.code,
      roleRequirements: roleDistribution,
      enabledRoleIds: gameRoom.scriptDetail.roles.filter((r) => !r.disabled).map((r) => r.id),
    };
    client.send(SocketEvent.StartGame, startGameRequest);
  };

  const leaveLobby = () => {
    if (gameRoom && gameRoom.code) {
      const leaveRequest: LeaveRoomRequest = { code: gameRoom.code };
      client.send(SocketEvent.LeaveRoom, leaveRequest);
    }
  };

  const toggleRole = (roleId: string) => {
    if (!gameRoom) return;

    const updatedRoles = gameRoom.scriptDetail.roles.map((role) =>
      role.id === roleId ? { ...role, disabled: !role.disabled } : role,
    );

    setGameRoom({
      ...gameRoom,
      scriptDetail: {
        ...gameRoom.scriptDetail,
        roles: updatedRoles,
      },
    });
  };
  return (
    <View className="flex justify-center items-center w-full h-full">
      {gameRoom && gameRoom.players && gameRoom.players.length > 0 ? (
        <View className="w-full px-4">
          <View className="mb-4">
            <Button title="View Roles" onPress={() => setModalVisible(true)} />
          </View>
          <Text className="text-xl font-bold mb-2">Lobby</Text>
          <Text className="text-base mb-1">Host: {gameRoom.players.find((p) => p.host)?.name}</Text>
          <Text className="text-base mb-4">Game Code: {gameRoom.code}</Text>

          <Text className="text-lg font-semibold mb-2">Players:</Text>
          {gameRoom.players.length > 0 ? (
            gameRoom.players.map(
              (p) =>
                !p.host && (
                  <Text key={p.socketId} className="text-base ml-2 mb-1">
                    • {p.name}
                  </Text>
                ),
            )
          ) : (
            <Text className="text-gray-500">Lobby is empty</Text>
          )}

          <View className="mt-6 gap-2">
            {currentPlayer?.host && (
              <>
                <Button
                  title="Start Game"
                  onPress={startGame}
                  disabled={getNonHostPlayerCount() < 5 || !validationResult.valid}
                />
                {getNonHostPlayerCount() >= 5 && !validationResult.valid && (
                  <View className="mt-2">
                    {validationResult.errors.map((error, idx) => (
                      <Text key={idx} className="text-red-600 text-sm">
                        • {error}
                      </Text>
                    ))}
                  </View>
                )}
              </>
            )}
            <Button title="Leave Lobby" onPress={leaveLobby} />
          </View>

          <Modal animationType="slide" visible={modalVisible} presentationStyle="pageSheet">
            <View className="flex-1 bg-white">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-2xl font-bold mb-2">{gameRoom.scriptDetail.meta.name}</Text>
                <Text className="text-gray-600 mb-3">
                  {gameRoom.scriptDetail.roles.filter((r) => !r.disabled).length} Roles Enabled
                </Text>
                {getNonHostPlayerCount() >= 5 ? (
                  <View className="mb-3">
                    {Object.entries(roleDistribution).map(([team, required]) => {
                      const enabledCount = gameRoom.scriptDetail.roles.filter(
                        (role) => !role.disabled && role.team === team,
                      ).length;
                      const isSufficient = enabledCount >= required;

                      return (
                        <Text
                          key={team}
                          className={isSufficient ? "text-gray-600" : "text-red-600"}
                        >
                          {team.charAt(0).toUpperCase() + team.slice(1)}: {required}
                          {!isSufficient && " ✘"}
                        </Text>
                      );
                    })}
                  </View>
                ) : (
                  <Text className="text-red-600">Need 5 players (excluding Storyteller)</Text>
                )}
                <Button title="Close" onPress={() => setModalVisible(false)} />
              </View>

              <FlatList
                data={gameRoom.scriptDetail.roles}
                renderItem={({ item }: { item: Role }) => (
                  <Pressable disabled={!currentPlayer?.host} onPress={() => toggleRole(item.id)}>
                    <View className="p-4 border-b border-gray-100">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-semibold">
                          {item.name + " "}
                          {currentPlayer?.host && item.disabled ? "✘" : "✔"}
                        </Text>
                        <Text className="text-sm text-gray-600 capitalize">{item.team}</Text>
                      </View>
                      <Text className="text-sm text-gray-700">{item.ability}</Text>
                    </View>
                  </Pressable>
                )}
                keyExtractor={(item) => item.id}
                contentContainerClassName="pb-4"
              />
            </View>
          </Modal>
        </View>
      ) : (
        <Text>...Loading</Text>
      )}
    </View>
  );
}
