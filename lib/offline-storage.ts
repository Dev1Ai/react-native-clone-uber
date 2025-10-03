import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  JOBS: '@jobs',
  QUOTES: '@quotes',
  PROVIDERS: '@providers',
  USER_PROFILE: '@user_profile',
  PENDING_ACTIONS: '@pending_actions',
  LAST_SYNC: '@last_sync',
} as const;

export type PendingAction = {
  id: string;
  type: 'CREATE_JOB' | 'SUBMIT_QUOTE' | 'ACCEPT_QUOTE' | 'UPDATE_PROFILE';
  payload: any;
  timestamp: number;
  retryCount: number;
};

/**
 * Save jobs to offline storage
 */
export async function saveJobsOffline(jobs: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  } catch (error) {
    console.error('Error saving jobs offline:', error);
    throw error;
  }
}

/**
 * Get jobs from offline storage
 */
export async function getJobsOffline(): Promise<any[]> {
  try {
    const jobs = await AsyncStorage.getItem(STORAGE_KEYS.JOBS);
    return jobs ? JSON.parse(jobs) : [];
  } catch (error) {
    console.error('Error getting jobs offline:', error);
    return [];
  }
}

/**
 * Save quotes to offline storage
 */
export async function saveQuotesOffline(quotes: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  } catch (error) {
    console.error('Error saving quotes offline:', error);
    throw error;
  }
}

/**
 * Get quotes from offline storage
 */
export async function getQuotesOffline(): Promise<any[]> {
  try {
    const quotes = await AsyncStorage.getItem(STORAGE_KEYS.QUOTES);
    return quotes ? JSON.parse(quotes) : [];
  } catch (error) {
    console.error('Error getting quotes offline:', error);
    return [];
  }
}

/**
 * Save providers to offline storage
 */
export async function saveProvidersOffline(providers: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
  } catch (error) {
    console.error('Error saving providers offline:', error);
    throw error;
  }
}

/**
 * Get providers from offline storage
 */
export async function getProvidersOffline(): Promise<any[]> {
  try {
    const providers = await AsyncStorage.getItem(STORAGE_KEYS.PROVIDERS);
    return providers ? JSON.parse(providers) : [];
  } catch (error) {
    console.error('Error getting providers offline:', error);
    return [];
  }
}

/**
 * Save user profile to offline storage
 */
export async function saveUserProfileOffline(profile: any): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile offline:', error);
    throw error;
  }
}

/**
 * Get user profile from offline storage
 */
export async function getUserProfileOffline(): Promise<any | null> {
  try {
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error getting user profile offline:', error);
    return null;
  }
}

/**
 * Queue an action to be performed when online
 */
export async function queuePendingAction(action: Omit<PendingAction, 'id'>): Promise<void> {
  try {
    const pendingActions = await getPendingActions();
    const newAction: PendingAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    pendingActions.push(newAction);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(pendingActions));
  } catch (error) {
    console.error('Error queueing pending action:', error);
    throw error;
  }
}

/**
 * Get all pending actions
 */
export async function getPendingActions(): Promise<PendingAction[]> {
  try {
    const actions = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
    return actions ? JSON.parse(actions) : [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
}

/**
 * Remove a pending action by ID
 */
export async function removePendingAction(actionId: string): Promise<void> {
  try {
    const pendingActions = await getPendingActions();
    const filteredActions = pendingActions.filter((action) => action.id !== actionId);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(filteredActions));
  } catch (error) {
    console.error('Error removing pending action:', error);
    throw error;
  }
}

/**
 * Clear all pending actions
 */
export async function clearPendingActions(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing pending actions:', error);
    throw error;
  }
}

/**
 * Update last sync timestamp
 */
export async function updateLastSyncTime(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('Error updating last sync time:', error);
    throw error;
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
}

/**
 * Clear all offline data
 */
export async function clearAllOfflineData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing offline data:', error);
    throw error;
  }
}

/**
 * Get storage size in bytes
 */
export async function getStorageSize(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
}
