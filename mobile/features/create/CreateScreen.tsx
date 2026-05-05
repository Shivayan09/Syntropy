import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/tokens";
import { StyleSheet, Text, View } from "react-native";

export function CreateScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CREATE TEST</Text>
        <Text style={styles.title}>Build the same workflows for mobile</Text>
        <Text style={styles.copy}>
          This scaffold preserves the web information architecture and design system. The next pass should port your full manual builder and AI generation forms screen-by-screen.
        </Text>
      </View>

      <Card highlight>
        <Text style={styles.cardTitle}>Manual mock builder</Text>
        <Text style={styles.copy}>MCQ and subjective creation can live here with the same validation rules as the web app.</Text>
        <View style={styles.spacer} />
        <Button label="Manual flow coming next" onPress={() => {}} disabled />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>AI test generation</Text>
        <Text style={styles.copy}>Subjects, difficulty, duration, role context, and credit-aware generation map cleanly to this mobile surface.</Text>
        <View style={styles.spacer} />
        <Button label="AI flow coming next" onPress={() => {}} disabled />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 30,
    lineHeight: 34,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 24,
    marginBottom: 8,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
  },
  spacer: {
    height: 16,
  },
});
