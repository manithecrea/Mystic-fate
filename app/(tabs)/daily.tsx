import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DailyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0a0a0a',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: insets.top,
        paddingBottom: 60 + insets.bottom,
      }}
    >
      <Text style={{ fontSize: 48 }}>☀️</Text>
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: '#ffffff',
          marginTop: 12,
        }}
      >
        Daily Reading
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: '#9ca3af',
          textAlign: 'center',
          marginTop: 8,
          lineHeight: 20,
        }}
      >
        {'Your daily cosmic guidance\ncoming soon...'}
      </Text>
    </View>
  );
}
