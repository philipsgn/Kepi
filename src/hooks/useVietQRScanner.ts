import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseVietQR, VietQRPayload } from '../utils/qr/emvParser';
import {
  detectEWalletQR,
  openEWalletApp,
  EWalletDetectionResult,
} from '../utils/qr/walletDeeplink';
import {
  openBankAppByTier,
  SUPPORTED_BANKS,
  getBankByBin,
  getBankShortCode,
} from '../utils/qr/bankDeeplink';
import { useTransactionStore } from '../store/transactionStore';
import { Transaction } from '../types/database';
import { trackEvent } from '../services/analytics';
import {
  isBankNoAutofill,
  markBankNoAutofill,
  recordPrefillReport,
} from '../services/bankCapabilityService';
import { STORAGE_KEY_QR_AUTO_OPEN } from '../components/profile/QRPaySettingsCard';

export const STORAGE_KEY_ACTIVE_HANDOFF_SESSION = '@vilocket_active_handoff_session';

export interface ActiveHandoffSession {
  pendingId: string;
  payeeName: string;
  amount: number;
  bankAppId: string;
  startedAt: number;
}

export type CameraMode = 'EXPENSE' | 'INCOME' | 'INTEND';

export interface ProceedPayOptions {
  isManualSelfPay?: boolean;
  isNoAutofill?: boolean;
}

interface UseVietQRScannerOptions {
  isCameraActive: boolean;
  cameraMode: CameraMode;
  onTriggerActualPrice?: (amount: number, payeeName?: string, onContinuePay?: () => void) => void;
  actualPriceThreshold?: number; // Default 200.000 đ
}

export function useVietQRScanner({
  isCameraActive,
  cameraMode,
  onTriggerActualPrice,
  actualPriceThreshold = 200000,
}: UseVietQRScannerOptions) {
  const [detectedPayload, setDetectedPayload] = useState<VietQRPayload | null>(null);
  const [detectedWalletPayload, setDetectedWalletPayload] = useState<EWalletDetectionResult | null>(null);
  const [activePendingTx, setActivePendingTx] = useState<Transaction | null>(null);
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);

  const lastScannedRawRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const waitingForBankReturnRef = useRef<boolean>(false);

  const {
    addTransaction,
    confirmPendingTransaction,
    cancelPendingTransaction,
    getPendingTransactions,
  } = useTransactionStore();

  // Kiểm tra & khôi phục phiên giao dịch dở dang (Phòng ngừa bị OS Kill RAM trong vòng 15 phút)
  const checkAndRestoreHandoffSession = useCallback(async () => {
    try {
      const rawSession = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_HANDOFF_SESSION);
      if (!rawSession) return false;

      const session: ActiveHandoffSession = JSON.parse(rawSession);
      const maxAgeMs = 15 * 60 * 1000; // 15 phút
      const elapsed = Date.now() - session.startedAt;

      if (elapsed <= maxAgeMs) {
        const pendingList = getPendingTransactions();
        const matched = pendingList.find((p) => p.id === session.pendingId) || pendingList[0];
        if (matched) {
          setActivePendingTx(matched);
          setShowReturnPrompt(true);
          return true;
        }
      } else {
        // Hết hạn 15 phút -> Dọn dẹp session
        await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_HANDOFF_SESSION);
      }
    } catch {}
    return false;
  }, [getPendingTransactions]);

  // Kiểm tra ngay khi hook mount
  useEffect(() => {
    checkAndRestoreHandoffSession();
  }, [checkAndRestoreHandoffSession]);

  // 1. Barcode scanning callback from CameraView
  const handleBarcodeScanned = useCallback(
    ({ data: raw }: { data: string }) => {
      if (!isCameraActive) return;
      if (cameraMode !== 'EXPENSE' && cameraMode !== 'INTEND') return;

      const now = Date.now();
      // Debounce: 3 seconds before re-scanning the same code
      if (
        lastScannedRawRef.current === raw &&
        now - lastScannedTimeRef.current < 3000
      ) {
        return;
      }

      if (detectedPayload || detectedWalletPayload) return;

      lastScannedRawRef.current = raw;
      lastScannedTimeRef.current = now;

      // 1.1 Thử Parse VietQR Offline
      const result = parseVietQR(raw);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setDetectedPayload(result.data);
        setDetectedWalletPayload(null);
        return;
      }

      // 1.2 Thử Nhận diện Ví Điện Tử (ZaloPay & MoMo) Whitelist
      const walletResult = detectEWalletQR(raw);
      if (walletResult.isEWallet) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setDetectedWalletPayload(walletResult);
        setDetectedPayload(null);
        return;
      }
    },
    [isCameraActive, cameraMode, detectedPayload, detectedWalletPayload]
  );

  // 2. Dismiss detected card
  const handleDismissCard = useCallback(() => {
    setDetectedPayload(null);
    setDetectedWalletPayload(null);
  }, []);

  // 3. User taps "Mở [ngân hàng]" or "Tự mở app"
  const handleProceedPay = useCallback(
    async (
      amount: number,
      bankAppId: string,
      note?: string,
      options?: ProceedPayOptions
    ) => {
      if (!detectedPayload) return;

      const executeLaunch = async () => {
        const bankCode = getBankShortCode(detectedPayload.bankBin, bankAppId);
        const bankTag = bankCode ? `[${bankCode}]` : '';
        const cleanPayee = detectedPayload.payeeName ? ` ${detectedPayload.payeeName}` : '';
        const finalDesc = bankTag ? `${bankTag}${cleanPayee}`.trim() : (detectedPayload.payeeName || 'Chuyển khoản VietQR');

        const pendingTx = await addTransaction({
          userId: 'current-user',
          type: 'EXPENSE',
          amount,
          category: detectedPayload.suggestedCategory || 'Ăn uống',
          description: finalDesc,
          photo_url: null,
          thumbnail_url: null,
          payment_method: 'BANK',
          source: 'QR',
          status: 'PENDING',
          payee_name: detectedPayload.payeeName,
          bank_bin: detectedPayload.bankBin,
          qr_kind: detectedPayload.kind,
          pending_expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        });

        setActivePendingTx(pendingTx);
        waitingForBankReturnRef.current = true;
        setDetectedPayload(null);

        // Lưu phiên giao dịch bền vững vào AsyncStorage (phòng OS kill RAM)
        const session: ActiveHandoffSession = {
          pendingId: pendingTx.id,
          payeeName: detectedPayload.payeeName || 'Điểm Chấp Nhận VietQR',
          amount,
          bankAppId,
          startedAt: Date.now(),
        };
        await AsyncStorage.setItem(
          STORAGE_KEY_ACTIVE_HANDOFF_SESSION,
          JSON.stringify(session)
        );

        const bankMeta = SUPPORTED_BANKS[bankAppId] || SUPPORTED_BANKS.tcb;

        // Tier 3: Manual self-pay -> Do not open any app
        if (options?.isManualSelfPay) {
          return;
        }

        const isNoAuto =
          options?.isNoAutofill !== undefined
            ? options.isNoAutofill
            : await isBankNoAutofill(bankAppId);

        const rawAutoOpen = await AsyncStorage.getItem(STORAGE_KEY_QR_AUTO_OPEN);
        const allowPrefill = rawAutoOpen !== null ? rawAutoOpen === 'true' : true;

        // Anonymous Telemetry (Zero PII)
        trackEvent('qr_bank_opened', { bankCode: bankAppId, isNoAutofill: isNoAuto });
        await recordPrefillReport(bankAppId, 'OPENED');

        const openResult = await openBankAppByTier(bankMeta, {
          accountRef: detectedPayload.accountRef,
          bankBin: detectedPayload.bankBin,
          amount,
          note: note || detectedPayload.note,
          payeeName: detectedPayload.payeeName,
          pendingId: pendingTx.id,
          isNoAutofill: isNoAuto,
          allowPrefill,
        });

        if (!openResult.success) {
          Alert.alert(
            'Mở thủ công nhé',
            openResult.error || 'Không mở được app ngân hàng. Mở thủ công nhé. Khoản chi tiêu vẫn được lưu an toàn trong Hộp xác nhận.',
            [{ text: 'Đã hiểu' }]
          );
        }
      };

      // Check "Định mua" threshold (>= 200k)
      if (
        cameraMode === 'INTEND' &&
        amount >= actualPriceThreshold &&
        onTriggerActualPrice
      ) {
        onTriggerActualPrice(amount, detectedPayload.payeeName, executeLaunch);
      } else {
        await executeLaunch();
      }
    },
    [
      detectedPayload,
      cameraMode,
      actualPriceThreshold,
      onTriggerActualPrice,
      addTransaction,
    ]
  );

  // 3.1 User taps "Mở ZaloPay" hoặc "Mở MoMo"
  const handleProceedWalletPay = useCallback(
    async (amount: number, note?: string) => {
      if (!detectedWalletPayload || !detectedWalletPayload.walletType) return;

      const currentWallet = detectedWalletPayload;
      const executeLaunch = async () => {
        // Tạo PENDING transaction với payment_method: 'E_WALLET'
        const pendingTx = await addTransaction({
          userId: 'current-user',
          type: 'EXPENSE',
          amount,
          category: 'Ăn uống',
          description:
            note
              ? `[${currentWallet.walletName}] ${note}`
              : currentWallet.payeeName
              ? `[${currentWallet.walletName}] ${currentWallet.payeeName}`
              : `[${currentWallet.walletName}] Thanh toán`,
          photo_url: null,
          thumbnail_url: null,
          payment_method: 'E_WALLET',
          source: 'QR',
          status: 'PENDING',
          payee_name: currentWallet.payeeName,
          bank_bin: null,
          qr_kind: 'DYNAMIC',
          pending_expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        });

        setActivePendingTx(pendingTx);
        waitingForBankReturnRef.current = true;
        setDetectedWalletPayload(null);

        // Lưu phiên giao dịch bền vững vào AsyncStorage (phòng OS kill RAM)
        const session: ActiveHandoffSession = {
          pendingId: pendingTx.id,
          payeeName: currentWallet.payeeName || currentWallet.walletName || 'Ví Điện Tử',
          amount,
          bankAppId: currentWallet.walletType || 'WALLET',
          startedAt: Date.now(),
        };
        await AsyncStorage.setItem(
          STORAGE_KEY_ACTIVE_HANDOFF_SESSION,
          JSON.stringify(session)
        );

        trackEvent('wallet_opened', { wallet: currentWallet.walletType || 'WALLET' });

        const openResult = await openEWalletApp(
          currentWallet.walletType!,
          currentWallet.targetUrl || ''
        );

        if (!openResult.success) {
          Alert.alert(
            'Mở thủ công nhé',
            openResult.error ||
              `Không mở được app ${currentWallet.walletName}. Bạn mở thủ công nhé. Khoản chi tiêu vẫn được lưu an toàn trong Hộp xác nhận.`,
            [{ text: 'Đã hiểu' }]
          );
        }
      };

      // Check "Định mua" threshold (>= 200k)
      if (
        cameraMode === 'INTEND' &&
        amount >= actualPriceThreshold &&
        onTriggerActualPrice
      ) {
        onTriggerActualPrice(amount, currentWallet.payeeName, executeLaunch);
      } else {
        await executeLaunch();
      }
    },
    [
      detectedWalletPayload,
      cameraMode,
      actualPriceThreshold,
      onTriggerActualPrice,
      addTransaction,
    ]
  );

  // 4. AppState listener: Detect when user returns from banking or wallet app
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const restored = await checkAndRestoreHandoffSession();
        if (!restored) {
          const pendingList = getPendingTransactions();
          if (pendingList.length > 0) {
            const latestPending = pendingList[0];
            setActivePendingTx(latestPending);
            setShowReturnPrompt(true);
            waitingForBankReturnRef.current = false;
          }
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [getPendingTransactions, checkAndRestoreHandoffSession]);

  // 5. Actions for Pending Return Modal
  const handleConfirmPending = useCallback(
    async (txId: string, updatedAmount?: number) => {
      await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_HANDOFF_SESSION);
      await confirmPendingTransaction(txId, updatedAmount);
      setShowReturnPrompt(false);
      setActivePendingTx(null);
    },
    [confirmPendingTransaction]
  );

  const handleCancelPending = useCallback(
    async (txId: string) => {
      await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_HANDOFF_SESSION);
      await cancelPendingTransaction(txId);
      setShowReturnPrompt(false);
      setActivePendingTx(null);
    },
    [cancelPendingTransaction]
  );

  const handleReportNoAutofill = useCallback(
    async (txId: string, bankCode?: string) => {
      const rawCode = bankCode || activePendingTx?.bank_bin || 'tcb';
      const matched = getBankByBin(rawCode) || SUPPORTED_BANKS[rawCode.toLowerCase()];
      const finalAppId = matched?.appId || rawCode.toLowerCase();

      await markBankNoAutofill(finalAppId);
      await recordPrefillReport(finalAppId, 'REPORTED_NO');
      trackEvent('qr_prefill_reported_no', { bankCode: finalAppId });
    },
    [activePendingTx]
  );

  const activatePendingById = useCallback(
    (pendingId: string) => {
      const list = getPendingTransactions();
      const matched = list.find((p) => p.id === pendingId);
      if (matched) {
        setActivePendingTx(matched);
        setShowReturnPrompt(true);
      }
    },
    [getPendingTransactions]
  );

  return {
    detectedPayload,
    detectedWalletPayload,
    handleBarcodeScanned,
    handleDismissCard,
    handleProceedPay,
    handleProceedWalletPay,
    activePendingTx,
    showReturnPrompt,
    handleConfirmPending,
    handleCancelPending,
    handleReportNoAutofill,
    setShowReturnPrompt,
    activatePendingById,
  };
}
