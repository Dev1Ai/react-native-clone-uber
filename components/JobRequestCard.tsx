import { Image, Text, View } from "react-native";

import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Job, JobRequest } from "@/types/type";

// Type guard to check if item is a Job (from API) vs JobRequest (legacy)
function isJob(item: Job | JobRequest): item is Job {
  return "key" in item && "title" in item;
}

const JobRequestCard = ({ jobRequest }: { jobRequest: Job | JobRequest }) => {
  // Handle new Job type from API
  if (isJob(jobRequest)) {
    const job = jobRequest;
    return (
      <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
        <View className="flex flex-col items-start justify-center p-3 w-full">
          <View className="flex flex-row items-center justify-between w-full mb-3">
            <View className="flex flex-col flex-1">
              <Text className="text-lg font-JakartaBold" numberOfLines={1}>
                {job.title}
              </Text>
              <Text
                className="text-sm font-JakartaMedium text-gray-500 mt-1"
                numberOfLines={2}
              >
                {job.description}
              </Text>
            </View>
          </View>

          <View className="flex flex-col w-full bg-general-500 rounded-lg p-3 items-start justify-center">
            <View className="flex flex-row items-center w-full justify-between mb-3">
              <Text className="text-md font-JakartaMedium text-gray-500">
                Date Created
              </Text>
              <Text className="text-md font-JakartaBold" numberOfLines={1}>
                {formatDate(job.createdAt)}
              </Text>
            </View>

            {job.assignment && (
              <>
                <View className="flex flex-row items-center w-full justify-between mb-3">
                  <Text className="text-md font-JakartaMedium text-gray-500">
                    Provider
                  </Text>
                  <Text className="text-md font-JakartaBold">
                    {job.assignment.provider.user.name}
                  </Text>
                </View>

                <View className="flex flex-row items-center w-full justify-between mb-3">
                  <Text className="text-md font-JakartaMedium text-gray-500">
                    Status
                  </Text>
                  <Text className="text-md capitalize font-JakartaBold text-blue-500">
                    {job.assignment.status.replace(/_/g, " ")}
                  </Text>
                </View>

                {job.assignment.scheduledStart && (
                  <View className="flex flex-row items-center w-full justify-between">
                    <Text className="text-md font-JakartaMedium text-gray-500">
                      Scheduled
                    </Text>
                    <Text className="text-md font-JakartaBold">
                      {formatDate(job.assignment.scheduledStart)}
                    </Text>
                  </View>
                )}
              </>
            )}

            {!job.assignment && (
              <View className="flex flex-row items-center w-full justify-between">
                <Text className="text-md font-JakartaMedium text-gray-500">
                  Status
                </Text>
                <Text className="text-md capitalize font-JakartaBold text-orange-500">
                  Pending Quotes
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Legacy JobRequest rendering
  return (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${jobRequest.destination_longitude},${jobRequest.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[80px] h-[90px] rounded-lg"
          />

          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {jobRequest.origin_address}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {jobRequest.destination_address}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center">
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Date & Time
            </Text>
            <Text className="text-md font-JakartaBold" numberOfLines={1}>
              {formatDate(jobRequest.created_at)},{" "}
              {formatTime(jobRequest.ride_time)}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Provider
            </Text>
            <Text className="text-md font-JakartaBold">
              {jobRequest.driver.first_name} {jobRequest.driver.last_name}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Car Seats
            </Text>
            <Text className="text-md font-JakartaBold">
              {jobRequest.driver.car_seats}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Payment Status
            </Text>
            <Text
              className={`text-md capitalize font-JakartaBold ${jobRequest.payment_status === "paid" ? "text-green-500" : "text-red-500"}`}
            >
              {jobRequest.payment_status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default JobRequestCard;
