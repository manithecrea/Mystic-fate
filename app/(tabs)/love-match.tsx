import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  ScrollView,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GENDERS = ['Boy 💙', 'Girl 💖', 'Non-binary ✨'];

function calcCompatibility(a: string, b: string): number {
  const combined = (a + b).toLowerCase();
  let sum = 0;
  for (let i = 0; i < combined.length; i++) {
    sum += combined.charCodeAt(i);
  }
  return (sum % 40) + 60;
}

export default function LoveMatchScreen() {
  const insets = useSafeAreaInsets();

  const [selectedGender, setSelectedGender] = useState('Girl 💖');
  const [yourName, setYourName] = useState('');
  const [crushName, setCrushName] = useState('');
  const [error, setError] = useState('');

  const [percent, setPercent] = useState<number | null>(null);
  const [finalPercent, setFinalPercent] = useState<number | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [loyaltyPct] = useState(() => Math.floor(Math.random() * 40) + 30);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const saveToHistory = async (pct: number) => {
    try {
      const luckyNum = Math.floor(Math.random() * 99) + 1;
      const item = {
        id: Date.now().toString(),
        fortune: `${yourName.trim()} + ${crushName.trim()} = ${pct}% compatible`,
        category: 'Love Match',
        timestamp: Date.now(),
        luckyNumber: luckyNum,
      };
      const raw = await AsyncStorage.getItem('fortune_history');
      const existing = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem('fortune_history', JSON.stringify([item, ...existing]));
      console.log('[LoveMatch] Saved to history:', item);
    } catch (e) {
      console.log('[LoveMatch] Failed to save history:', e);
    }
  };

  const handleCheck = () => {
    console.log('[LoveMatch] CHECK COMPATIBILITY pressed — yourName:', yourName, 'crushName:', crushName);
    if (!yourName.trim() || !crushName.trim()) {
      triggerShake();
      setError('Enter both names');
      return;
    }
    setError('');
    setFinalPercent(null);

    const final = calcCompatibility(yourName.trim(), crushName.trim());
    setIsRandomizing(true);
    setPercent(Math.floor(Math.random() * 100) + 1);

    let ticks = 0;
    intervalRef.current = setInterval(() => {
      setPercent(Math.floor(Math.random() * 100) + 1);
      ticks++;
      if (ticks >= 30) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPercent(final);
        setFinalPercent(final);
        setIsRandomizing(false);
        Vibration.vibrate(50);
        saveToHistory(final);
        console.log('[LoveMatch] Final result:', final);
      }
    }, 80);
  };

  const isRunning = isRandomizing;
  const showResult = percent !== null;
  const crushDisplayName = crushName.trim() || 'They';

  return (
    <View style={{ flex: 1, backgroundColor: '#1a102e' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ marginBottom: 4 }}>
          <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 6 }}>
            Love Match 💗💙
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center' }}>
            Let the algorithm expose the chemistry.
          </Text>
        </View>

        {/* Gender selector */}
        <View>
          <Text style={{ color: '#facc15', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
            My crush is a:
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {GENDERS.map((gender) => {
              const isActive = selectedGender === gender;
              return (
                <TouchableOpacity
                  key={gender}
                  onPress={() => {
                    console.log('[LoveMatch] Gender selected:', gender);
                    setSelectedGender(gender);
                  }}
                  disabled={isRunning}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 10,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isActive ? '#facc15' : 'transparent',
                    borderColor: isActive ? '#facc15' : '#2a2342',
                    opacity: isRunning ? 0.5 : 1,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: isActive ? '#000000' : '#9ca3af',
                    fontWeight: isActive ? '700' : '400',
                  }}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Your name */}
        <View>
          <Text style={{ color: '#facc15', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
            Your name
          </Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TextInput
              value={yourName}
              onChangeText={(t) => { setYourName(t); if (error) setError(''); }}
              placeholder="Your name"
              placeholderTextColor="#6b7280"
              editable={!isRunning}
              style={{
                backgroundColor: '#2a1e4a',
                borderRadius: 12,
                height: 48,
                paddingHorizontal: 16,
                color: '#ffffff',
                fontSize: 13,
              }}
            />
          </Animated.View>
        </View>

        {/* Crush name */}
        <View>
          <Text style={{ color: '#facc15', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
            Crush name
          </Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TextInput
              value={crushName}
              onChangeText={(t) => { setCrushName(t); if (error) setError(''); }}
              placeholder="Their name"
              placeholderTextColor="#6b7280"
              editable={!isRunning}
              style={{
                backgroundColor: '#2a1e4a',
                borderRadius: 12,
                height: 48,
                paddingHorizontal: 16,
                color: '#ffffff',
                fontSize: 13,
              }}
            />
          </Animated.View>
        </View>

        {/* Error */}
        {error ? (
          <Text style={{ color: '#ef4444', fontSize: 11, marginTop: -8 }}>{error}</Text>
        ) : null}

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleCheck}
          disabled={isRunning}
          style={{
            backgroundColor: '#facc15',
            height: 50,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
            opacity: isRunning ? 0.85 : 1,
          }}
        >
          <Text style={{
            color: '#000000',
            fontWeight: '800',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            {isRunning ? 'CALCULATING...' : 'CHECK COMPATIBILITY 💖'}
          </Text>
        </TouchableOpacity>

        {/* Result — NO box, NO background, pure floating text */}
        {showResult && percent !== null ? (
          <View style={{ backgroundColor: 'transparent', alignItems: 'center', marginTop: 20 }}>
            <Text style={{
              fontSize: 64,
              fontWeight: '900',
              color: '#facc15',
              textAlign: 'center',
            }}>
              {percent}%
            </Text>
            {finalPercent !== null ? (
              <>
                <Text style={{
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: 14,
                  textAlign: 'center',
                  marginTop: 8,
                  lineHeight: 22,
                  paddingHorizontal: 8,
                }}>
                  {`Love ${finalPercent}% | Drama 100% | ${crushDisplayName} thinks about you 24/7: 100%`}
                </Text>
                <Text style={{
                  color: '#9ca3af',
                  fontSize: 12,
                  textAlign: 'center',
                  marginTop: 6,
                  paddingHorizontal: 8,
                }}>
                  {`Love ${finalPercent}% | Drama 100% | Loyalty ${loyaltyPct}%`}
                </Text>
              </>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
