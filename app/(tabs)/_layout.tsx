import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { route: '/(tabs)/(home)', segment: '(home)', icon: '🔮', label: 'Reveal' },
  { route: '/(tabs)/daily', segment: 'daily', icon: '☀️', label: 'Daily' },
  { route: '/(tabs)/history', segment: 'history', icon: '📜', label: 'History' },
  { route: '/(tabs)/love-match', segment: 'love-match', icon: '💘', label: 'Love Match' },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const isTabActive = (segment: string) => {
    if (segment === '(home)') {
      return pathname === '/' || pathname.includes('(home)') || pathname === '/(tabs)';
    }
    return pathname.includes(segment);
  };

  const handleTabPress = (route: string, label: string) => {
    console.log('[TabNav] Tab pressed:', label, '| route:', route);
    router.push(route as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="daily" />
        <Stack.Screen name="history" />
        <Stack.Screen name="love-match" />
      </Stack>

      {/* Custom bottom nav bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + insets.bottom,
          backgroundColor: '#140e24',
          borderTopWidth: 1,
          borderTopColor: '#2a2342',
          paddingBottom: insets.bottom,
          flexDirection: 'row',
        }}
      >
        {TABS.map((tab) => {
          const active = isTabActive(tab.segment);
          return (
            <TouchableOpacity
              key={tab.segment}
              onPress={() => handleTabPress(tab.route, tab.label)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  color: active ? '#facc15' : '#6b7280',
                  fontWeight: active ? '600' : '400',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
