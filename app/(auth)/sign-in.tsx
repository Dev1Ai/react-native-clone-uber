import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Button } from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const mockLogin = async () => {
    // TODO: Replace with call to NestJS backend (NextAuth or JWT)
    console.log("🔐 Mock login success");
    router.replace("/(tabs)/home");
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sign In (ServiceLink Auth Placeholder)</Text>
      <Button title="Continue" onPress={mockLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, marginBottom: 20 },
});
