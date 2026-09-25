import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';

// Real rewarded ad unit ID
const REWARDED_AD_UNIT_ID = 'ca-app-pub-9415637801845502/5436321125';

export function createRewardedAd() {
  console.log('[AdMob] Creating rewarded ad for unit:', REWARDED_AD_UNIT_ID);
  return RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });
}

export async function loadAndShowRewardedAd(): Promise<boolean> {
  console.log('[AdMob] loadAndShowRewardedAd called');
  return new Promise((resolve) => {
    const rewarded = createRewardedAd();

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('[AdMob] Ad loaded — showing now');
      rewarded.show();
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        console.log('[AdMob] Reward earned — resolving true');
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
        resolve(true);
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdMob] Ad closed without reward — resolving false');
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      resolve(false);
    });

    console.log('[AdMob] Loading ad...');
    rewarded.load();
  });
}
