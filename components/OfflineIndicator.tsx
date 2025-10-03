import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../lib/network-status';

export function OfflineIndicator() {
  const { isConnected } = useNetworkStatus();

  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>📵 You're offline</Text>
      <Text style={styles.subtext}>Changes will sync when connection is restored</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  subtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
});
