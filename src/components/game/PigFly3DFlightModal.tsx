import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Award, Flame, Play, Send, Sparkles, Trophy, Volume2, VolumeX, X, Zap } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import {
  calculateFlightScore,
  FlightSummary,
  FlightWorld,
  FLIGHT_WORLDS,
  formatFlightShareMessage,
  getAvailableWorlds,
} from '../../utils/game/pigFly3DEngine';

interface PigFly3DFlightModalProps {
  visible: boolean;
  onClose: () => void;
  streakDays?: number;
  userName?: string;
  onShareToSquad?: (message: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SafeWebView = WebView as unknown as React.ComponentType<any>;

/**
 * Tạo mã nguồn HTML5/WebGL mô phỏng 3D góc nhìn thứ nhất (FPS) tự chứa 100% Offline
 */
function build3DFlightSimulatorHTML(world: FlightWorld): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>PigFly 3D FPS Simulator</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; user-select: none; -webkit-user-select: none; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: ${world.skyBottomColor}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    canvas { width: 100%; height: 100%; display: block; }
    #hud {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;
      display: flex; flex-direction: column; justify-content: space-between; padding: 24px 20px;
    }
    .hud-top {
      display: flex; justify-content: space-between; align-items: center;
      background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      padding: 10px 16px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .stat-pill { display: flex; align-items: center; gap: 8px; color: #FFF; font-weight: 800; font-size: 14px; text-shadow: 0 2px 4px rgba(0,0,0,0.4); }
    .stat-label { font-size: 11px; opacity: 0.8; font-weight: 600; text-transform: uppercase; }
    .crosshair {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 44px; height: 44px; pointer-events: none;
    }
    .crosshair-circle {
      width: 100%; height: 100%; border: 2px dashed rgba(255, 255, 255, 0.65);
      border-radius: 50%; animation: spin 20s linear infinite;
    }
    .crosshair-dot {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 6px; height: 6px; background: #F43F5E; border-radius: 50%; box-shadow: 0 0 8px #F43F5E;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .hud-bottom {
      display: flex; justify-content: space-between; align-items: flex-end; width: 100%;
    }
    .alt-meter {
      background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px);
      padding: 8px 14px; border-radius: 14px; color: #FFF; border: 1px solid rgba(255,255,255,0.15);
      font-size: 12px; font-weight: 700;
    }
    .touch-guide {
      position: absolute; bottom: 85px; left: 50%; transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.75); font-size: 11px; font-weight: 600;
      background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 12px; pointer-events: none;
    }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <div id="hud">
    <div class="hud-top">
      <div class="stat-pill">
        <span style="font-size: 18px;">🟡</span>
        <div>
          <div class="stat-label">Vòng Vàng</div>
          <span id="scoreText">0</span> / 15
        </div>
      </div>
      <div class="stat-pill">
        <span style="font-size: 18px;">⏱️</span>
        <div>
          <div class="stat-label">Thời Gian</div>
          <span id="timeText">00:00</span>
        </div>
      </div>
    </div>

    <div class="crosshair">
      <div class="crosshair-circle"></div>
      <div class="crosshair-dot"></div>
    </div>

    <div class="touch-guide">👈 Vuốt ngón tay để liếc góc nhìn & lái Heo Bay 👉</div>

    <div class="hud-bottom">
      <div class="alt-meter">
        ĐỘ CAO: <span id="altText">450</span>m · TỐC ĐỘ: <span id="speedText">85</span> km/h
      </div>
    </div>
  </div>

  <script>
    // Web Audio Chime Sound (100% Offline Synthesizer)
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playChime(success) {
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        if (success) {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        } else {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.25);
        }
      } catch (e) {}
    }

    // 3D FPS Canvas Procedural WebGL Engine
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    // Trạng thái chuyến bay
    let ringsPassed = 0;
    let stormHits = 0;
    let startTime = Date.now();
    let speed = 85;
    let altitude = 450;
    let cameraX = 0;
    let cameraY = 0;
    let targetX = 0;
    let targetY = 0;

    // Quản lý mảng đối tượng 3D (Vòng Tiết Kiệm & Mây Bão)
    const objects = [];
    const NUM_RINGS = 24;
    for (let i = 0; i < NUM_RINGS; i++) {
      const isStorm = (i > 2 && Math.random() < 0.28);
      objects.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 500,
        z: 400 + i * 220,
        type: isStorm ? 'STORM' : 'RING',
        radius: isStorm ? 55 : 45,
        hit: false,
        pulse: Math.random() * Math.PI,
      });
    }

    // Touch Steering Listeners
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouching = false;

    window.addEventListener('touchstart', (e) => {
      isTouching = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isTouching) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      targetX += dx * 0.45;
      targetY += dy * 0.45;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => { isTouching = false; }, { passive: true });

    // Gửi tín hiệu về React Native qua WebView Bridge
    function sendRN(type, data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
      }
    }

    // Game Loop 60 FPS
    function loop() {
      // Mượt góc quay
      cameraX += (targetX - cameraX) * 0.1;
      cameraY += (targetY - cameraY) * 0.1;

      // Nền Gradient Trời 3D
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '${world.skyTopColor}');
      grad.addColorStop(1, '${world.skyBottomColor}');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Cập nhật và chiếu 3D (Perspective Projection)
      const fov = 320;
      const cx = W / 2;
      const cy = H / 2;

      // Sắp xếp theo chiều sâu Z từ xa đến gần
      objects.sort((a, b) => b.z - a.z);

      for (let obj of objects) {
        obj.z -= speed * 0.085;
        obj.pulse += 0.05;

        // Nếu bay qua phía sau camera, tái tạo lại ở đằng xa
        if (obj.z < 20) {
          if (!obj.hit && obj.type === 'RING') {
            // Trượt vòng
          }
          obj.z = 2400 + Math.random() * 300;
          obj.x = cameraX + (Math.random() - 0.5) * 850;
          obj.y = cameraY + (Math.random() - 0.5) * 550;
          obj.hit = false;
        }

        // Tọa độ chiếu 2D
        const relX = obj.x - cameraX;
        const relY = obj.y - cameraY;
        const scale = fov / (fov + obj.z);
        const screenX = cx + relX * scale;
        const screenY = cy + relY * scale;
        const screenR = obj.radius * scale;

        // Kiểm tra va chạm khi đối tượng tới gần buồng lái (Z: 20 -> 90)
        if (!obj.hit && obj.z > 20 && obj.z < 95) {
          const dist = Math.hypot(screenX - cx, screenY - cy);
          if (dist < screenR + 25) {
            obj.hit = true;
            if (obj.type === 'RING') {
              ringsPassed++;
              document.getElementById('scoreText').innerText = ringsPassed;
              playChime(true);
              sendRN('RING_HIT', { ringsPassed });
            } else {
              stormHits++;
              playChime(false);
              sendRN('STORM_HIT', { stormHits });
            }
          }
        }

        // Vẽ đối tượng 3D
        if (obj.z > 30) {
          ctx.save();
          if (obj.type === 'RING') {
            // VÒNG CỔNG TIẾT KIỆM VÀNG (3D Torus)
            ctx.beginPath();
            ctx.arc(screenX, screenY, Math.max(2, screenR), 0, Math.PI * 2);
            ctx.lineWidth = Math.max(2, 6 * scale);
            ctx.strokeStyle = obj.hit ? '#10B981' : '${world.ringColor}';
            ctx.shadowColor = '${world.ringColor}';
            ctx.shadowBlur = 16 * scale;
            ctx.stroke();

            // Lõi phát sáng
            ctx.beginPath();
            ctx.arc(screenX, screenY, Math.max(1, screenR * 0.35), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.35 + Math.sin(obj.pulse) * 0.2) + ')';
            ctx.fill();
          } else {
            // ĐÁM MÂY DÔNG BÃO FOMO (3D Dark Storm Cloud)
            ctx.beginPath();
            ctx.arc(screenX, screenY, Math.max(4, screenR * 1.1), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(30, 41, 59, ' + Math.min(0.9, 0.4 + (1 - obj.z / 2000)) + ')';
            ctx.shadowColor = '#F43F5E';
            ctx.shadowBlur = 8 * scale;
            ctx.fill();

            // Biểu tượng sấm sét bão
            if (scale > 0.3) {
              ctx.fillStyle = '#F59E0B';
              ctx.font = (16 * scale) + 'px sans-serif';
              ctx.fillText('⚡ FOMO', screenX - 25 * scale, screenY + 6 * scale);
            }
          }
          ctx.restore();
        }
      }

      // Cập nhật đồng hồ bay
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      document.getElementById('timeText').innerText = mins + ':' + secs;

      // Giả lập dao động độ cao & tốc độ
      altitude = Math.round(450 - cameraY * 0.15);
      document.getElementById('altText').innerText = Math.max(50, altitude);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  </script>
</body>
</html>`;
}

export const PigFly3DFlightModal: React.FC<PigFly3DFlightModalProps> = ({
  visible,
  onClose,
  streakDays = 1,
  userName = 'Tôi',
  onShareToSquad,
}) => {
  const { tokens } = useTheme();
  const webViewRef = useRef<WebView>(null);

  // Lọc danh sách thế giới theo Streak thực tế (Mario style)
  const { available, locked, currentBest } = useMemo(
    () => getAvailableWorlds(streakDays),
    [streakDays]
  );

  const [selectedWorld, setSelectedWorld] = useState<FlightWorld>(currentBest);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [summary, setSummary] = useState<FlightSummary | null>(null);

  // Số liệu chặng bay hiện tại
  const [currentRings, setCurrentRings] = useState<number>(0);
  const [currentStorms, setCurrentStorms] = useState<number>(0);
  const [flightStartTs, setFlightStartTs] = useState<number>(0);

  // Bắt đầu chuyến bay
  const handleStartFlight = (world: FlightWorld) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSelectedWorld(world);
    setCurrentRings(0);
    setCurrentStorms(0);
    setFlightStartTs(Date.now());
    setSummary(null);
    setIsPlaying(true);
  };

  // Kết thúc chuyến bay
  const handleFinishFlight = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const durationSec = Math.max(5, Math.floor((Date.now() - flightStartTs) / 1000));
    const result = calculateFlightScore(currentRings, currentStorms, durationSec, selectedWorld.id);
    setSummary(result);
    setIsPlaying(false);
  }, [currentRings, currentStorms, flightStartTs, selectedWorld]);

  // Nhận tin nhắn từ WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'RING_HIT') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCurrentRings(data.ringsPassed);
        if (data.ringsPassed >= 15) {
          handleFinishFlight();
        }
      } else if (data.type === 'STORM_HIT') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setCurrentStorms(data.stormHits);
      }
    } catch (_) {}
  };

  // Chia sẻ thành tích vào Squad Room
  const handleShareScore = () => {
    if (!summary) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const message = formatFlightShareMessage(userName, selectedWorld.name, summary.ringsPassed, summary.score);
    if (onShareToSquad) {
      onShareToSquad(message);
      Alert.alert('Đã Khoe Bạn Thân! 🐷🚀', 'Chiến tích bay 3D của bồ đã được gửi trực tiếp vào phòng trò chuyện của Squad!');
    }
  };

  const htmlSource = useMemo(() => build3DFlightSimulatorHTML(selectedWorld), [selectedWorld]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: '#0B0F19' }]}>
        {!isPlaying ? (
          /* MÀN HÌNH CHỌN THẾ GIỚI BAY (MARIO-STYLE WORLD SELECTOR) */
          <View style={styles.lobbyContainer}>
            {/* Header Lobby */}
            <View style={styles.lobbyHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <ArrowLeft size={22} color="#FFF" strokeWidth={2.4} />
              </TouchableOpacity>
              <View style={styles.titleGroup}>
                <Text style={styles.lobbyTitle}>PIGFLY 3D SIMULATOR</Text>
                <Text style={styles.lobbySub}>Góc Nhìn Thứ Nhất (FPS) · Phong Cách Mario World</Text>
              </View>
              <View style={styles.streakBadge}>
                <Flame size={14} color="#F43F5E" strokeWidth={2.6} />
                <Text style={styles.streakText}>{streakDays} Ngày</Text>
              </View>
            </View>

            {/* Bảng Kết Quả Vừa Hoàn Thành (Nếu có) */}
            {summary ? (
              <View style={styles.victoryCard}>
                <View style={styles.victoryHeader}>
                  <Trophy size={28} color="#F59E0B" strokeWidth={2.6} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.victoryTitle}>{summary.rankTitle}</Text>
                    <Text style={styles.victoryScore}>
                      +{summary.score.toLocaleString('vi-VN')} ĐIỂM BAY 🚀
                    </Text>
                  </View>
                </View>

                <View style={styles.victoryStatsRow}>
                  <View style={styles.victoryStat}>
                    <Text style={styles.victoryStatLabel}>Vòng Vàng</Text>
                    <Text style={styles.victoryStatVal}>{summary.ringsPassed}</Text>
                  </View>
                  <View style={styles.victoryStat}>
                    <Text style={styles.victoryStatLabel}>Né Mây Bão</Text>
                    <Text style={styles.victoryStatVal}>{summary.stormHits} lần</Text>
                  </View>
                  <View style={styles.victoryStat}>
                    <Text style={styles.victoryStatLabel}>Thời Gian</Text>
                    <Text style={styles.victoryStatVal}>{summary.flightDurationSec}s</Text>
                  </View>
                </View>

                {onShareToSquad && (
                  <TouchableOpacity
                    style={styles.shareBtn}
                    activeOpacity={0.85}
                    onPress={handleShareScore}
                  >
                    <Send size={16} color="#FFF" strokeWidth={2.4} />
                    <Text style={styles.shareBtnText}>Khoe Kỷ Lục Với Hội Bạn Squad</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            {/* Danh Sách Thế Giới Bay Mở Khóa Theo Streak */}
            <Text style={styles.sectionHeader}>CHỌN ĐƯỜNG BAY 3D ({available.length}/{FLIGHT_WORLDS.length} ĐÃ MỞ)</Text>

            <View style={styles.worldList}>
              {FLIGHT_WORLDS.map((w, idx) => {
                const isUnlocked = streakDays >= w.minStreak;
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[
                      styles.worldCard,
                      {
                        borderColor: isUnlocked ? w.ringColor : '#1E293B',
                        backgroundColor: isUnlocked ? '#131B2E' : '#0F172A',
                        opacity: isUnlocked ? 1 : 0.6,
                      },
                    ]}
                    activeOpacity={isUnlocked ? 0.8 : 1}
                    onPress={() => {
                      if (isUnlocked) {
                        handleStartFlight(w);
                      } else {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        Alert.alert(
                          'Đường Bay Đang Khóa 🔒',
                          `Cần duy trì chuỗi Streak ít nhất ${w.minStreak} ngày để mở khóa "${w.name}". Hiện tại bồ đang có ${streakDays} ngày!`
                        );
                      }
                    }}
                  >
                    <View style={styles.worldCardLeft}>
                      <View
                        style={[
                          styles.worldIconCircle,
                          { backgroundColor: isUnlocked ? w.ringColor : '#334155' },
                        ]}
                      >
                        <Text style={{ fontSize: 18 }}>{isUnlocked ? '✈️' : '🔒'}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.worldName}>{w.name}</Text>
                          <Text
                            style={[
                              styles.worldBadge,
                              { color: isUnlocked ? w.ringColor : '#94A3B8' },
                            ]}
                          >
                            {w.badgeLabel}
                          </Text>
                        </View>
                        <Text style={styles.worldDesc} numberOfLines={1}>
                          {w.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.worldCardRight}>
                      {isUnlocked ? (
                        <View style={styles.playChip}>
                          <Play size={14} color="#FFF" fill="#FFF" />
                          <Text style={styles.playChipText}>BAY NGAY</Text>
                        </View>
                      ) : (
                        <Text style={styles.lockText}>Streak {w.minStreak}N</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          /* MÀN HÌNH GAME 3D FPS SIMULATOR ĐANG BAY */
          <View style={{ flex: 1 }}>
            {/* Nút thoát chuyến bay */}
            <View style={styles.gameTopBar}>
              <TouchableOpacity
                style={styles.exitFlightBtn}
                onPress={handleFinishFlight}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X size={20} color="#FFF" strokeWidth={2.6} />
                <Text style={styles.exitFlightText}>Hạ Cánh & Tổng Kết</Text>
              </TouchableOpacity>
              <Text style={styles.worldPlayingTitle}>{selectedWorld.name}</Text>
            </View>

            {/* WebGL 3D Canvas WebView */}
            <SafeWebView
              ref={webViewRef as any}
              originWhitelist={['*']}
              source={{ html: htmlSource }}
              style={{ flex: 1, backgroundColor: selectedWorld.skyBottomColor }}
              onMessage={handleWebViewMessage}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled
              domStorageEnabled
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lobbyContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  lobbyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    padding: 6,
    marginRight: 10,
  },
  titleGroup: {
    flex: 1,
  },
  lobbyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  lobbySub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    gap: 4,
  },
  streakText: {
    color: '#F43F5E',
    fontWeight: '800',
    fontSize: 12,
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  worldList: {
    gap: 12,
  },
  worldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  worldCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  worldIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  worldBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  worldDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  worldCardRight: {
    marginLeft: 10,
  },
  playChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F43F5E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  playChipText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 11,
  },
  lockText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 11,
  },
  gameTopBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    left: 16,
    right: 16,
    zIndex: 99,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exitFlightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  exitFlightText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  worldPlayingTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  victoryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  victoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  victoryTitle: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '800',
  },
  victoryScore: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  victoryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  victoryStat: {
    alignItems: 'center',
    flex: 1,
  },
  victoryStatLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  victoryStatVal: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F43F5E',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
  },
  shareBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
