import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import {
  getPendingActions,
  removePendingAction,
  PendingAction,
  updateLastSyncTime,
} from './offline-storage';

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
};

/**
 * Hook to monitor network status
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

/**
 * Sync pending actions when online
 */
export async function syncPendingActions(
  apiClient: {
    createJob: (payload: any) => Promise<any>;
    submitQuote: (payload: any) => Promise<any>;
    acceptQuote: (payload: any) => Promise<any>;
    updateProfile: (payload: any) => Promise<any>;
  }
): Promise<{ success: number; failed: number }> {
  const online = await isOnline();
  if (!online) {
    console.log('Device is offline, skipping sync');
    return { success: 0, failed: 0 };
  }

  const pendingActions = await getPendingActions();
  if (pendingActions.length === 0) {
    console.log('No pending actions to sync');
    return { success: 0, failed: 0 };
  }

  console.log(`Syncing ${pendingActions.length} pending actions...`);

  let successCount = 0;
  let failedCount = 0;

  for (const action of pendingActions) {
    try {
      await processPendingAction(action, apiClient);
      await removePendingAction(action.id);
      successCount++;
      console.log(`Successfully synced action: ${action.type}`);
    } catch (error) {
      failedCount++;
      console.error(`Failed to sync action: ${action.type}`, error);

      // Optionally: Implement retry logic with exponential backoff
      if (action.retryCount >= 3) {
        console.warn(`Action ${action.id} exceeded retry limit, removing`);
        await removePendingAction(action.id);
      }
    }
  }

  await updateLastSyncTime();

  console.log(`Sync complete: ${successCount} succeeded, ${failedCount} failed`);
  return { success: successCount, failed: failedCount };
}

/**
 * Process a single pending action
 */
async function processPendingAction(
  action: PendingAction,
  apiClient: {
    createJob: (payload: any) => Promise<any>;
    submitQuote: (payload: any) => Promise<any>;
    acceptQuote: (payload: any) => Promise<any>;
    updateProfile: (payload: any) => Promise<any>;
  }
): Promise<void> {
  switch (action.type) {
    case 'CREATE_JOB':
      await apiClient.createJob(action.payload);
      break;
    case 'SUBMIT_QUOTE':
      await apiClient.submitQuote(action.payload);
      break;
    case 'ACCEPT_QUOTE':
      await apiClient.acceptQuote(action.payload);
      break;
    case 'UPDATE_PROFILE':
      await apiClient.updateProfile(action.payload);
      break;
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/**
 * Setup auto-sync on network change
 */
export function setupAutoSync(
  apiClient: {
    createJob: (payload: any) => Promise<any>;
    submitQuote: (payload: any) => Promise<any>;
    acceptQuote: (payload: any) => Promise<any>;
    updateProfile: (payload: any) => Promise<any>;
  }
): () => void {
  let isFirstCheck = true;

  const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
    // Skip first check (initial state)
    if (isFirstCheck) {
      isFirstCheck = false;
      return;
    }

    // Trigger sync when connection is restored
    if (state.isConnected && state.isInternetReachable) {
      console.log('Network restored, syncing pending actions...');
      await syncPendingActions(apiClient);
    }
  });

  return unsubscribe;
}
