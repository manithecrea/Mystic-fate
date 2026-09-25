import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  ScrollView,
  Vibration,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadAndShowRewardedAd } from '@/utils/admob';

const GENDERS = ['Boy 💙', 'Girl 💖'];

const LM_DATE_KEY = 'lastLoveMatchDate';
const LM_USED_KEY = 'loveMatchesToday';
const MAX_FREE_LM = 3;

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
  const [showShare, setShowShare] = useState(false);

  const [lmLeft, setLmLeft] = useState(MAX_FREE_LM);
  const [showLmWall, setShowLmWall] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Glow pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date().toDateString();
        const savedDate = await AsyncStorage.getItem(LM_DATE_KEY);
        const savedUsed = await AsyncStorage.getItem(LM_USED_KEY);
        if (savedDate !== today) {
          await AsyncStorage.setItem(LM_DATE_KEY, today);
          await AsyncStorage.setItem(LM_USED_KEY, '0');
          setLmLeft(MAX_FREE_LM);
          console.log('[LoveMatch] New day — checks reset to', MAX_FREE_LM);
        } else {
          const used = parseInt(savedUsed || '0', 10);
          setLmLeft(Math.max(0, MAX_FREE_LM - used));
          console.log('[LoveMatch] Checks used today:', used, '| left:', Math.max(0, MAX_FREE_LM - used));
        }
      } catch (e) {
        console.log('[LoveMatch] Error loading limit state:', e);
      }
    };
    load();
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
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
      console.log('[LoveMatch] Saved to history, total items:', existing.length + 1);
    } catch (e) {
      console.log('[LoveMatch] Failed to save history:', e);
    }
  };

  const runCalculation = useCallback(() => {
    setShowShare(false);
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
        setShowShare(true);
        Vibration.vibrate(50);
        saveToHistory(final);
      }
    }, 80);
  }, [yourName, crushName]);

  const handleCheck = async () => {
    console.log('[LoveMatch] Check Compatibility pressed | yourName:', yourName.trim(), '| crushName:', crushName.trim(), '| lmLeft:', lmLeft);

    if (!yourName.trim() || !crushName.trim()) {
      triggerShake();
      setError('Enter both names 💔');
      console.log('[LoveMatch] Validation failed — missing names');
      return;
    }
    setError('');

    if (lmLeft <= 0) {
      console.log('[LoveMatch] Out of checks — showing lock wall');
      setShowLmWall(true);
      return;
    }

    const newLeft = lmLeft - 1;
    setLmLeft(newLeft);
    const used = MAX_FREE_LM - newLeft;
    await AsyncStorage.setItem(LM_USED_KEY, used.toString());
    console.log('[LoveMatch] Check used — left:', newLeft);

    runCalculation();
  };

  const handleWatchAd = async () => {
    console.log('[LoveMatch] Watch Ad pressed — loading rewarded ad');
    setIsLoadingAd(true);
    try {
      const rewarded = await loadAndShowRewardedAd();
      if (rewarded) {
        console.log('[LoveMatch] Ad reward earned — granting +1 check');
        const newLeft = lmLeft + 1;
        setLmLeft(newLeft);
        const used = Math.max(0, MAX_FREE_LM - newLeft);
        await AsyncStorage.setItem(LM_USED_KEY, used.toString());
        setShowLmWall(false);
      } else {
        console.log('[LoveMatch] Ad closed without reward — no check granted');
      }
    } catch (e) {
      console.log('[LoveMatch] Ad failed:', e);
    } finally {
      setIsLoadingAd(false);
    }
  };

  const handleShare = async () => {
    console.log('[LoveMatch] Share pressed | percent:', percent);
    try {
      const crushDisplayName = crushName.trim() || 'They';
      await Share.share({
        message: `💘 ${yourName.trim()} + ${crushDisplayName} = ${percent}% compatible!\nLove ${percent}% | Drama 100% | ${crushDisplayName} thinks about you 24/7: 100%\n\nFind your match on Mystic Fate ✨`,
      });
    } catch (e) {
      console.log('[LoveMatch] Share failed:', e);
    }
  };

  const isRunning = isRandomizing;
  const showResult = percent !== null;
  const crushDisplayName = crushName.trim() || 'They';
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  const loveText = `Love ${finalPercent}% · Drama 100%`;
  const loyaltyText = `${crushDisplayName} thinks about you 24/7 · Loyalty ${loyaltyPct}%`;
  const lmLeftText = lmLeft <= 0 ? '🔒 No checks left today' : `${lmLeft}/${MAX_FREE_LM} free checks today`;

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0010' }}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0d0010', '#1a0520', '#0d0010']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Animated.View style={{
            position: 'absolute',
            width: 200, height: 200,
            borderRadius: 100,
            backgroundColor: '#e11d48',
            opacity: glowOpacity,
            top: -60,
            alignSelf: 'center',
            shadowColor: '#e11d48',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 80,
            elevation: 0,
          }} />
          <Text style={{ fontSize: 36, marginBottom: 8 }}>💘</Text>
          <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 }}>
            Love Match
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            Let the universe expose the chemistry
          </Text>
        </View>

        {/* Glass card for inputs */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(225,29,72,0.3)',
          padding: 20,
          gap: 16,
          shadowColor: '#e11d48',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 8,
        }}>
          {/* Gender selector */}
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              My crush is a
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {GENDERS.map((gender) => {
                const isActive = selectedGender === gender;
                return (
                  <TouchableOpacity
                    key={gender}
                    onPress={() => { console.log('[LoveMatch] Gender selected:', gender); setSelectedGender(gender); }}
                    disabled={isRunning}
                    style={{
                      flex: 1,
                      height: 42,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? 'rgba(225,29,72,0.2)' : 'rgba(255,255,255,0.04)',
                      borderColor: isActive ? '#e11d48' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      color: isActive ? '#ff6b8a' : 'rgba(255,255,255,0.5)',
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
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
              Your name
            </Text>
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <TextInput
                value={yourName}
                onChangeText={(t) => { setYourName(t); if (error) setError(''); }}
                placeholder="Enter your name..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                editable={!isRunning}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  height: 50,
                  paddingHorizontal: 16,
                  color: '#ffffff',
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              />
            </Animated.View>
          </View>

          {/* Crush name */}
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
              Crush name
            </Text>
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <TextInput
                value={crushName}
                onChangeText={(t) => { setCrushName(t); if (error) setError(''); }}
                placeholder="Enter their name..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                editable={!isRunning}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  height: 50,
                  paddingHorizontal: 16,
                  color: '#ffffff',
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              />
            </Animated.View>
          </View>

          {/* Error */}
          {error ? (
            <Text style={{ color: '#ff6b8a', fontSize: 12, textAlign: 'center' }}>{error}</Text>
          ) : null}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleCheck}
          disabled={isRunning}
          activeOpacity={0.85}
          style={{ borderRadius: 16, overflow: 'hidden', opacity: isRunning ? 0.8 : 1 }}
        >
          <LinearGradient
            colors={isRunning ? ['#4a1a2a', '#3a1020'] : ['#e11d48', '#be123c', '#9f1239']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              shadowColor: '#e11d48',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isRunning ? 0 : 0.5,
              shadowRadius: 16,
              elevation: isRunning ? 0 : 8,
            }}
          >
            <Text style={{
              color: '#ffffff',
              fontWeight: '800',
              fontSize: 14,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}>
              {isRunning ? '✨ Calculating...' : '💘 Check Compatibility'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Counter badge */}
        <View style={{
          alignSelf: 'center',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderWidth: 1,
          borderColor: lmLeft <= 0 ? 'rgba(225,29,72,0.5)' : 'rgba(255,255,255,0.1)',
        }}>
          <Text style={{
            color: lmLeft <= 0 ? '#ff6b8a' : 'rgba(255,255,255,0.4)',
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.5,
          }}>
            {lmLeftText}
          </Text>
        </View>

        {/* Result */}
        {showResult && percent !== null ? (
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <View style={{
              backgroundColor: 'rgba(225,29,72,0.1)',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(225,29,72,0.3)',
              paddingHorizontal: 32,
              paddingVertical: 20,
              alignItems: 'center',
              width: '100%',
              shadowColor: '#e11d48',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 30,
              elevation: 10,
            }}>
              <Text style={{
                fontSize: 80,
                fontWeight: '900',
                color: '#ff6b8a',
                textAlign: 'center',
                lineHeight: 88,
                textShadowColor: 'rgba(225,29,72,0.6)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 20,
              }}>
                {percent}%
              </Text>

              {finalPercent !== null && (
                <>
                  <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 12 }} />
                  <Text style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: '700',
                    fontSize: 14,
                    textAlign: 'center',
                    lineHeight: 22,
                  }}>
                    {loveText}
                  </Text>
                  <Text style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 12,
                    textAlign: 'center',
                    marginTop: 4,
                    lineHeight: 18,
                  }}>
                    {loyaltyText}
                  </Text>
                </>
              )}
            </View>

            {/* Share button */}
            {showShare && !isRandomizing && finalPercent !== null && (
              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.85}
                style={{
                  marginTop: 16,
                  borderRadius: 14,
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                <LinearGradient
                  colors={['#f43f5e', '#e11d48']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 14,
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 13, letterSpacing: 1.5 }}>
                    SHARE MATCH 💘
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Lock wall overlay */}
      {showLmWall && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(13,0,16,0.97)',
          alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 28,
          paddingBottom: insets.bottom + 80,
        }}>
          {/* Background glow */}
          <View style={{
            position: 'absolute',
            width: 300, height: 300,
            borderRadius: 150,
            backgroundColor: '#e11d48',
            opacity: 0.08,
            top: '20%',
            alignSelf: 'center',
          }} />

          {/* Glass card */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: 'rgba(225,29,72,0.3)',
            padding: 28,
            width: '100%',
            alignItems: 'center',
            shadowColor: '#e11d48',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 40,
            elevation: 12,
          }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔒</Text>
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
              Daily Limit Reached
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 8, lineHeight: 20 }}>
              You've used all {MAX_FREE_LM} free love checks today.
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', marginBottom: 28 }}>
              Watch a short ad to unlock +1 more reading
            </Text>

            {/* Watch Ad button */}
            <TouchableOpacity
              onPress={handleWatchAd}
              disabled={isLoadingAd}
              activeOpacity={0.85}
              style={{ borderRadius: 14, overflow: 'hidden', width: '100%', marginBottom: 12 }}
            >
              <LinearGradient
                colors={['#e11d48', '#be123c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 54,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                }}
              >
                {isLoadingAd ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 14, letterSpacing: 1 }}>
                    🎬 Watch Ad to Reveal +1
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginBottom: 16 }}>
              Or come back tomorrow for {MAX_FREE_LM} more free checks
            </Text>

            <TouchableOpacity onPress={() => { console.log('[LoveMatch] Lock wall closed'); setShowLmWall(false); }} style={{ paddingVertical: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>✕ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
