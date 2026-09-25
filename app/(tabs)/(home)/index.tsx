import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Share,
  ActivityIndicator,
} from 'react-native';
import { loadAndShowRewardedAd } from '@/utils/admob';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'fortune_history';
const REVEALS_DATE_KEY = 'lastRevealDate';
const REVEALS_USED_KEY = 'revealsToday';
const PREMIUM_KEY = 'isPremium';
const MAX_FREE_REVEALS = 5;

interface HistoryItem {
  id: string;
  fortune: string;
  category: string;
  timestamp: number;
  luckyNumber: number;
}

const FORTUNES: Record<string, string[]> = {
  'Love': [
    "A deep connection is forming — open your heart and let it in.",
    "The one you seek is closer than you think. Look around you.",
    "Past wounds are healing. Love will find you renewed.",
    "A surprise encounter will spark something unexpected.",
    "Your soulmate is on a parallel path — your roads will cross soon.",
    "Let go of what was. What's coming is far more beautiful.",
    "Someone is thinking of you right now, more than you know.",
    "The universe is aligning two hearts. Patience is your power.",
    "A love from your past may return — but only you can decide its fate.",
    "Your energy is magnetic right now. Love is drawn to you.",
    "True love requires vulnerability. The cards say: be brave.",
    "A new chapter in love begins at the next full moon.",
    "The relationship you desire is already written in the stars.",
    "Stop searching. The moment you relax, love will arrive.",
    "Your heart knows the answer. Trust it completely.",
    "A meaningful conversation will change everything.",
    "Love is not lost — it is waiting for you to believe again.",
    "The cards see laughter, warmth, and a hand to hold.",
    "Your love story is still being written. The best parts are ahead.",
    "Cherish the small moments — they are the foundation of forever.",
  ],
  'Money': [
    "A bag is coming. Not Birkin. Bills.",
    "The seeds you planted are about to bear fruit. Harvest time is near.",
    "An unexpected source of income will surprise you this month.",
    "Your hard work has not gone unnoticed. Reward is coming.",
    "A bold financial decision will pay off more than you expect.",
    "The universe says: invest in yourself first.",
    "A partnership will unlock new streams of abundance.",
    "Release your fear of lack — abundance flows to the fearless.",
    "A long-awaited payment or opportunity is finally on its way.",
    "Your financial situation is about to shift dramatically upward.",
    "Trust your instincts on the next big decision — they are correct.",
    "The cards see a windfall arriving from an unexpected direction.",
    "Your creativity is your greatest financial asset right now.",
    "Stop playing small. The universe is ready to reward your ambition.",
    "A mentor or guide will appear to show you the path to wealth.",
    "Debt and struggle are ending. A new cycle of prosperity begins.",
    "The number 7 holds significance in your financial future.",
    "Your next move will set the foundation for years of abundance.",
    "Money flows to those who value it wisely — you are one of them.",
    "The cards confirm: your financial breakthrough is imminent.",
  ],
  'Future': [
    "A major life change is on the horizon — embrace it without fear.",
    "The path ahead is clearer than it seems. Trust the journey.",
    "Something you've been waiting for will finally arrive.",
    "A door is closing so that a better one can open for you.",
    "Your future self is grateful for the choices you make today.",
    "The universe has a plan far greater than your current worries.",
    "A new beginning disguised as an ending is approaching.",
    "The cards see travel, adventure, and expansion in your future.",
    "Your greatest chapter has not yet been written.",
    "A skill you have will become your greatest asset very soon.",
    "The future holds a version of you that you'll be proud of.",
    "Change is coming — and it is exactly what you've been praying for.",
    "Three months from now, your life will look completely different.",
    "The stars are rearranging themselves in your favor.",
    "What feels uncertain now will become your greatest strength.",
    "A long-held dream is about to become your reality.",
    "The cards see success, recognition, and fulfillment ahead.",
    "Your future is bright — brighter than you dare to imagine.",
    "The next phase of your life will exceed all expectations.",
    "Everything is falling into place, even when it doesn't feel like it.",
  ],
  'Yes / No': [
    "Yes — the universe gives its full blessing.",
    "No — but something better is being prepared for you.",
    "Yes — but patience will be required.",
    "No — not yet. The timing is not aligned.",
    "Yes — take the leap. The net will appear.",
    "No — trust that this redirection is protection.",
    "Yes — your instincts are correct. Move forward.",
    "The answer is unclear — seek more information first.",
    "Yes — wholeheartedly and without doubt.",
    "No — let this one go. Your energy is needed elsewhere.",
    "Yes — but only if your heart is truly in it.",
    "No — the cards see a better path waiting for you.",
    "Yes — the stars align in your favor on this matter.",
    "Not yet — but soon. Hold on a little longer.",
    "Yes — this is the right move at the right time.",
    "No — something is being hidden from you. Investigate first.",
    "Yes — the universe has already said yes. Now you must too.",
    "No — your gut feeling of doubt is wisdom speaking.",
    "Yes — proceed with confidence and clarity.",
    "The cards are silent — meditate on this question again.",
  ],
  'Ex': [
    "They still think about you — more than they would ever admit.",
    "That chapter is closed. A new, better story awaits you.",
    "They have changed, but so have you. The question is: for the better?",
    "The connection was real, but the timing was always wrong.",
    "Moving on is not giving up — it is choosing yourself.",
    "They are not your future. They were your lesson.",
    "The cards see you thriving without them. That is your answer.",
    "Closure will come — but from within, not from them.",
    "What you miss is not them, but the version of yourself you were.",
    "They are thinking of reaching out. Whether they do is their choice.",
    "The love was real. But real love does not make you feel this way.",
    "Your energy is too powerful to be spent looking backward.",
    "The universe removed them to make room for something greater.",
    "They are on their own journey. Yours is far more interesting.",
    "Forgiveness is for you, not for them. Release and rise.",
    "The cards see a reunion — but only if both have truly grown.",
    "Stop waiting for an apology that may never come. Heal anyway.",
    "Your worth was never defined by their ability to see it.",
    "The best revenge is a life so beautiful they wonder what happened.",
    "Let them go. The universe has someone who will never make you question.",
  ],
};

const LUCKY_COLORS = ['Gold', 'Silver', 'Violet', 'Crimson', 'Emerald', 'Sapphire', 'Rose', 'Amber'];

const LOADING_TEXTS = [
  "The spirits are checking the receipts.",
  "Shuffling the fate...",
  "Consulting the stars...",
  "The ancestors are whispering...",
  "Reading your aura...",
  "Asking the cards...",
];

const CATEGORIES = ['Love', 'Money', 'Future', 'Yes / No', 'Ex'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Love');

  // Scarcity state
  const [revealsLeft, setRevealsLeft] = useState(MAX_FREE_REVEALS);
  const [isPremium, setIsPremium] = useState(false);
  const [showOutOfReveals, setShowOutOfReveals] = useState(false);

  // Reveal flow state
  const [isRevealing, setIsRevealing] = useState(false);
  const [showFortune, setShowFortune] = useState(false);
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);
  const [currentFortune, setCurrentFortune] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [luckyNumber, setLuckyNumber] = useState(0);
  const [luckyColor, setLuckyColor] = useState('Gold');

  // Animations
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const cardSlideAnim = useRef(new Animated.Value(60)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Load scarcity state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const today = new Date().toDateString();
        const savedDate = await AsyncStorage.getItem(REVEALS_DATE_KEY);
        const savedReveals = await AsyncStorage.getItem(REVEALS_USED_KEY);
        const premium = await AsyncStorage.getItem(PREMIUM_KEY);

        if (savedDate !== today) {
          await AsyncStorage.setItem(REVEALS_DATE_KEY, today);
          await AsyncStorage.setItem(REVEALS_USED_KEY, '0');
          setRevealsLeft(MAX_FREE_REVEALS);
          console.log('[HomeScreen] New day — reveals reset to', MAX_FREE_REVEALS);
        } else {
          const used = parseInt(savedReveals || '0', 10);
          setRevealsLeft(MAX_FREE_REVEALS - used);
          console.log('[HomeScreen] Reveals used today:', used, '| left:', MAX_FREE_REVEALS - used);
        }

        if (premium === 'true') {
          setIsPremium(true);
          console.log('[HomeScreen] User is premium');
        }
      } catch (e) {
        console.log('[HomeScreen] Error loading scarcity state:', e);
      }
    };
    loadState();
  }, []);

  const startBounce = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopBounce = () => {
    bounceAnim.stopAnimation();
    bounceAnim.setValue(1);
  };

  const handleReveal = useCallback(async () => {
    console.log('[HomeScreen] Reveal My Fate pressed, category:', selectedCategory, '| revealsLeft:', revealsLeft, '| isPremium:', isPremium);

    // Scarcity gate
    if (!isPremium && revealsLeft <= 0) {
      console.log('[HomeScreen] Out of reveals — showing wall');
      setShowOutOfReveals(true);
      return;
    }

    const fortunes = FORTUNES[selectedCategory] ?? FORTUNES['Love'];
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    const fortune = fortunes[randomIndex];
    const lNum = Math.floor(Math.random() * 99) + 1;
    const lColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];

    // Decrement reveals
    if (!isPremium) {
      const newLeft = revealsLeft - 1;
      setRevealsLeft(newLeft);
      const used = MAX_FREE_REVEALS - newLeft;
      await AsyncStorage.setItem(REVEALS_USED_KEY, used.toString());
      console.log('[HomeScreen] Reveal used — left:', newLeft);
    }

    // Save to history
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      fortune,
      category: selectedCategory,
      timestamp: Date.now(),
      luckyNumber: lNum,
    };
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      const existing: HistoryItem[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([newItem, ...existing]));
      console.log('[HomeScreen] History saved, total items:', existing.length + 1);
    } catch (e) {
      console.log('[HomeScreen] Error saving history:', e);
    }

    setCurrentFortune(fortune);
    setCurrentCategory(selectedCategory);
    setLuckyNumber(lNum);
    setLuckyColor(lColor);
    setShowFortune(false);
    setIsRevealing(true);
    setLoadingText(LOADING_TEXTS[0]);

    Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    startBounce();

    let i = 1;
    const textInterval = setInterval(() => {
      setLoadingText(LOADING_TEXTS[i % LOADING_TEXTS.length]);
      i++;
    }, 600);

    setTimeout(() => {
      clearInterval(textInterval);
      stopBounce();
      setIsRevealing(false);
      setShowFortune(true);

      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      cardSlideAnim.setValue(60);
      cardOpacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(cardSlideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cardOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 2500);
  }, [selectedCategory, revealsLeft, isPremium]);

  const handleClose = useCallback(() => {
    console.log('[HomeScreen] Fortune closed');
    Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setIsRevealing(false);
      setShowFortune(false);
    });
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: `🔮 My fortune: "${currentFortune}" — Lucky ${luckyNumber} | ${luckyColor}` });
    } catch (e) {
      console.log('[HomeScreen] Share failed:', e);
    }
  }, [currentFortune, luckyNumber, luckyColor]);

  const handleShakeAgain = useCallback(() => {
    console.log('[HomeScreen] Shake Again pressed');
    handleClose();
    setTimeout(() => handleReveal(), 300);
  }, [handleReveal, handleClose]);

  const [isLoadingAd, setIsLoadingAd] = useState(false);

  // Watch ad: real AdMob rewarded ad
  const handleWatchAd = useCallback(async () => {
    console.log('[HomeScreen] Watch ad pressed — loading rewarded ad');
    setIsLoadingAd(true);
    try {
      const rewarded = await loadAndShowRewardedAd();
      if (rewarded) {
        console.log('[HomeScreen] Ad reward earned — granting +1 reveal');
        const newLeft = revealsLeft + 1;
        setRevealsLeft(newLeft);
        const used = Math.max(0, MAX_FREE_REVEALS - newLeft);
        await AsyncStorage.setItem(REVEALS_USED_KEY, used.toString());
        setShowOutOfReveals(false);
      } else {
        console.log('[HomeScreen] Ad closed without reward — no reveal granted');
      }
    } catch (e) {
      console.log('[HomeScreen] Ad failed:', e);
    } finally {
      setIsLoadingAd(false);
    }
  }, [revealsLeft]);

  const categoryBadgeText = currentCategory.toUpperCase();
  const isOutOfReveals = !isPremium && revealsLeft <= 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main card */}
        <View style={{ backgroundColor: '#1a102e', borderRadius: 24, marginHorizontal: 16, padding: 20 }}>
          {/* Top bar */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#facc15', letterSpacing: 2, textTransform: 'uppercase' }}>
              FORTUNE TELLER
            </Text>
            <Text style={{ fontSize: 12, color: '#ffffff' }}>🔥 1 days streak</Text>
          </View>

          {/* Headline */}
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', lineHeight: 34, marginTop: 20 }}>
            {'What is the universe\nnot telling you?'}
          </Text>

          {/* Subtext */}
          <Text style={{ fontSize: 14, color: '#9ca3af', lineHeight: 20, marginTop: 8 }}>
            {'Ask your question in your mind.\nThe cards already know.'}
          </Text>

          {/* Center orb */}
          <View
            style={{
              width: 160, height: 160, borderRadius: 80,
              backgroundColor: '#a855f7',
              alignSelf: 'center',
              alignItems: 'center', justifyContent: 'center',
              marginTop: 24, marginBottom: 24,
              shadowColor: '#a855f7',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6, shadowRadius: 40, elevation: 20,
            }}
          >
            <Text style={{ position: 'absolute', top: 30, right: 40, fontSize: 20, color: '#fde047' }}>✦</Text>
            <Text style={{ fontSize: 36, color: '#fde047' }}>✦</Text>
            <Text style={{ position: 'absolute', bottom: 30, left: 40, fontSize: 16, color: '#fde047' }}>✦</Text>
          </View>

          {/* Category pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }} contentContainerStyle={{ paddingRight: 8 }}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => { console.log('[HomeScreen] Category selected:', category); setSelectedCategory(category); }}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? '#facc15' : '#2a2342',
                    borderRadius: 12,
                    paddingHorizontal: 16, paddingVertical: 10,
                    marginRight: 8,
                    backgroundColor: isSelected ? 'rgba(250,204,21,0.1)' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 13, color: isSelected ? '#facc15' : '#ffffff', fontWeight: isSelected ? '600' : '400' }}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
            Pick a lane. The cards already know.
          </Text>

          {/* CTA button */}
          <TouchableOpacity
            onPress={handleReveal}
            disabled={isRevealing}
            style={{
              backgroundColor: isOutOfReveals ? '#3a2a5a' : '#facc15',
              borderRadius: 12,
              height: 52,
              alignItems: 'center', justifyContent: 'center',
              width: '100%', marginTop: 16,
              opacity: isRevealing ? 0.7 : 1,
            }}
          >
            <Text style={{
              fontSize: 14, fontWeight: '800',
              color: isOutOfReveals ? '#6b7280' : '#000000',
              letterSpacing: 1.5, textTransform: 'uppercase',
            }}>
              {isRevealing ? 'READING YOUR FATE...' : isOutOfReveals ? 'NO REVEALS LEFT' : 'REVEAL MY FATE'}
            </Text>
          </TouchableOpacity>

          {/* Reveals counter badge */}
          <View style={{
            backgroundColor: '#2a1e4a',
            borderRadius: 20,
            paddingHorizontal: 12, paddingVertical: 6,
            marginTop: 12,
            alignSelf: 'center',
            borderWidth: 1,
            borderColor: revealsLeft <= 1 && !isPremium ? '#facc15' : '#3a2a5a',
          }}>
            <Text style={{
              color: revealsLeft <= 1 && !isPremium ? '#facc15' : '#9ca3af',
              fontSize: 11, fontWeight: '600',
            }}>
              {isPremium ? '∞ Unlimited · PREMIUM ✓' : `${revealsLeft}/${MAX_FREE_REVEALS} reveals left today`}
            </Text>
          </View>

          {/* Love Match secondary button */}
          <TouchableOpacity
            onPress={() => { console.log('[HomeScreen] Love Match button pressed'); router.push('/(tabs)/love-match'); }}
            style={{
              borderWidth: 1, borderColor: '#3a2a5a',
              backgroundColor: 'transparent',
              borderRadius: 12, height: 52, width: '100%',
              marginTop: 12, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>💘 Love Match</Text>
          </TouchableOpacity>

          {/* Watch ad text */}
          <TouchableOpacity
            onPress={() => {
              console.log('[HomeScreen] Watch an ad for 5 more pressed');
              if (!isPremium && revealsLeft <= 0) {
                handleWatchAd();
              } else {
                setShowOutOfReveals(true);
              }
            }}
          >
            <Text style={{ color: '#facc15', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
              Watch an ad for 5 more
            </Text>
          </TouchableOpacity>
        </View>

        {/* Love Match preview card */}
        <View style={{ backgroundColor: '#1a102e', borderRadius: 24, padding: 20, marginHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>💘</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#ffffff', marginLeft: 8 }}>Love Match</Text>
          </View>
          <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Discover your cosmic compatibility</Text>
        </View>
      </ScrollView>

      {/* Out of reveals wall */}
      {showOutOfReveals && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#1a102e',
          alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 28,
          paddingBottom: insets.bottom + 80,
        }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>💔</Text>
          <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
            You're out of fate for today
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
            {MAX_FREE_REVEALS}/{MAX_FREE_REVEALS} used · Come back tomorrow
          </Text>

          {/* Unlock premium */}
          <TouchableOpacity
            onPress={() => { console.log('[HomeScreen] Unlock Unlimited pressed'); setShowOutOfReveals(false); }}
            style={{ backgroundColor: '#facc15', borderRadius: 12, height: 52, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
          >
            <Text style={{ color: '#000000', fontWeight: '800', fontSize: 14, letterSpacing: 1 }}>
              Unlock Unlimited 💛
            </Text>
          </TouchableOpacity>

          {/* Watch ad for +1 */}
          <TouchableOpacity
            onPress={handleWatchAd}
            disabled={isLoadingAd}
            style={{ borderWidth: 1, borderColor: '#4a3a6a', borderRadius: 12, height: 52, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
          >
            {isLoadingAd ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
                Watch ad for +1 more 🎬
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowOutOfReveals(false)} style={{ paddingVertical: 8 }}>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Full-screen overlay for loading + result */}
      {(isRevealing || showFortune) && (
        <Animated.View
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#1a102e',
            opacity: overlayOpacity,
            alignItems: 'center', justifyContent: 'center',
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 80,
          }}
        >
          {/* STEP 1: Loading */}
          {isRevealing && (
            <View style={{ alignItems: 'center' }}>
              <Animated.Text style={{ fontSize: 48, transform: [{ scale: bounceAnim }], marginBottom: 28 }}>
                ✨
              </Animated.Text>
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 26, paddingHorizontal: 16 }}>
                {loadingText}
              </Text>
            </View>
          )}

          {/* STEP 2: Fortune result */}
          {showFortune && (
            <Animated.View style={{ width: '100%', opacity: cardOpacityAnim, transform: [{ translateY: cardSlideAnim }] }}>
              <View style={{ backgroundColor: '#2a1a4a', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <Text style={{ color: '#a78bfa', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
                  {categoryBadgeText}
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700', lineHeight: 28, marginBottom: 16 }}>
                  {currentFortune}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#facc15', fontSize: 12, fontWeight: '700' }}>Lucky {luckyNumber}</Text>
                  <Text style={{ color: '#facc15', fontSize: 12, fontWeight: '700' }}>{luckyColor}</Text>
                </View>
              </View>

              <Text style={{ color: '#6b7280', fontSize: 11, textAlign: 'center', marginBottom: 20 }}>
                ✦ The cards have spoken ✦
              </Text>

              <TouchableOpacity
                onPress={handleShare}
                style={{ backgroundColor: '#facc15', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}
              >
                <Text style={{ color: '#000000', fontWeight: '800', fontSize: 13, letterSpacing: 1 }}>SHARE FORTUNE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShakeAgain}
                style={{ borderWidth: 1, borderColor: '#4a3a6a', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>SHAKE AGAIN</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClose} style={{ alignItems: 'center', marginTop: 4, paddingVertical: 8 }}>
                <Text style={{ color: '#6b7280', fontSize: 13 }}>✕ Close</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </View>
  );
}
