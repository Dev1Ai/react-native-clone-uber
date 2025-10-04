import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import JobRequestCard from "@/components/JobRequestCard";
import Map from "@/components/Map";
import { icons, images } from "@/constants";
import { useLocationStore } from "@/store";
import { Job } from "@/types/type";
import { ApiClient } from "@/lib/api";
import { useState } from "react";

const Home = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [recentJobRequests, setRecentJobRequests] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const handleSignOut = async () => {
    await ApiClient.signOut();
    router.replace("/(auth)/sign-in");
  };

  // Fetch user profile and jobs from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        console.log("📡 Fetching user profile from /auth/me...");
        const profile = await ApiClient.request("/auth/me");
        console.log("✅ User profile fetched:", profile);
        setUser(profile);

        // Fetch jobs
        console.log("📡 Fetching jobs from /jobs/mine...");
        const jobs = await ApiClient.getJobs();
        console.log("✅ Jobs fetched:", jobs);
        setRecentJobRequests(jobs);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error fetching data:", err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
          response: err.response,
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords?.latitude!,
          longitude: location.coords?.longitude!,
        });

        setUserLocation({
          latitude: location.coords?.latitude,
          longitude: location.coords?.longitude,
          address: `${address[0].name}, ${address[0].region}`,
        });
      } catch (err: any) {
        console.error('Geocoding error:', err.message);
        // Set location without address if geocoding fails
        setUserLocation({
          latitude: location.coords?.latitude,
          longitude: location.coords?.longitude,
          address: 'Location unavailable',
        });
      }
    })();
  }, [setUserLocation]);

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);

    router.push("/(root)/find-job-request");
  };

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={recentJobRequests?.slice(0, 5)}
        renderItem={({ item }) => <JobRequestCard jobRequest={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              error ? (
                <Text className="text-sm text-red-500">
                  Failed to load recent job requests
                </Text>
              ) : (
                <>
                  <Image
                    source={images.noResult}
                    className="w-40 h-40"
                    alt="No recent job requests found"
                    resizeMode="contain"
                  />
                  <Text className="text-sm">No recent job requests found</Text>
                </>
              )
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-JakartaExtraBold">
                Welcome {user?.name?.split(" ")[0] || ""}👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Your current location
              </Text>
              <View className="w-full h-[300px]">
                <Map />
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent JobRequests
            </Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default Home;
