import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme/tokens";
import type { LeaderboardUser } from "@/types/api";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function LeaderboardScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const response = await api.getLeaderboard(token);
      setUsers(response.users || []);
    };
    void load();
  }, [token]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => (user.name || "Student").toLowerCase().includes(query));
  }, [search, users]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LEADERBOARD</Text>
        <Text style={styles.title}>Ranked activity</Text>
      </View>

      <TextInput value={search} onChangeText={setSearch} placeholder="Search student" placeholderTextColor={colors.muted} style={styles.input} />

      {filteredUsers.map((user, index) => (
        <Pressable key={user._id} onPress={() => router.push(`/(app)/users/${user._id}`)}>
          <Card highlight={index < 3}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.name}>{user.name || "Student"} @{user.username || "user"}</Text>
            <Text style={styles.meta}>{Math.round(user.avgAccuracy || 0)}% accuracy · {user.testsTaken || 0} tests · {Math.round(user.avgScore || 0)} avg score</Text>
          </Card>
        </Pressable>
      ))}
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
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rank: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 16,
  },
  name: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 20,
    marginTop: 8,
  },
  meta: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
  },
});
