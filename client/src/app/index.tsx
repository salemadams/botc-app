import { useSocketContext } from "@/hooks/useSocketContext";
import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function Index() {
  const { setUsername } = useSocketContext();
  const [nameInput, setNameInput] = useState("");
  const handleNameSubmit = () => {
    if (nameInput.length === 0) return;
    setUsername(nameInput);
    router.navigate("./home");
  };
  return (
    <View className="flex justify-center items-center w-full h-full">
      <Text>Enter Your Name:</Text>
      <TextInput
        className="w-2/4 h-10 border border-gray-300 rounded-lg px-4 text-base"
        value={nameInput}
        onChangeText={(name) => setNameInput(name)}
      ></TextInput>
      <Button title="Submit" onPress={handleNameSubmit}></Button>
    </View>
  );
}
