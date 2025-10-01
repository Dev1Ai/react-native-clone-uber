import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="find-job-request" options={{ headerShown: false }} />
      <Stack.Screen
        name="confirm-job-request"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="book-job-request"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default Layout;
