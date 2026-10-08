import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../src/constants/colors';
import { BlockLayout, Spacing } from '../../src/constants/layout';
import { JournalView } from '../../src/components/views/JournalView';

export default function JournalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBackHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <JournalView />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  topBackHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.surfaceDark,
    borderWidth: BlockLayout.borderWidth,
    borderColor: Colors.borderBlack,
    justifyContent: 'center',
    alignItems: 'center',
    ...BlockLayout.shadowSm,
  },
});
