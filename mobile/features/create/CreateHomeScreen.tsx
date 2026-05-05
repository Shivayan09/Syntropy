import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/tokens";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export function CreateHomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CREATE TEST</Text>
        <Text style={styles.title}>Build it yourself or generate it with AI</Text>
        <Text style={styles.copy}>
          Use the same two creation flows as the web app. Manual gives full control. AI is faster and spends a credit.
        </Text>
      </View>

      <Card highlight>
        <Text style={styles.cardTitle}>Manual test builder</Text>
        <Text style={styles.copy}>
          Create MCQ or subjective tests, add subjects, set difficulty, duration, and write each question yourself.
        </Text>
        <View style={styles.space} />
        <Button label="Open manual builder" onPress={() => router.push("/(app)/create/manual")} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>AI test generator</Text>
        <Text style={styles.copy}>
          Choose subjects, difficulty, duration, and format. Syntropy generates the test using your account and available credits.
        </Text>
        <View style={styles.space} />
        <Button label="Generate AI test" onPress={() => router.push("/(app)/create/generate")} />
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
    lineHeight: 36,
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
  space: {
    height: 16,
  },
});
