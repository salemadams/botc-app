import { useSocketContext } from "@/hooks/useSocketContext";
import { SelectList } from "react-native-dropdown-select-list";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { CreateRoomRequest, RoomCreatedEvent, ScriptListItem, RequestEnum, EventEnum } from "@botc/shared";
import { useGameContext } from "@/hooks/useGameContext";
import { router } from "expo-router";
import API from "../../config/api";

export default function HomePage() {
  const [modalVisible, setModalVisible] = useState(false);
  const { client, userName } = useSocketContext();
  const { setGameRoom, setCurrentPlayer } = useGameContext();
  const [scripts, setScripts] = useState<ScriptListItem[]>([]);
  const [selectedScript, setSelectedScript] = useState<ScriptListItem>();

  useEffect(() => {
    fetch(`${API.apiUrl}/api/script`)
      .then((res) => res.json())
      .then((data: ScriptListItem[]) => {
        setScripts(data);
        setSelectedScript(data[0]);
      })
      .catch((err: any) => console.log(err));
    client.subscribe(EventEnum.RoomCreated, (event: RoomCreatedEvent) => {
      setModalVisible(false);
      router.navigate("./game/lobby");
      setGameRoom(event.room);
      // always set to first player (host player)
      setCurrentPlayer(event.room.players[0]);
    });
  }, []);
  const handleHostPress = () => {
    if (!selectedScript) return;
    setModalVisible(true);
    const createRequest: CreateRoomRequest = { name: userName, scriptId: selectedScript.scriptId };
    client.send(RequestEnum.CreateRoom, createRequest);
  };
  const handleScriptSelect = (scriptId: string) => {
    const script = scripts.find((s) => s.scriptId === scriptId);
    if (script) {
      setSelectedScript(script);
    }
  };

  return (
    <View className="flex gap-10 w-full h-full justify-center items-center">
      {scripts && selectedScript && (
        <SelectList
          setSelected={handleScriptSelect}
          data={scripts.map((script) => ({
            key: script.scriptId,
            value: script.scriptName,
          }))}
          defaultOption={{ key: selectedScript.scriptId, value: selectedScript.scriptName }}
          save="key"
        />
      )}
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
