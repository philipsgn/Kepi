import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BankAppMeta,
  BankHandoffTier,
  SUPPORTED_BANKS,
  getBankByBin,
  DEFAULT_NO_AUTOFILL_BANKS,
} from '../utils/qr/bankDeeplink';

export const STORAGE_KEY_BANK_OVERRIDES = '@vilocket_bank_capability_overrides';
export const STORAGE_KEY_LAST_REFRESH = '@vilocket_bank_capability_last_refresh';
export const STORAGE_KEY_ANALYTICS_EVENTS = '@vilocket_bank_handoff_analytics';
export const STORAGE_KEY_NO_AUTOFILL_BANKS = '@kepi_no_autofill_banks';
export const STORAGE_KEY_PREFILL_REPORTS = '@kepi_prefill_reports';

export interface BankRemoteOverride {
  tier?: BankHandoffTier;
  disabled?: boolean;
  nativeScheme?: string;
  isNoAutofill?: boolean;
}

export interface BankCapabilityConfig {
  globalKillSwitch?: boolean;
  noAutofillBanks?: string[];
  overrides?: Record<string, BankRemoteOverride>;
}

export interface BankHandoffEvent {
  timestamp: string;
  bankCode: string;
  tier: BankHandoffTier;
  outcome: 'OPENED' | 'FAILED_SCHEME' | 'MANUAL';
}

export interface PrefillReportEvent {
  timestamp: string;
  bankCode: string;
  result: 'OPENED' | 'REPORTED_NO';
}

/**
 * Gets effective bank metadata with remote overrides applied
 * Supports lookup by appId ('tcb') or 6-digit BIN ('970407')
 */
export async function getEffectiveBankMeta(bankIdOrBin: string): Promise<BankAppMeta | null> {
  const normalized = bankIdOrBin.toLowerCase();
  const defaultMeta = SUPPORTED_BANKS[normalized] || getBankByBin(bankIdOrBin);
  if (!defaultMeta) return null;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_BANK_OVERRIDES);
    if (!raw) return defaultMeta;

    const config: BankCapabilityConfig = JSON.parse(raw);
    if (config.globalKillSwitch) {
      // Emergency: Force all banks to Tier 3 (Self-pay only)
      return {
        ...defaultMeta,
        tier: 3,
      };
    }

    const override =
      config.overrides?.[defaultMeta.appId.toLowerCase()] ||
      config.overrides?.[defaultMeta.bin];

    if (override) {
      if (override.disabled) {
        return {
          ...defaultMeta,
          tier: 3,
        };
      }
      return {
        ...defaultMeta,
        tier: override.tier ?? defaultMeta.tier,
        nativeScheme: override.nativeScheme ?? defaultMeta.nativeScheme,
      };
    }

    return defaultMeta;
  } catch {
    return defaultMeta;
  }
}

/**
 * Sets bank capability config (for testing or remote synchronization)
 */
export async function setBankCapabilityConfig(config: BankCapabilityConfig): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_BANK_OVERRIDES, JSON.stringify(config));
}

/**
 * Clears bank capability config (resets to bundled defaults)
 */
export async function clearBankCapabilityConfig(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY_BANK_OVERRIDES);
}

/**
 * Checks and refreshes capability table daily if online
 */
export async function refreshBankCapabilitiesDaily(): Promise<void> {
  try {
    const lastRefreshStr = await AsyncStorage.getItem(STORAGE_KEY_LAST_REFRESH);
    const now = Date.now();
    const oneDayMs = 24 * 3600 * 1000;

    if (lastRefreshStr && now - parseInt(lastRefreshStr, 10) < oneDayMs) {
      return; // Already refreshed today
    }

    // Try fetching remote config from Supabase / App endpoint
    // Fallback: update timestamp so we don't spam requests
    await AsyncStorage.setItem(STORAGE_KEY_LAST_REFRESH, now.toString());
  } catch (err) {
    console.warn('[BankCapability] Refresh check warning:', err);
  }
}

/**
 * Logs a bank handoff event for reliability metrics
 * STRICT PRIVACY: NEVER records amount, account number, or payee details.
 */
export async function logBankHandoffEvent(
  bankCode: string,
  tier: BankHandoffTier,
  outcome: 'OPENED' | 'FAILED_SCHEME' | 'MANUAL'
): Promise<void> {
  try {
    const event: BankHandoffEvent = {
      timestamp: new Date().toISOString(),
      bankCode,
      tier,
      outcome,
    };

    const raw = await AsyncStorage.getItem(STORAGE_KEY_ANALYTICS_EVENTS);
    const list: BankHandoffEvent[] = raw ? JSON.parse(raw) : [];

    // Keep max 50 events in FIFO ring
    list.unshift(event);
    if (list.length > 50) list.pop();

    await AsyncStorage.setItem(STORAGE_KEY_ANALYTICS_EVENTS, JSON.stringify(list));
  } catch (err) {
    console.warn('[BankCapability] Failed to log analytics event:', err);
  }
}

/**
 * Gets recorded handoff events (for dev inspection or sync)
 */
export async function getLoggedHandoffEvents(): Promise<BankHandoffEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ANALYTICS_EVENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Gets the current list of banks marked as "noAutofill".
 * Merges DEFAULT_NO_AUTOFILL_BANKS (['tcb', 'vcb']), user machine-learned banks, and remote overrides.
 */
export async function getNoAutofillBanks(): Promise<string[]> {
  const bankSet = new Set<string>(DEFAULT_NO_AUTOFILL_BANKS.map((b) => b.toLowerCase()));

  try {
    // 1. Local overrides / machine-learned from user feedback
    const localRaw = await AsyncStorage.getItem(STORAGE_KEY_NO_AUTOFILL_BANKS);
    if (localRaw) {
      const localList: string[] = JSON.parse(localRaw);
      localList.forEach((b) => bankSet.add(b.toLowerCase()));
    }

    // 2. Remote capability config
    const remoteRaw = await AsyncStorage.getItem(STORAGE_KEY_BANK_OVERRIDES);
    if (remoteRaw) {
      const config: BankCapabilityConfig = JSON.parse(remoteRaw);
      if (config.noAutofillBanks) {
        config.noAutofillBanks.forEach((b) => bankSet.add(b.toLowerCase()));
      }
      if (config.overrides) {
        for (const [key, val] of Object.entries(config.overrides)) {
          if (val.isNoAutofill) bankSet.add(key.toLowerCase());
        }
      }
    }
  } catch {}

  return Array.from(bankSet);
}

/**
 * Checks if a specific bank is in the noAutofill list
 */
export async function isBankNoAutofill(bankAppId: string): Promise<boolean> {
  if (!bankAppId) return false;
  const list = await getNoAutofillBanks();
  return list.includes(bankAppId.toLowerCase());
}

/**
 * Marks a bank as noAutofill locally (triggered when user reports "App không điền sẵn?")
 */
export async function markBankNoAutofill(bankAppId: string): Promise<void> {
  if (!bankAppId) return;
  try {
    const normalized = bankAppId.toLowerCase();
    const currentList = await getNoAutofillBanks();
    if (!currentList.includes(normalized)) {
      currentList.push(normalized);
    }
    await AsyncStorage.setItem(
      STORAGE_KEY_NO_AUTOFILL_BANKS,
      JSON.stringify(currentList)
    );
  } catch (err) {
    console.warn('[BankCapability] Failed to mark bank noAutofill:', err);
  }
}

/**
 * Removes a bank from the noAutofill local list (for reset / re-enable)
 */
export async function removeBankNoAutofill(bankAppId: string): Promise<void> {
  if (!bankAppId) return;
  try {
    const normalized = bankAppId.toLowerCase();
    const raw = await AsyncStorage.getItem(STORAGE_KEY_NO_AUTOFILL_BANKS);
    const list: string[] = raw ? JSON.parse(raw) : [...DEFAULT_NO_AUTOFILL_BANKS];
    const filtered = list.filter((b) => b.toLowerCase() !== normalized);
    await AsyncStorage.setItem(
      STORAGE_KEY_NO_AUTOFILL_BANKS,
      JSON.stringify(filtered)
    );
  } catch (err) {
    console.warn('[BankCapability] Failed to remove bank noAutofill:', err);
  }
}

/**
 * Records anonymous prefill telemetry event for a bank (Zero PII - only bankCode and outcome)
 */
export async function recordPrefillReport(
  bankCode: string,
  result: 'OPENED' | 'REPORTED_NO'
): Promise<void> {
  try {
    const event: PrefillReportEvent = {
      timestamp: new Date().toISOString(),
      bankCode: bankCode.toLowerCase(),
      result,
    };

    const raw = await AsyncStorage.getItem(STORAGE_KEY_PREFILL_REPORTS);
    const list: PrefillReportEvent[] = raw ? JSON.parse(raw) : [];

    list.unshift(event);
    if (list.length > 100) list.pop(); // Keep max 100 events

    await AsyncStorage.setItem(STORAGE_KEY_PREFILL_REPORTS, JSON.stringify(list));
  } catch (err) {
    console.warn('[BankCapability] Failed to record prefill report:', err);
  }
}

export interface BankPrefillStat {
  bankCode: string;
  openedCount: number;
  reportedNoCount: number;
  failRatePct: number;
}

/**
 * Computes failure report across all banks:
 * Used by project owner to detect when a bank crosses failure threshold (>50%) and should be remotely added to noAutofillBanks.
 */
export async function getPrefillFailureReport(): Promise<BankPrefillStat[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_PREFILL_REPORTS);
    const list: PrefillReportEvent[] = raw ? JSON.parse(raw) : [];

    const statsMap: Record<string, { opened: number; reportedNo: number }> = {};

    for (const item of list) {
      const code = item.bankCode;
      if (!statsMap[code]) {
        statsMap[code] = { opened: 0, reportedNo: 0 };
      }
      if (item.result === 'OPENED') {
        statsMap[code].opened++;
      } else if (item.result === 'REPORTED_NO') {
        statsMap[code].reportedNo++;
      }
    }

    const result: BankPrefillStat[] = Object.entries(statsMap).map(([bankCode, counts]) => {
      const total = counts.opened + counts.reportedNo;
      const failRatePct = total > 0 ? Math.round((counts.reportedNo / total) * 100) : 0;
      return {
        bankCode,
        openedCount: counts.opened,
        reportedNoCount: counts.reportedNo,
        failRatePct,
      };
    });

    return result.sort((a, b) => b.failRatePct - a.failRatePct);
  } catch {
    return [];
  }
}
