import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface VintageViewfinderFrameProps {
  isRecording?: boolean;
}

/**
 * Khung Ngắm Máy Ảnh Phim Vintage 35mm (Vintage Rangefinder Viewfinder)
 * Thiết kế hoài niệm Hà Nội Thu Đông:
 * - Vạch quang học Framelines mạ vàng thanh mảnh
 * - Thước ngắm chữ thập tâm (Center Reticle)
 * - Vạch chỉ số phim & Timestamp retro analog ('26 10 07 • K-35mm)
 */
export const VintageViewfinderFrame: React.FC<VintageViewfinderFrameProps> = () => {
  // Lấy ngày hiện tại để sinh timestamp analog
  const now = new Date();
  const yearShort = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const retroDateStr = `'${yearShort} ${month} ${day}`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. CÁC VẠCH CANH NÉT QUANG HỌC 4 GÓC (RANGEFINDER FRAMELINES) */}
      <View style={[styles.cornerBracket, styles.bracketTL]}>
        <View style={styles.cornerTickH} />
        <View style={styles.cornerTickV} />
      </View>
      <View style={[styles.cornerBracket, styles.bracketTR]}>
        <View style={styles.cornerTickH} />
        <View style={styles.cornerTickV} />
      </View>
      <View style={[styles.cornerBracket, styles.bracketBL]}>
        <View style={styles.cornerTickH} />
        <View style={styles.cornerTickV} />
      </View>
      <View style={[styles.cornerBracket, styles.bracketBR]}>
        <View style={styles.cornerTickH} />
        <View style={styles.cornerTickV} />
      </View>

      {/* 2. CÁC VẠCH ĐÁNH DẤU CẠNH GIỮA (FRAME TICKS) */}
      <View style={styles.edgeTickTop} />
      <View style={styles.edgeTickBottom} />
      <View style={styles.edgeTickLeft} />
      <View style={styles.edgeTickRight} />

      {/* 3. THƯỚC NGẮM CHỮ THẬP TRUNG TÂM (CENTER RETICLE) */}
      <View style={styles.centerReticleContainer}>
        <View style={styles.reticleLineH} />
        <View style={styles.reticleLineV} />
        <View style={styles.reticleDot} />
      </View>

      {/* 4. CHI TIẾT VINTAGE ANALOG Ở ĐỈNH VÀ ĐÁY */}
      <View style={styles.topInfoBar}>
        <Text style={styles.vintageFilmLabel}>K-FILM 400</Text>
        <Text style={styles.vintageApertureLabel}>35mm F/2.0</Text>
      </View>

      <View style={styles.bottomInfoBar}>
        <Text style={styles.retroTimestamp}>{retroDateStr}</Text>
        <Text style={styles.expCounterLabel}>EXP 24/36</Text>
      </View>
    </View>
  );
};

const GOLD_COLOR = 'rgba(235, 175, 75, 0.85)';
const SUBTLE_GOLD = 'rgba(235, 175, 75, 0.45)';
const AMBER_TIMESTAMP = '#F5A623';

const styles = StyleSheet.create({
  // Góc quang học 4 phía
  cornerBracket: {
    position: 'absolute',
    width: 22,
    height: 22,
  },
  bracketTL: {
    top: 14,
    left: 14,
  },
  bracketTR: {
    top: 14,
    right: 14,
    alignItems: 'flex-end',
  },
  bracketBL: {
    bottom: 14,
    left: 14,
    justifyContent: 'flex-end',
  },
  bracketBR: {
    bottom: 14,
    right: 14,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  cornerTickH: {
    width: 18,
    height: 1.5,
    backgroundColor: GOLD_COLOR,
    borderRadius: 1,
  },
  cornerTickV: {
    width: 1.5,
    height: 18,
    backgroundColor: GOLD_COLOR,
    borderRadius: 1,
  },

  // Vạch biên cạnh
  edgeTickTop: {
    position: 'absolute',
    top: 14,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 1.5,
    backgroundColor: SUBTLE_GOLD,
    borderRadius: 1,
  },
  edgeTickBottom: {
    position: 'absolute',
    bottom: 14,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 1.5,
    backgroundColor: SUBTLE_GOLD,
    borderRadius: 1,
  },
  edgeTickLeft: {
    position: 'absolute',
    top: '50%',
    left: 14,
    marginTop: -4,
    width: 1.5,
    height: 8,
    backgroundColor: SUBTLE_GOLD,
    borderRadius: 1,
  },
  edgeTickRight: {
    position: 'absolute',
    top: '50%',
    right: 14,
    marginTop: -4,
    width: 1.5,
    height: 8,
    backgroundColor: SUBTLE_GOLD,
    borderRadius: 1,
  },

  // Thước ngắm tâm
  centerReticleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleLineH: {
    position: 'absolute',
    width: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  reticleLineV: {
    position: 'absolute',
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  reticleDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: GOLD_COLOR,
  },

  // Chi tiết Vintage đỉnh
  topInfoBar: {
    position: 'absolute',
    top: 18,
    left: 42,
    right: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vintageFilmLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.65)',
    textTransform: 'uppercase',
  },
  vintageApertureLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.55)',
  },

  // Chi tiết Timestamp đáy
  bottomInfoBar: {
    position: 'absolute',
    bottom: 18,
    left: 42,
    right: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retroTimestamp: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: AMBER_TIMESTAMP,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  expCounterLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: 'rgba(255, 255, 255, 0.55)',
    fontVariant: ['tabular-nums'],
  },
});
