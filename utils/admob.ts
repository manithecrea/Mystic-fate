import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';

const REWARDED_AD_UNIT_ID = 'ca-app-pub-9415637801845502/5436321125';
const AD_LOAD_TIMEOUT_MS = 15000; // 15 seconds max wait

export function createRewardedAd() {
  console.log('[AdMob] Creating rewarded ad for unit:', REWARDED_AD_UNIT_ID);
  return RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });
}

export async function loadAndShowRewardedAd(): Promise<boolean> {
  console.log('[AdMob] loadAndShowRewardedAd called');
  return new Promise((resolve) => {
    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const safeResolve = (value: boolean) => {
      if (resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      resolve(value);
    };

    const rewarded = createRewardedAd();

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('[AdMob] Ad loaded — showing now');
      rewarded.show().catch((e: unknown) => {
        console.log('[AdMob] Ad show failed:', e);
        cleanup();
        safeResolve(false);
      });
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        console.log('[AdMob] Reward earned — resolving true');
        cleanup();
        safeResolve(true);
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdMob] Ad closed — resolving false');
      cleanup();
      safeResolve(false);
    });

    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error: unknown) => {
      console.log('[AdMob] Ad load error:', error);
      cleanup();
      safeResolve(false);
    });

    const cleanup = () => {
      try { unsubscribeLoaded(); } catch (_) {}
      try { unsubscribeEarned(); } catch (_) {}
      try { unsubscribeClosed(); } catch (_) {}
      try { unsubscribeError(); } catch (_) {}
    };

    // Timeout fallback — if ad doesn't load in 15s, resolve false
    timeoutId = setTimeout(() => {
      console.log('[AdMob] Ad load timed out after', AD_LOAD_TIMEOUT_MS, 'ms');
      cleanup();
      safeResolve(false);
    }, AD_LOAD_TIMEOUT_MS);

    console.log('[AdMob] Loading ad...');
    rewarded.load();
  });
}
