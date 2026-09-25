import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DAILY_FORTUNES = [
  "The spirits say YES… but only if you stop stalking their Instagram.",
  "Mercury is in retrograde and so is your decision-making. Proceed anyway.",
  "Someone is lying to you. It might be your horoscope. It might be you.",
  "The universe has a plan for you. It involves mild inconvenience and personal growth.",
  "Today you will receive a sign. You will ignore it. The universe sighs.",
  "A financial windfall approaches. It is a $5 bill you forgot in your jacket.",
  "Your soulmate is thinking of you right now. They are also thinking about pizza.",
  "The cards see great success ahead — right after this awkward phase you're in.",
  "You will make a bold decision today. The stars are nervous but supportive.",
  "Someone from your past will resurface. Delete the app before they do.",
  "The cosmos confirm: you were right all along. No one will admit it.",
  "Today's energy is chaotic neutral. Embrace it or be consumed by it.",
  "A secret admirer watches from afar. They have excellent taste.",
  "The universe says: stop overthinking. The universe is also overthinking.",
  "Your aura is giving main character energy. The side characters are tired.",
  "Beware of a tall dark stranger. Actually, beware of everyone today.",
  "The stars aligned just for you today. They want you to hydrate.",
  "Something you lost will be found. Something you found will be lost.",
  "The moon is in your corner. The moon has seen things. The moon knows.",
  "Today's fortune: you already know what you need to do. Do it.",
];

const LUCKY_COLORS = ['Gold', 'Silver', 'Purple', 'Crimson', 'Jade', 'Sapphire', 'Amber', 'Obsidian', 'Rose', 'Ivory'];

const DAILY_CATEGORIES = ['YES / NO', 'LOVE', 'MONEY', 'FUTURE', 'COSMIC'];

function getCountdown(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  return `${hours}h ${minutes}m`;
}

export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const [countdown, setCountdown] = useState(getCountdown());

  const dateStr = new Date().toISOString().split('T')[0];
  const seed = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fortuneIndex = seed % DAILY_FORTUNES.length;
  const fortune = DAILY_FORTUNES[fortuneIndex];
  const luckyNumber = (seed % 20) + 1;
  const luckyColor = LUCKY_COLORS[(seed + 7) % LUCKY_COLORS.length];
  const category = DAILY_CATEGORIES[seed % DAILY_CATEGORIES.length];

  const luckyLabel = `Lucky ${luckyNumber}`;

  useEffect(() => {
    console.log('[DailyScreen] Screen mounted, date seed:', dateStr, 'fortune index:', fortuneIndex);
    const interval = setInterval(() => {
      setCountdown(getCountdown());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const countdownText = `Next fortune in ${countdown}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: 80 + insets.bottom }]}>
      <Text style={styles.label}>DAILY FORTUNE</Text>
      <Text style={styles.title}>Your cosmic forecast.</Text>

      <View style={styles.card}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.fortune}>{fortune}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.luckyText}>{luckyLabel}</Text>
          <Text style={styles.luckyText}>{luckyColor}</Text>
        </View>
      </View>

      <Text style={styles.countdown}>{countdownText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a78bfa',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 30,
  },
  card: {
    backgroundColor: '#2a1e4a',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    color: '#a78bfa',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  fortune: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 28,
    marginBottom: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  luckyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#facc15',
  },
  countdown: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 12,
  },
});
