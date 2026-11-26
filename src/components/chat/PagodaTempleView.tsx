import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import { PagodaTempleBannerWebView } from './PagodaTempleBannerWebView';

interface PagodaTempleViewProps {
  onBack: () => void;
}

/**
 * Màn Hình Toàn Màn Hình Ngôi Chùa Việt Nam Cổ Kính 2 Tầng (640×560 — Quyết định 220)
 * - Mở tràn màn hình 100%, chỉ có nút tròn [←] góc trên trái & Cổng Tam Quan đáy sân ra phố Khám phá.
 */
export const PagodaTempleView: React.FC<PagodaTempleViewProps> = ({ onBack }) => {
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onBack();
  };

  return (
    <View style={styles.fullscreenContainer}>
      <PagodaTempleBannerWebView active={true} onExitToHub={handleBack} />

      <TouchableOpacity
        style={styles.floatingBackBtn}
        onPress={handleBack}
        activeOpacity={0.85}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Quay lại Khám phá"
      >
        <ArrowLeft size={20} color="#2B2118" strokeWidth={2.6} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#3A2D25',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 251, 241, 0.88)',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    zIndex: 20,
  },
});
