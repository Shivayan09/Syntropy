import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme/tokens";
import type { PublicProfile } from "@/types/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

export function PublicProfileScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token || !params.id) return;
      const response = await api.getPublicProfile(token, params.id);
      setProfile(response.profile);
    };
    void load();
  }, [token, params.id]);

  if (!profile) return null;

  return (
    <Screen>
      <Card highlight>
        <Text style={styles.name}>{profile.name} @{profile.username}</Text>
        <Text style={styles.copy}>{profile.college || "College not set"} · Semester {profile.semester || "-"}</Text>
      </Card>
      <Card>
        <Text style={styles.metric}>Tests attempted: {profile.testsAttempted || 0}</Text>
        <Text style={styles.metric}>Tests created: {profile.testsCreated || 0}</Text>
        <Text style={styles.metric}>Average accuracy: {Math.round(profile.averageAccuracy || 0)}%</Text>
        <Text style={styles.metric}>Best score: {Math.round(profile.bestScore || 0)}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 28,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
  },
  metric: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 10,
  },
});
