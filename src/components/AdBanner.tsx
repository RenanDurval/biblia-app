// Ad Banner Component with Expo Go Fallback
import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
    // Attempt to require the library only if not in Expo Go or if it's available
    const AdLib = require('react-native-google-mobile-ads');
    BannerAd = AdLib.BannerAd;
    BannerAdSize = AdLib.BannerAdSize;
    TestIds = AdLib.TestIds;
} catch (e) {
    console.log('AdMob library not found or running in Expo Go. Banner ads disabled.');
}

const ANDROID_AD_UNIT_ID = __DEV__
    ? (TestIds?.BANNER || 'ca-app-pub-3940256099942544/6300978111')
    : 'ca-app-pub-XXXXXXXX/XXXXXXXX';

const IOS_AD_UNIT_ID = __DEV__
    ? (TestIds?.BANNER || 'ca-app-pub-3940256099942544/2934735716')
    : 'ca-app-pub-XXXXXXXX/XXXXXXXX';

const adUnitId = Platform.select({
    android: ANDROID_AD_UNIT_ID,
    ios: IOS_AD_UNIT_ID,
    default: TestIds?.BANNER,
});

interface AdBannerProps {
    size?: string;
}

export default function AdBanner({ size = 'BANNER' }: AdBannerProps) {
    if (!BannerAd) {
        // Return a subtle placeholder when library is missing
        return (
            <View style={[styles.container, { height: 60, backgroundColor: '#f0f0f0' }]}>
                <Text style={{ color: '#999', fontSize: 10 }}>Espaço para Anúncio</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize[size as any] || BannerAdSize.BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 4,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
});
