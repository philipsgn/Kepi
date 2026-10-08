import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Clock, Calculator, DollarSign, X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { calculateHourlyRate } from '../../utils/profileUtils';
import { formatVND } from '../../utils/currency';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface HourlyWageModalProps {
  visible: boolean;
  currentHourlyRate: number;
  monthlyIncome: number;
  onClose: () => void;
  onSave: (newRate: number) => void;
}

export const HourlyWageModal: React.FC<HourlyWageModalProps> = ({
  visible,
  currentHourlyRate,
  monthlyIncome,
  onClose,
  onSave,
}) => {
  const { tokens } = useTheme();
  const [activeTab, setActiveTab] = useState<'AUTO' | 'MANUAL'>('AUTO');

  // Auto calc state
  const [workDays, setWorkDays] = useState('22');
  const [hoursPerDay, setHoursPerDay] = useState('8');

  // Manual rate input
  const [manualRateInput, setManualRateInput] = useState(
    currentHourlyRate > 0 ? currentHourlyRate.toString() : ''
  );

  useEffect(() => {
    if (visible) {
      setManualRateInput(currentHourlyRate > 0 ? currentHourlyRate.toString() : '');
    }
  }, [visible, currentHourlyRate]);

  // Derived auto calculated rate
  const parsedWorkDays = parseInt(workDays, 10) || 22;
  const parsedHours = parseInt(hoursPerDay, 10) || 8;
  const autoCalculated = calculateHourlyRate(monthlyIncome, parsedWorkDays, parsedHours);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (activeTab === 'AUTO') {
      onSave(autoCalculated);
    } else {
      const cleanManual = parseInt(manualRateInput.replace(/\D/g, ''), 10) || 0;
      onSave(cleanManual);
    }
    onClose();
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
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: tokens.surface,
                  borderColor: tokens.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleWrap}>
                  <Clock size={18} color={tokens.primary} style={styles.icon} />
                  <Text style={[styles.title, { color: tokens.text }]}>
                    {Strings.profile.hourlyRateModalTitle}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color={tokens.textSub} />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View
                style={[
                  styles.tabContainer,
                  { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    activeTab === 'AUTO' && {
                      backgroundColor: tokens.surface,
                      borderColor: tokens.primary,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab('AUTO');
                  }}
                >
                  <Calculator
                    size={14}
                    color={activeTab === 'AUTO' ? tokens.primary : tokens.textSub}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: activeTab === 'AUTO' ? tokens.primary : tokens.textSub,
                        fontWeight: activeTab === 'AUTO' ? '700' : '500',
                      },
                    ]}
                  >
                    {Strings.profile.autoCalcTab}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    activeTab === 'MANUAL' && {
                      backgroundColor: tokens.surface,
                      borderColor: tokens.primary,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab('MANUAL');
                  }}
                >
                  <DollarSign
                    size={14}
                    color={activeTab === 'MANUAL' ? tokens.primary : tokens.textSub}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: activeTab === 'MANUAL' ? tokens.primary : tokens.textSub,
                        fontWeight: activeTab === 'MANUAL' ? '700' : '500',
                      },
                    ]}
                  >
                    {Strings.profile.customRateTab}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab 1: Auto Calculate */}
              {activeTab === 'AUTO' ? (
                <View style={styles.tabContent}>
                  <Text style={[styles.hintText, { color: tokens.textSub }]}>
                    Dựa trên thu nhập tháng{' '}
                    <Text style={{ color: tokens.primary, fontWeight: '700' }}>
                      {formatVND(monthlyIncome)}
                    </Text>
                  </Text>

                  <View style={styles.inputsRow}>
                    <View style={styles.inputCol}>
                      <Text style={[styles.inputLabel, { color: tokens.textSub }]}>
                        {Strings.profile.workDaysPerMonthLabel}
                      </Text>
                      <TextInput
                        style={[
                          styles.inputField,
                          {
                            color: tokens.text,
                            backgroundColor: tokens.surfaceAlt,
                            borderColor: tokens.border,
                          },
                        ]}
                        value={workDays}
                        onChangeText={setWorkDays}
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                    </View>

                    <View style={styles.inputCol}>
                      <Text style={[styles.inputLabel, { color: tokens.textSub }]}>
                        {Strings.profile.workHoursPerDayLabel}
                      </Text>
                      <TextInput
                        style={[
                          styles.inputField,
                          {
                            color: tokens.text,
                            backgroundColor: tokens.surfaceAlt,
                            borderColor: tokens.border,
                          },
                        ]}
                        value={hoursPerDay}
                        onChangeText={setHoursPerDay}
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.resultBox,
                      { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                    ]}
                  >
                    <Text style={[styles.resultLabel, { color: tokens.textSub }]}>
                      Mức lương giờ tính được:
                    </Text>
                    <Text style={[styles.resultValue, { color: tokens.primary }]}>
                      {formatVND(autoCalculated)} / giờ
                    </Text>
                  </View>
                </View>
              ) : (
                /* Tab 2: Manual Custom Rate */
                <View style={styles.tabContent}>
                  <Text style={[styles.inputLabel, { color: tokens.textSub, marginBottom: 8 }]}>
                    {Strings.profile.hourlyRateLabel}
                  </Text>
                  <TextInput
                    style={[
                      styles.fullInputField,
                      {
                        color: tokens.text,
                        backgroundColor: tokens.surfaceAlt,
                        borderColor: tokens.border,
                      },
                    ]}
                    placeholder={Strings.profile.hourlyRatePlaceholder}
                    placeholderTextColor={tokens.textMuted}
                    value={manualRateInput}
                    onChangeText={(val) => {
                      const digits = val.replace(/\D/g, '');
                      setManualRateInput(digits ? parseInt(digits, 10).toLocaleString('vi-VN') : '');
                    }}
                    keyboardType="number-pad"
                    autoFocus
                  />
                  <Text style={[styles.hintText, { color: tokens.textSub, marginTop: 8 }]}>
                    Ví dụ: 50.000 đ/giờ (Part-time), 100.000 đ/giờ (Full-time)
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: tokens.border }]}
                  onPress={onClose}
                >
                  <Text style={[styles.cancelBtnText, { color: tokens.textSub }]}>
                    {Strings.common.cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: tokens.primary }]}
                  onPress={handleSave}
                >
                  <Check size={16} color={tokens.textOnPrimary} />
                  <Text style={[styles.saveBtnText, { color: tokens.textOnPrimary }]}>
                    {Strings.profile.saveHourlyRateBtn}
                  </Text>
                </TouchableOpacity>
              </View>
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
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  tabText: {
    fontSize: 12,
  },
  tabContent: {
    marginBottom: 20,
  },
  hintText: {
    fontSize: 12,
    marginBottom: 12,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputField: {
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  fullInputField: {
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  resultBox: {
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E1620',
  },
});
