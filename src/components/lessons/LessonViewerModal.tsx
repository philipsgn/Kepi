import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BookOpen, CheckCircle, Clock, Sparkles, Trophy, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { Typography } from '../../constants/typography';
import { MicroLesson, useLessonStore } from '../../store/lessonStore';
import { ChunkyButton } from '../common/ChunkyButton';

interface LessonViewerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LessonViewerModal: React.FC<LessonViewerModalProps> = ({
  visible,
  onClose,
}) => {
  const { lessons, totalExp, completeLesson, getFinancialTier } = useLessonStore();
  const [selectedLesson, setSelectedLesson] = useState<MicroLesson | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const tier = getFinancialTier();

  const handleSelectLesson = (lesson: MicroLesson) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLesson(lesson);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setIsCorrect(false);
  };

  const handleBackToList = () => {
    setSelectedLesson(null);
    setSelectedOption(null);
    setQuizSubmitted(false);
  };

  const handleSelectOption = (index: number) => {
    if (quizSubmitted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(index);
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null || !selectedLesson) return;
    const correct = selectedOption === selectedLesson.quiz.correctIndex;
    setIsCorrect(correct);
    setQuizSubmitted(true);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      completeLesson(selectedLesson.id);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalCard}>
              {/* NÚT ĐÓNG */}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <X size={18} color={Colors.textCharcoal} />
              </TouchableOpacity>

              {/* HEADER DANH HIỆU & EXP */}
              <View style={styles.headerRow}>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierEmoji}>{tier.badgeEmoji}</Text>
                  <Text style={styles.tierText}>{tier.tierName}</Text>
                </View>
                <View style={styles.expBadge}>
                  <Sparkles size={14} color={Colors.accentGold} />
                  <Text style={styles.expText}>{totalExp} điểm</Text>
                </View>
              </View>

              {selectedLesson ? (
                // 1. CHI TIẾT BÀI HỌC 1 PHÚT & TRẮC NGHIỆM
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
                  <TouchableOpacity style={styles.backBtn} onPress={handleBackToList} activeOpacity={0.7}>
                    <Text style={styles.backBtnText}>‹ Quay lại danh sách bài học</Text>
                  </TouchableOpacity>

                  <View style={styles.lessonDetailHeader}>
                    <Text style={[Typography.heading2, styles.lessonTitle]}>
                      {selectedLesson.title}
                    </Text>
                    <View style={styles.timeTag}>
                      <Clock size={12} color={Colors.accentGold} />
                      <Text style={styles.timeTagText}>{selectedLesson.readTime}</Text>
                    </View>
                  </View>

                  <Text style={styles.lessonTagline}>{selectedLesson.tagline}</Text>

                  {/* THẺ Ý CHÍNH */}
                  <View style={styles.contentCard}>
                    {selectedLesson.content.map((point, index) => (
                      <View key={index} style={styles.pointRow}>
                        <View style={styles.pointNumber}>
                          <Text style={styles.pointNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.pointText}>{point}</Text>
                      </View>
                    ))}
                  </View>

                  {/* CÂU HỎI TRẮC NGHIỆM MINI */}
                  <View style={styles.quizCard}>
                    <View style={styles.quizHeader}>
                      <Trophy size={16} color={Colors.gameYellow} />
                      <Text style={styles.quizTitle}>TRẮC NGHIỆM 30S (+50 EXP):</Text>
                    </View>
                    <Text style={styles.quizQuestion}>{selectedLesson.quiz.question}</Text>

                    <View style={styles.optionsList}>
                      {selectedLesson.quiz.options.map((opt, idx) => {
                        let optBg = '#FFFFFF';
                        let optBorder = 'rgba(0, 0, 0, 0.08)';

                        if (selectedOption === idx) {
                          optBg = 'rgba(229, 152, 68, 0.12)';
                          optBorder = Colors.accentGold;
                        }
                        if (quizSubmitted) {
                          if (idx === selectedLesson.quiz.correctIndex) {
                            optBg = 'rgba(126, 159, 128, 0.18)';
                            optBorder = Colors.incomeMint;
                          } else if (selectedOption === idx && !isCorrect) {
                            optBg = 'rgba(200, 109, 81, 0.18)';
                            optBorder = Colors.expenseCoral;
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[styles.optionItem, { backgroundColor: optBg, borderColor: optBorder }]}
                            onPress={() => handleSelectOption(idx)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.optionText}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {quizSubmitted ? (
                      <View style={styles.feedbackBox}>
                        <Text
                          style={[
                            styles.feedbackTitle,
                            { color: isCorrect ? Colors.incomeMint : Colors.expenseCoral },
                          ]}
                        >
                          {isCorrect ? '🎉 Chính xác! +50 EXP' : '💡 Chưa đúng rồi nè!'}
                        </Text>
                        <Text style={styles.feedbackDesc}>{selectedLesson.quiz.explanation}</Text>
                      </View>
                    ) : (
                      <ChunkyButton
                        title="Kiểm Tra Đáp Án"
                        variant="gold"
                        size="md"
                        disabled={selectedOption === null}
                        onPress={handleSubmitQuiz}
                        style={{ marginTop: Spacing.md, width: '100%' }}
                      />
                    )}
                  </View>
                </ScrollView>
              ) : (
                // 2. DANH SÁCH BÀI HỌC MICRO
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScroll}>
                  <Text style={[Typography.heading3, styles.sectionTitle]}>
                    Bài Học Tài Chính Bỏ Túi 1 Phút
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Học nhanh mẹo sinh tồn ví tiền dành riêng cho Gen Z
                  </Text>

                  {lessons.map((lesson) => (
                    <TouchableOpacity
                      key={lesson.id}
                      style={styles.lessonCard}
                      onPress={() => handleSelectLesson(lesson)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.lessonCardTop}>
                        <View style={styles.lessonCategoryBadge}>
                          <BookOpen size={12} color={Colors.accentGold} />
                          <Text style={styles.lessonCategoryText}>{lesson.readTime}</Text>
                        </View>
                        {lesson.isCompleted ? (
                          <View style={styles.completedBadge}>
                            <CheckCircle size={14} color={Colors.incomeMint} />
                            <Text style={styles.completedText}>Đã hoàn thành</Text>
                          </View>
                        ) : (
                          <View style={styles.rewardBadge}>
                            <Sparkles size={12} color={Colors.gameYellow} />
                            <Text style={styles.rewardText}>+{lesson.expReward} điểm</Text>
                          </View>
                        )}
                      </View>

                      <Text style={[Typography.heading3, styles.cardTitle]}>
                        {lesson.title}
                      </Text>
                      <Text style={styles.cardTagline}>{lesson.tagline}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.tapOutsideHint}>Chạm vào vùng tối bên ngoài để đóng</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: Colors.bgPrimary,
    borderRadius: BorderRadius.chunky,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Shadows.floating,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingRight: 40,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    ...Shadows.soft,
  },
  tierEmoji: {
    fontSize: 14,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textCharcoal,
  },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(229, 152, 68, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  expText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accentGold,
  },
  sectionTitle: {
    color: Colors.textCharcoal,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  listScroll: {
    paddingBottom: Spacing.md,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Shadows.soft,
  },
  lessonCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  lessonCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonCategoryText: {
    fontSize: 11,
    color: Colors.accentGold,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 11,
    color: Colors.incomeMint,
    fontWeight: '700',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 176, 65, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  rewardText: {
    fontSize: 11,
    color: '#B87228',
    fontWeight: '800',
  },
  cardTitle: {
    color: Colors.textCharcoal,
    fontSize: 15,
    marginTop: 2,
  },
  cardTagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  detailScroll: {
    paddingBottom: Spacing.lg,
  },
  backBtn: {
    marginBottom: Spacing.sm,
  },
  backBtnText: {
    fontSize: 13,
    color: Colors.accentGold,
    fontWeight: '700',
  },
  lessonDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonTitle: {
    color: Colors.textCharcoal,
    fontSize: 18,
    flex: 1,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(229, 152, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentGold,
  },
  lessonTagline: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Shadows.soft,
    gap: 12,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pointNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(229, 152, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pointNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentGold,
  },
  pointText: {
    fontSize: 13,
    color: Colors.textCharcoal,
    lineHeight: 20,
    flex: 1,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Shadows.soft,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  quizTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.gameYellow,
    letterSpacing: 0.5,
  },
  quizQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textCharcoal,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 13,
    color: Colors.textCharcoal,
    lineHeight: 18,
    fontWeight: '500',
  },
  feedbackBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.bgPrimary,
    borderRadius: BorderRadius.md,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tapOutsideHint: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
