import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href="./host" asChild>
        <Pressable>
          <Text>Host</Text>
        </Pressable>
      </Link>

      <Link href="./join" asChild>
        <Pressable>
          <Text>Join</Text>
        </Pressable>
      </Link>
    </View>
  );
}
