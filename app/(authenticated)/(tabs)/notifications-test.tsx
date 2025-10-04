import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../../../lib/notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationsTestScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [registeredWithAPI, setRegisteredWithAPI] = useState(false);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for notifications
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const registerWithAPI = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }

    try {
      // TODO: Replace with your actual API endpoint and auth token
      const API_BASE = 'http://localhost:3001'; // Replace with your API URL
      const AUTH_TOKEN = 'your-jwt-token'; // Replace with actual token

      const response = await fetch(`${API_BASE}/notifications/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          token: expoPushToken,
          platform: Platform.OS,
          notifyNewJobs: true,
          notifyNewQuotes: true,
          notifyQuoteAccepted: true,
          notifyJobCompleted: true,
          notifyPaymentReceived: true,
          notifyReminders: true,
        }),
      });

      if (response.ok) {
        setRegisteredWithAPI(true);
        Alert.alert('Success', 'Registered with API successfully!');
      } else {
        const error = await response.text();
        Alert.alert('Error', `Failed to register: ${error}`);
      }
    } catch (error) {
      Alert.alert('Error', `Network error: ${error}`);
    }
  };

  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification 📬",
        body: 'This is a local test notification from ServiceLink!',
        data: { testData: 'goes here' },
      },
      trigger: { seconds: 1 },
    });
  };

  const sendRemoteTestNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }

    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Remote Test Notification',
        body: 'This is sent via Expo Push API!',
        data: { someData: 'goes here' },
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      Alert.alert('Success', `Sent: ${JSON.stringify(result)}`);
    } catch (error) {
      Alert.alert('Error', `Failed to send: ${error}`);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Push Notifications Test</Text>

      {/* Push Token Display */}
      <View className="mb-6 p-4 bg-gray-100 rounded-lg">
        <Text className="font-semibold mb-2">Expo Push Token:</Text>
        <Text className="text-xs text-gray-600" selectable>
          {expoPushToken || 'Loading...'}
        </Text>
      </View>

      {/* Registration Status */}
      <View className="mb-6 p-4 bg-blue-50 rounded-lg">
        <Text className="font-semibold mb-2">API Registration Status:</Text>
        <Text className={registeredWithAPI ? 'text-green-600' : 'text-orange-600'}>
          {registeredWithAPI ? '✅ Registered with API' : '⏳ Not registered yet'}
        </Text>
      </View>

      {/* Last Notification */}
      {notification && (
        <View className="mb-6 p-4 bg-green-50 rounded-lg">
          <Text className="font-semibold mb-2">Last Notification Received:</Text>
          <Text className="text-sm">
            Title: {notification.request.content.title}
          </Text>
          <Text className="text-sm">
            Body: {notification.request.content.body}
          </Text>
          <Text className="text-xs text-gray-600 mt-2">
            Data: {JSON.stringify(notification.request.content.data)}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="space-y-3">
        <TouchableOpacity
          onPress={registerWithAPI}
          disabled={registeredWithAPI}
          className={`p-4 rounded-lg ${
            registeredWithAPI ? 'bg-gray-300' : 'bg-blue-500'
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {registeredWithAPI ? 'Already Registered' : 'Register with API'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={sendTestNotification}
          className="p-4 bg-purple-500 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            Send Local Test Notification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={sendRemoteTestNotification}
          className="p-4 bg-indigo-500 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">
            Send Remote Test Notification
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <Text className="font-semibold mb-2">📋 Testing Instructions:</Text>
        <Text className="text-sm mb-2">1. Copy your Expo push token above</Text>
        <Text className="text-sm mb-2">
          2. Update AUTH_TOKEN in this file with a valid JWT
        </Text>
        <Text className="text-sm mb-2">3. Click "Register with API"</Text>
        <Text className="text-sm mb-2">
          4. Test local notifications with the purple button
        </Text>
        <Text className="text-sm mb-2">
          5. Test remote notifications with the indigo button
        </Text>
        <Text className="text-sm text-gray-600 mt-2">
          Note: For physical device testing, you'll need the Expo Go app or a
          development build.
        </Text>
      </View>
    </ScrollView>
  );
}
