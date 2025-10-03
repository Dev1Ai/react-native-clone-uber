import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    try {
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // TODO: Replace with actual Expo project ID
      });
      token = pushToken.data;
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Send push token to backend
 */
export async function sendPushTokenToBackend(token: string, userId: string): Promise<void> {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        token,
        platform: Platform.OS,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to register push token: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending push token to backend:', error);
    throw error;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  triggerSeconds = 1
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: {
      seconds: triggerSeconds,
    },
  });

  return id;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge count
 */
export async function clearBadgeCount(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
