import { router } from "expo-router";
import { FlatList, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import JobRequestLayout from "@/components/JobRequestLayout";
import { useDriverStore } from "@/store";

const ConfirmJobRequest = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();

  return (
    <JobRequestLayout title={"Choose a Provider"} snapPoints={["65%", "85%"]}>
      <FlatList
        data={drivers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(item.id!)}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Select Provider"
              onPress={() => router.push("/(root)/book-job-request")}
            />
          </View>
        )}
      />
    </JobRequestLayout>
  );
};

export default ConfirmJobRequest;
