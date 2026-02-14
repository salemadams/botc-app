import { calculateRoleDistribution, getNonHostPlayerCount, validateRoleSelection } from "@/services/LobbyValidation";
import { useEffect, useState } from "react";
import { useGameContext } from "./useGameContext";

export function useRoleSelectionModal() {

  const { gameRoom, setGameRoom } = useGameContext()
  const [modalVisible, setModalVisible] = useState(false);
  const [validationResult, setValidationResult] = useState({
    valid: true,
    errors: [] as string[],
  });
  const [roleDistribution, setRoleDistribution] = useState(
    calculateRoleDistribution(
      gameRoom ? getNonHostPlayerCount(gameRoom.players) : 0,
    ),
  );

  useEffect(() => {
    if (!gameRoom) return;
    const nonHostCount = getNonHostPlayerCount(gameRoom.players);
    if (nonHostCount < 5) return;

    const distribution = calculateRoleDistribution(nonHostCount);
    setRoleDistribution(distribution);

    const validation = validateRoleSelection(
      gameRoom.scriptDetail.roles,
      distribution,
    );
    setValidationResult(validation);
  }, [gameRoom?.players, gameRoom?.scriptDetail.roles]);

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
  return { modalVisible, setModalVisible, validationResult, setValidationResult, roleDistribution, setRoleDistribution, toggleRole }
}
