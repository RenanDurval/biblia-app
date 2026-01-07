// Ad Banner Component
// Non-intrusive banner ads for monetization (only shown in navigation screens)

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// IMPORTANT: Replace with your actual AdMob IDs before production
const ANDROID_AD_UNIT_ID = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-XXXXXXXX/XXXXXXXX'; // Replace with your Android Ad Unit ID

const IOS_AD_UNIT_ID = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-XXXXXXXX/XXXXXXXX'; // Replace with your iOS Ad Unit ID

const adUnitId = Platform.select({
    android: ANDROID_AD_UNIT_ID,
    ios: IOS_AD_UNIT_ID,
    default: TestIds.BANNER,
});

interface AdBannerProps {
    /**
     * Size of the banner ad
     * Default: BANNER (320x50)
     */
    size?: keyof typeof BannerAdSize;
}

export default function AdBanner({ size = 'BANNER' }: AdBannerProps) {
    return (
        <View style={styles.container}>
            <BannerAd
                unitId={adUnitId!}
                size={BannerAdSize[size]}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                }}
                onAdLoaded={() => {
                    console.log('[AdMob] Ad loaded');
                }}
                onAdFailedToLoad={(error) => {
                    console.warn('[AdMob] Ad failed to load:', error);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
});
