import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { StadiumBannerWebView } from './StadiumBannerWebView';

interface StadiumViewProps {
  onBack: () => void;
}

/**
 * Màn hình Toàn Màn Hình Sân Vận Động Trống Đồng Chuẩn Quốc Tế FIFA (840 × 680 — Quyết định 231)
 * 100% fullscreen canvas + nút [←] Neo-Brutalist nổi góc trên trái quay về Tab Khám phá.
 */
export const StadiumView: React.FC<StadiumViewProps> = ({ onBack }) => {
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onBack();
  };

  return (
    <View style={styles.fullscreenContainer}>
      <StadiumBannerWebView onExitStadium={onBack} />
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.85}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ArrowLeft size={20} color="#2B2118" strokeWidth={2.8} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 16,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    zIndex: 20,
  },
});
