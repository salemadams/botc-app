import { useSocketContext } from "@/hooks/useSocketContext";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { CreateRoomRequest, RoomCreatedEvent } from "../../../../shared/types/game";
import { SocketEvent } from "../../../../shared/types/events";
import { useGameContext } from "@/hooks/useGameContext";
import { router } from "expo-router";

export default function HomePage() {
  const [modalVisible, setModalVisible] = useState(false);
  const { client, userName } = useSocketContext();
  const { setGameRoom, setCurrentPlayer } = useGameContext();
  useEffect(() => {
    client.subscribe(SocketEvent.RoomCreated, (event: RoomCreatedEvent) => {
      setModalVisible(false);
      router.navigate("./game/lobby");
      setGameRoom({
        code: event.room.code,
        players: event.room.players,
        phase: event.room.phase,
      });
      // always set to first player (host player)
      setCurrentPlayer(event.room.players[0]);
    });
  }, []);
  const handleHostPress = () => {
    setModalVisible(true);
    const createRequest: CreateRoomRequest = { name: userName };
    client.send(SocketEvent.CreateRoom, createRequest);
  };
  return (
    <View className="flex gap-10 w-full h-full justify-center items-center">
      <Text className="font-semibold text-2xl">Blood on the Clocktower</Text>
      <Pressable onPress={handleHostPress}>
        <Text>Host</Text>
      </Pressable>
      <Link href="./join" asChild>
        <Pressable>
          <Text>Join</Text>
        </Pressable>
      </Link>
      <Modal visible={modalVisible} transparent={true}>
        <View className="flex items-center pt-28 w-full h-full">
          <View className="border-1 rounded-lg">
            <Text>...Loading</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
