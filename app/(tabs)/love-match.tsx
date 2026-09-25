import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
  ScrollView,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOVE_READINGS = [
  "Your soulmate's name starts with J... or maybe it's your ex you can't forget.",
  "They will text you at 2:13am but it's not love — their phone died and you are their charger.",
  "You two have big energy. One of you will catch feelings first. It's already too late.",
  "The stars say yes. Your anxiety says maybe. Your heart already knows.",
  "This connection has past life energy. You've argued before — in ancient Rome.",
  "One of you is already in too deep. The other is still 'just vibing'.",
  "The chemistry is real. The timing? Absolutely chaotic.",
  "You will share a playlist. Then feelings. Then regret. Then more feelings.",
  "They think about you more than they admit. Especially at 3am.",
  "This match has main character energy. Someone's getting a confession soon.",
  "The universe ships you. Hard. But it also loves drama.",
  "You two would either build an empire or burn one down together.",
  "High compatibility detected. Proceed with butterflies and mild panic.",
  "The cards see late night talks, inside jokes, and one very awkward moment.",
  "Destiny brought you here. Free will decides what happens next.",
];

const LUCKY_COLORS = ['Rose Gold', 'Midnight Blue', 'Lavender', 'Crimson', 'Gold', 'Violet', 'Coral', 'Emerald'];

const GENDERS = ['Boy 💙', 'Girl 💖', 'Non-binary ✨'];

const CALC_PHRASES = [
  'Scanning energy...',
  'Checking if they like you back...',
  'Asking the cards...',
  'Reading the stars...',
  'Analyzing texts...',
  'Checking star signs...',
  'Exposing chemistry...',
  'Consulting the universe...',
];

function calcCompatibility(a: string, b: string): number {
  const combined = (a + b).toLowerCase();
  let sum = 0;
  for (let i = 0; i < combined.length; i++) {
    sum += combined.charCodeAt(i);
  }
  return (sum % 40) + 60;
}

function getStatus(pct: number): string {
  if (pct >= 90) return "Soulmates... or trauma bonded?";
  if (pct >= 80) return "Big energy. One of you will catch feelings first.";
  if (pct >= 70) return "Chaotic but magnetic. Proceed with caution.";
  if (pct >= 65) return "It's complicated. The cards are sweating.";
  return "The universe is... thinking about it.";
}

export default function LoveMatchScreen() {
  const insets = useSafeAreaInsets();

  const [selectedGender, setSelectedGender] = useState('Girl 💖');
  const [yourName, setYourName] = useState('');
  const [crushName, setCrushName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState<{
    pct: number;
    luckyNum: number;
    luckyColor: string;
    reading: string;
    status: string;
  } | null>(null);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [displayPercent, setDisplayPercent] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [calcPhrase, setCalcPhrase] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phraseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const saveToHistory = async (pct: number, luckyNum: number) => {
    try {
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
    console.log('[LoveMatch] CHECK COMPATIBILITY pressed — yourName:', yourName, 'crushName:', crushName, 'gender:', selectedGender);
    if (!yourName.trim() || !crushName.trim()) {
      console.log('[LoveMatch] Validation failed — empty name(s)');
      triggerShake();
      setError('Enter both names');
      return;
    }
    setError('');

    // Pre-calculate result
    const pct = calcCompatibility(yourName.trim(), crushName.trim());
    const luckyNum = Math.floor(Math.random() * 99) + 1;
    const luckyColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];
    const reading = LOVE_READINGS[Math.floor(Math.random() * LOVE_READINGS.length)];
    const status = getStatus(pct);
    console.log('[LoveMatch] Result calculated — pct:', pct, 'luckyNum:', luckyNum, 'luckyColor:', luckyColor, 'status:', status);

    // Open modal in calculating state
    setIsCalculating(true);
    setShowResult(false);
    setDisplayPercent(Math.floor(Math.random() * 100) + 1);
    setModalVisible(true);
    setCalcPhrase(CALC_PHRASES[0]);

    // Phrase cycling every 500ms
    let phraseIdx = 0;
    phraseIntervalRef.current = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % CALC_PHRASES.length;
      setCalcPhrase(CALC_PHRASES[phraseIdx]);
    }, 500);

    // Number flipping every 70ms for ~2.5s (35 ticks)
    let count = 0;
    intervalRef.current = setInterval(() => {
      setDisplayPercent(Math.floor(Math.random() * 100) + 1);
      count++;
      if (count >= 35) {
        // Stop both intervals
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (phraseIntervalRef.current) clearInterval(phraseIntervalRef.current);

        // Land on final score
        setDisplayPercent(pct);
        setIsCalculating(false);

        // Pop scale animation
        scaleAnim.setValue(0.5);
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 100, useNativeDriver: true }),
        ]).start();

        // Haptic
        Vibration.vibrate(50);

        // Show full result
        setResult({ pct, luckyNum, luckyColor, reading, status });
        setShowResult(true);
        saveToHistory(pct, luckyNum);
      }
    }, 70);
  };

  const handleTryAgain = () => {
    console.log('[LoveMatch] TRY AGAIN pressed');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (phraseIntervalRef.current) clearInterval(phraseIntervalRef.current);
    setModalVisible(false);
    setIsCalculating(false);
    setShowResult(false);
    setDisplayPercent(0);
    setYourName('');
    setCrushName('');
    setError('');
  };

  const handleShare = () => {
    console.log('[LoveMatch] SHARE RESULT pressed');
    Alert.alert('Sharing coming soon!');
  };

  const handleGenderSelect = (gender: string) => {
    console.log('[LoveMatch] Gender selected:', gender);
    setSelectedGender(gender);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1a102e' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 100,
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
                  onPress={() => handleGenderSelect(gender)}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 10,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isActive ? '#facc15' : 'transparent',
                    borderColor: isActive ? '#facc15' : '#2a2342',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: isActive ? '#000000' : '#9ca3af',
                      fontWeight: isActive ? '700' : '400',
                    }}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Your name input */}
        <View>
          <Text style={{ color: '#facc15', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
            Your name
          </Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TextInput
              value={yourName}
              onChangeText={(text) => {
                setYourName(text);
                if (error) setError('');
              }}
              placeholder="Your name"
              placeholderTextColor="#6b7280"
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

        {/* Crush name input */}
        <View>
          <Text style={{ color: '#facc15', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
            Crush name
          </Text>
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TextInput
              value={crushName}
              onChangeText={(text) => {
                setCrushName(text);
                if (error) setError('');
              }}
              placeholder="Their name"
              placeholderTextColor="#6b7280"
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

        {/* Error text */}
        {error ? (
          <Text style={{ color: '#ef4444', fontSize: 11, marginTop: -8 }}>
            {error}
          </Text>
        ) : null}

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleCheck}
          style={{
            backgroundColor: '#facc15',
            height: 50,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: '#000000',
              fontWeight: '800',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            CHECK COMPATIBILITY 💖
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Compatibility Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (phraseIntervalRef.current) clearInterval(phraseIntervalRef.current);
          setModalVisible(false);
          setIsCalculating(false);
          setShowResult(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#241a3d',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 28,
              paddingBottom: 40 + insets.bottom,
            }}
          >
            {/* Drag handle */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#2a2342', borderRadius: 2 }} />
            </View>

            {isCalculating ? (
              /* CALCULATING PHASE */
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 24 }}>
                  Calculating chemistry... 💘
                </Text>
                <Text style={{
                  color: '#facc15',
                  fontSize: 64,
                  fontWeight: '800',
                  textAlign: 'center',
                  shadowColor: '#facc15',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 20,
                }}>
                  {displayPercent}
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
                  {calcPhrase}
                </Text>
              </View>
            ) : showResult && result ? (
              /* RESULT PHASE */
              <>
                {/* Percentage with scale animation */}
                <Animated.Text style={{
                  color: '#facc15',
                  fontSize: 48,
                  fontWeight: '800',
                  textAlign: 'center',
                  transform: [{ scale: scaleAnim }],
                }}>
                  {`${result.pct}%`}
                </Animated.Text>

                {/* Status */}
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 8 }}>
                  {result.status}
                </Text>

                {/* Reading */}
                <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
                  {result.reading}
                </Text>

                {/* Lucky row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <View>
                    <Text style={{ color: '#9ca3af', fontSize: 11 }}>Lucky Number</Text>
                    <Text style={{ color: '#facc15', fontSize: 18, fontWeight: '700', marginTop: 2 }}>{result.luckyNum}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#9ca3af', fontSize: 11 }}>Lucky Color</Text>
                    <Text style={{ color: '#facc15', fontSize: 18, fontWeight: '700', marginTop: 2 }}>{result.luckyColor}</Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#2a2342', marginVertical: 20 }} />

                {/* Buttons */}
                <View style={{ gap: 10 }}>
                  <TouchableOpacity
                    onPress={handleShare}
                    style={{ backgroundColor: '#facc15', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#000000', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                      SHARE RESULT 💫
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleTryAgain}
                    style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2a2342', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#ffffff', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                      TRY AGAIN
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
