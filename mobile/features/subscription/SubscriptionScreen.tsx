import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme/tokens";
import * as Linking from "expo-linking";
import { StyleSheet, Text } from "react-native";

export function SubscriptionScreen() {
  const { user } = useAuth();

  return (
    <Screen>
      <Card highlight>
        <Text style={styles.title}>Subscription</Text>
        <Text style={styles.copy}>Current plan: {user?.plan || "free"}</Text>
        <Text style={styles.copy}>
          Purchases stay on the website. Log in with the same account there, buy a plan, then use the credits from mobile.
        </Text>
        <Button label="Open website plans" onPress={() => void Linking.openURL("https://syntropytest.in/main/subscription")} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 28,
    marginBottom: 8,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginBottom: 10,
  },
});
