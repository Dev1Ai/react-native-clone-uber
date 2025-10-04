import { Redirect } from "expo-router";

const Page = () => {
  // Redirect to sign-in screen by default
  return <Redirect href="/(auth)/sign-in" />;
};

export default Page;
