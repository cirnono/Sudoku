import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const productionUnitId = Platform.select({
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID,
});

/** 不遮挡游戏区域、失败时隐藏的底部自适应横幅 */
export const BottomBannerAd: React.FC = () => {
  // Expo Go 不包含 AdMob 原生模块；在其中完全跳过模块加载。
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return null;
  }

  return <NativeBottomBannerAd />;
};

const NativeBottomBannerAd: React.FC = () => {
  // 仅在 Development Build 或正式原生包中加载，避免 Expo Go 启动崩溃。
  const ads = require('react-native-google-mobile-ads') as typeof import('react-native-google-mobile-ads');
  const { BannerAd, BannerAdSize, TestIds, AdsConsent } = ads;
  const mobileAds = ads.default;
  const unitId = __DEV__ || !productionUnitId ? TestIds.BANNER : productionUnitId;
  const [loaded, setLoaded] = useState(false);
  const [canRequestAds, setCanRequestAds] = useState(false);

  useEffect(() => {
    let mounted = true;
    const prepareAds = async () => {
      try {
        await AdsConsent.gatherConsent();
        const consentInfo = await AdsConsent.getConsentInfo();
        if (!consentInfo.canRequestAds) return;
        await mobileAds().initialize();
        if (mounted) setCanRequestAds(true);
      } catch (error) {
        console.warn('Failed to prepare mobile ads:', error);
      }
    };
    prepareAds();
    return () => { mounted = false; };
  }, []);

  if (!canRequestAds) return null;

  return (
    <View
      pointerEvents={loaded ? 'auto' : 'none'}
      style={[styles.container, !loaded && styles.hidden]}
    >
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  hidden: {
    opacity: 0,
  },
});
