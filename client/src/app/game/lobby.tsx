import { useGameContext } from "@/hooks/useGameContext";
import { Button, Text, View } from "react-native";
import {
  LeaveRoomRequest,
  StartGameRequest,
  RequestEnum,
} from "@botc/shared";
import { useSocketContext } from "@/hooks/useSocketContext";
import RoleSelectionModal from "@/components/game/role-selection-modal";
import { useRoleSelectionModal } from "@/hooks/useRoleSelectionModal";
import { getNonHostPlayerCount } from "@/services/LobbyValidation";

export default function LobbyPage() {
  const { client } = useSocketContext();
  const { gameRoom, currentPlayer } = useGameContext();
  const { modalVisible, setModalVisible, validationResult, roleDistribution, toggleRole } = useRoleSelectionModal()

  const startGame = () => {
    if (!gameRoom) return;
    if (getNonHostPlayerCount(gameRoom.players) < 5) return;
    if (!validationResult.valid) return;
    const startGameRequest: StartGameRequest = {
      code: gameRoom.code,
      roleRequirements: roleDistribution,
      enabledRoleIds: gameRoom.scriptDetail.roles
        .filter((r) => !r.disabled)
        .map((r) => r.id),
    };
    client.send(RequestEnum.StartGame, startGameRequest);
  };

  const leaveLobby = () => {
    if (gameRoom && gameRoom.code) {
      const leaveRequest: LeaveRoomRequest = { code: gameRoom.code };
      client.send(RequestEnum.LeaveRoom, leaveRequest);
    }
  };

  return (
    <View className="flex justify-center items-center w-full h-full">
      {gameRoom && gameRoom.players && gameRoom.players.length > 0 ? (
        <View className="w-full px-4">
          <View className="mb-4">
            <Button title="View Roles" onPress={() => setModalVisible(true)} />
          </View>
          <Text className="text-xl font-bold mb-2">Lobby</Text>
          <Text className="text-base mb-1">
            Host: {gameRoom.players.find((p) => p.host)?.name}
          </Text>
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
                  disabled={
                    getNonHostPlayerCount(gameRoom.players) < 5 || !validationResult.valid
                  }
                />
                {getNonHostPlayerCount(gameRoom.players) >= 5 && !validationResult.valid && (
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
          <RoleSelectionModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            gameRoom={gameRoom}
            currentPlayer={currentPlayer}
            roleDistribution={roleDistribution}
            toggleRole={toggleRole}
          />
        </View>
      ) : (
        <Text>...Loading</Text>
      )}
    </View>
  );
}
