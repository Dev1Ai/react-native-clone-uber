import { useUser } from "@clerk/clerk-expo";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import JobRequestCard from "@/components/JobRequestCard";
import { images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { JobRequest } from "@/types/type";

const JobRequests = () => {
  const { user } = useUser();

  const {
    data: recentJobRequests,
    loading,
    error,
  } = useFetch<JobRequest[]>(`/(api)/job-request/${user?.id}`);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={recentJobRequests}
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
                  Failed to load job requests
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
            <Text className="text-2xl font-JakartaBold my-5">
              All JobRequests
            </Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default JobRequests;
