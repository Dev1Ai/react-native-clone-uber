import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";


import { icons } from "@/constants";
import { ApiClient } from "@/lib/api";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Provider, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  // Fetch nearby providers from backend
  useEffect(() => {
    const fetchProviders = async () => {
      if (!userLatitude || !userLongitude) return;

      try {
        setLoading(true);
        const response = await ApiClient.request<{ items: Provider[] }>(
          `/providers/near?lat=${userLatitude}&lng=${userLongitude}&radiusKm=25&onlineOnly=true`
        );
        setProviders(response.items || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching providers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [userLatitude, userLongitude]);

  // Generate markers from providers
  useEffect(() => {
    if (providers.length > 0 && userLatitude && userLongitude) {
      const newMarkers = generateMarkersFromData({
        data: providers,
        userLatitude,
        userLongitude,
      });
      setMarkers(newMarkers);
    }
  }, [providers, userLatitude, userLongitude]);

  // Disabled markers generation since we're not fetching drivers
  // useEffect(() => {
  //   if (Array.isArray(drivers) && drivers.length > 0) {
  //     if (!userLatitude || !userLongitude) return;
  //
  //     const newMarkers = generateMarkersFromData({
  //       data: drivers,
  //       userLatitude,
  //       userLongitude,
  //     });
  //
  //     setMarkers(newMarkers);
  //   }
  // }, [drivers, userLatitude, userLongitude]);

  // Disabled driver times calculation since we're not fetching drivers
  // useEffect(() => {
  //   let isMounted = true;
  //   if (
  //     markers.length > 0 &&
  //     destinationLatitude !== undefined &&
  //     destinationLongitude !== undefined
  //   ) {
  //     calculateDriverTimes({
  //       markers,
  //       userLatitude,
  //       userLongitude,
  //       destinationLatitude,
  //       destinationLongitude,
  //     }).then((drivers) => {
  //       if (isMounted) {
  //         setDrivers(drivers as MarkerData[]);
  //       }
  //     });
  //   }
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [
  //   markers,
  //   destinationLatitude,
  //   destinationLongitude,
  //   setDrivers,
  //   userLatitude,
  //   userLongitude,
  // ]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ width: '100%', height: '100%', borderRadius: 16 }}
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      region={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {markers.map((marker, index) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />
          <MapViewDirections
            origin={{
              latitude: userLatitude!,
              longitude: userLongitude!,
            }}
            destination={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            apikey={directionsAPI!}
            strokeColor="#0286FF"
            strokeWidth={2}
          />
        </>
      )}
    </MapView>
  );
};

export default Map;
