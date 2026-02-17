import { Message, NotifyPlayerRequest, Player, RequestEnum, SendMessageRequest, ToggleAliveRequest } from "@botc/shared";
import { useState } from "react";
import { useGameContext } from "./useGameContext";
import { useSocketContext } from "./useSocketContext";

export function usePlayerModal() {
  const { gameRoom, currentPlayer, addMessage } = useGameContext();
  const { client } = useSocketContext()
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [messageInput, setMessageInput] = useState('')

  const notifyPlayer = (socketId: string) => {
    const notifyRequest: NotifyPlayerRequest = { socketId: socketId };
    client.send(RequestEnum.NotifyPlayer, notifyRequest);
  };
  const onModalClose = () => {
    setPlayerModalVisible(false)
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
  return { onModalClose, sendMessage, toggleAlive, notifyPlayer, selectedPlayer, setSelectedPlayer, playerModalVisible, setPlayerModalVisible, messageInput, setMessageInput }
}
