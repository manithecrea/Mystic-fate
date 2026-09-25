import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'fortune_history';

interface HistoryItem {
  id: string;
  fortune: string;
  category: string;
  timestamp: number;
  luckyNumber: number;
}

const now = Date.now();
const DEMO_ITEMS: HistoryItem[] = [
  { id: '1', fortune: 'A bag is coming. Not Birkin. Bills.', category: 'Money', timestamp: now - 1000 * 60 * 18, luckyNumber: 44 },
  { id: '2', fortune: 'They will text you at 2:13am... but it is not love. Their phone died and you are their charger.', category: 'Love', timestamp: now - 1000 * 60 * 60 * 6, luckyNumber: 27 },
  { id: '3', fortune: 'They will text you at 2:13am... but it is not love. Their phone died and you are their charger.', category: 'Love', timestamp: now - 1000 * 60 * 60 * 6 - 60000, luckyNumber: 27 },
  { id: '4', fortune: 'They will text you at 2:13am... but it is not love. Their phone died and you are their charger.', category: 'Love', timestamp: now - 1000 * 60 * 60 * 7, luckyNumber: 27 },
  { id: '5', fortune: 'They will text you at 2:13am... but it is not love. Their phone died and you are their charger.', category: 'Love', timestamp: now - 1000 * 60 * 60 * 7 - 300000, luckyNumber: 27 },
  { id: '6', fortune: 'They will text you at 2:13am... but it is not love. Their phone died and you are their charger.', category: 'Love', timestamp: now - 1000 * 60 * 60 * 7 - 600000, luckyNumber: 27 },
];

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const nowDate = new Date();
  const isToday = d.toDateString() === nowDate.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) {
    return 'Today, ' + timeStr;
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + timeStr;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    console.log('[HistoryScreen] Mounted, loading history');
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      console.log('[HistoryScreen] AsyncStorage.getItem fortune_history, raw length:', raw ? raw.length : 0);
      if (!raw) {
        console.log('[HistoryScreen] No history found, seeding demo data');
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(DEMO_ITEMS));
        setItems(DEMO_ITEMS);
      } else {
        const parsed = JSON.parse(raw) as HistoryItem[];
        console.log('[HistoryScreen] Loaded', parsed.length, 'history items');
        setItems(parsed.length === 0 ? DEMO_ITEMS : parsed);
      }
    } catch (e) {
      console.log('[HistoryScreen] Error loading history:', e);
      setItems(DEMO_ITEMS);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    console.log('[HistoryScreen] Long press delete item id:', id);
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      console.log('[HistoryScreen] Item deleted, remaining:', updated.length);
    } catch (e) {
      console.log('[HistoryScreen] Error saving after delete:', e);
    }
  }, [items]);

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const timestampDisplay = formatTimestamp(item.timestamp);
    const metaText = item.category + ' · ' + timestampDisplay;
    return (
      <TouchableOpacity
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.8}
        style={{
          backgroundColor: '#241a3d',
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', lineHeight: 18 }}>
            {item.fortune}
          </Text>
          <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
            {metaText}
          </Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#facc15', minWidth: 28, textAlign: 'right' }}>
          {item.luckyNumber}
        </Text>
      </TouchableOpacity>
    );
  };

  const separator = () => <View style={{ height: 8 }} />;

  const emptyComponent = (
    <View style={{ alignItems: 'center', marginTop: 60 }}>
      <Text style={{ fontSize: 14, color: '#6b7280' }}>No history yet</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#1a102e' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff', paddingLeft: 16, paddingTop: insets.top + 20, paddingBottom: 12 }}>
        History
      </Text>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={separator}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={emptyComponent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
