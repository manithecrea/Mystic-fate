import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

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
    "A financial opportunity is approaching — stay alert and ready.",
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

const CATEGORIES = ['Love', 'Money', 'Future', 'Yes / No', 'Ex'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('Love');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFortune, setCurrentFortune] = useState('');

  const handleCategoryPress = useCallback((category: string) => {
    console.log('[HomeScreen] Category selected:', category);
    setSelectedCategory(category);
  }, []);

  const handleReveal = useCallback(() => {
    console.log('[HomeScreen] Reveal My Fate pressed, category:', selectedCategory);
    const fortunes = FORTUNES[selectedCategory] ?? FORTUNES['Love'];
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    const fortune = fortunes[randomIndex];
    console.log('[HomeScreen] Fortune selected:', fortune);
    setCurrentFortune(fortune);
    setModalVisible(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [selectedCategory]);

  const handleCloseModal = useCallback(() => {
    console.log('[HomeScreen] Fortune modal closed');
    setModalVisible(false);
  }, []);

  const categoryBadgeText = selectedCategory.toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main card */}
        <View
          style={{
            backgroundColor: '#1a102e',
            borderRadius: 24,
            borderCurve: 'continuous',
            marginHorizontal: 16,
            padding: 20,
          }}
        >
          {/* Top bar */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '800',
                color: '#facc15',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              FORTUNE TELLER
            </Text>
            <Text style={{ fontSize: 12, color: '#ffffff' }}>
              🔥 1 days streak
            </Text>
          </View>

          {/* Headline */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: 34,
              marginTop: 20,
            }}
          >
            {'What is the universe\nnot telling you?'}
          </Text>

          {/* Subtext */}
          <Text
            style={{
              fontSize: 14,
              color: '#9ca3af',
              lineHeight: 20,
              marginTop: 8,
            }}
          >
            {'Ask your question in your mind.\nThe cards already know.'}
          </Text>

          {/* Center circle */}
          <View
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: '#a855f7',
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 24,
              marginBottom: 24,
              shadowColor: '#a855f7',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 40,
              elevation: 20,
            }}
          >
            <Text
              style={{
                position: 'absolute',
                top: 30,
                right: 40,
                fontSize: 20,
                color: '#fde047',
              }}
            >
              ✦
            </Text>
            <Text style={{ fontSize: 36, color: '#fde047' }}>✦</Text>
            <Text
              style={{
                position: 'absolute',
                bottom: 30,
                left: 40,
                fontSize: 16,
                color: '#fde047',
              }}
            >
              ✦
            </Text>
          </View>

          {/* Category pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 4 }}
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => handleCategoryPress(category)}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? '#facc15' : '#2a2342',
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    marginRight: 8,
                    backgroundColor: isSelected ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: isSelected ? '#facc15' : '#ffffff',
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Pills hint */}
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
            Pick a lane. The cards already know.
          </Text>

          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleReveal}
            style={{
              backgroundColor: '#facc15',
              borderRadius: 12,
              borderCurve: 'continuous',
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginTop: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '800',
                color: '#000000',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              REVEAL MY FATE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Love Match preview */}
        <View
          style={{
            backgroundColor: '#1a102e',
            borderRadius: 24,
            borderCurve: 'continuous',
            padding: 20,
            marginHorizontal: 16,
            marginTop: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>💘</Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#ffffff',
                marginLeft: 8,
              }}
            >
              Love Match
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
            Discover your cosmic compatibility
          </Text>
        </View>
      </ScrollView>

      {/* Fortune Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'flex-end',
          }}
          onPress={handleCloseModal}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#1a102e',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderCurve: 'continuous',
              padding: 28,
              paddingBottom: 40 + insets.bottom,
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: '#2a2342',
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />

            {/* Category badge */}
            <View
              style={{
                backgroundColor: 'rgba(168,85,247,0.2)',
                borderRadius: 8,
                borderCurve: 'continuous',
                paddingHorizontal: 12,
                paddingVertical: 4,
                alignSelf: 'flex-start',
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: '#a855f7',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {categoryBadgeText}
              </Text>
            </View>

            {/* Fortune text */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: 30,
              }}
            >
              {currentFortune}
            </Text>

            {/* Subtext */}
            <Text
              style={{
                fontSize: 12,
                color: '#6b7280',
                textAlign: 'center',
                marginTop: 20,
              }}
            >
              ✦ The cards have spoken ✦
            </Text>

            {/* Close button */}
            <TouchableOpacity
              onPress={handleCloseModal}
              style={{
                marginTop: 24,
                backgroundColor: '#facc15',
                borderRadius: 12,
                borderCurve: 'continuous',
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '800',
                  color: '#000',
                  letterSpacing: 1.5,
                }}
              >
                CLOSE
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
