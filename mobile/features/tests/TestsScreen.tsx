import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/exam";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import type { TestSummary } from "@/types/api";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type TestMode = "all" | "manual" | "generated";
type SortMode = "newest" | "oldest" | "duration" | "questions";

const typeLabel: Record<TestMode, string> = {
  all: "All",
  manual: "Manual",
  generated: "AI Generated",
};

export function TestsScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { showError } = useToast();
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [mode, setMode] = useState<TestMode>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await api.getTests(token);
        setTests(response.tests || []);
      } catch (error) {
        showError("Could not load tests", getErrorMessage(error, "Load failed"));
      }
    };
    void load();
  }, [showError, token]);

  const manualTests = useMemo(() => tests.filter((test) => test.type === "manual"), [tests]);
  const generatedTests = useMemo(() => tests.filter((test) => test.type === "generated"), [tests]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const activeTests = mode === "manual" ? manualTests : mode === "generated" ? generatedTests : tests;

    return [...activeTests]
      .filter((test) => (test.title || "Untitled test").toLowerCase().includes(query))
      .sort((a, b) => {
        if (sort === "oldest") {
          return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
        }
        if (sort === "duration") {
          return (b.duration || 0) - (a.duration || 0);
        }
        if (sort === "questions") {
          return (b.totalQuestions || 0) - (a.totalQuestions || 0);
        }
        return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
      });
  }, [generatedTests, manualTests, mode, search, sort, tests]);

  const emptyCopy =
    mode === "manual"
      ? "No manual tests match this view. Create a structured paper when you need full control."
      : mode === "generated"
        ? "No AI generated tests match this view. Generate a new set for fast topic practice."
        : "Create a manual paper or generate one with AI to populate your library.";

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TEST LIBRARY</Text>
        <Text style={styles.title}>Your saved mocks</Text>
        {!user?.onboardingCompleted ? (
          <Text style={styles.copy}>Complete onboarding and upload your syllabus for more personalized suggestions.</Text>
        ) : null}
      </View>

      <View style={styles.row}>
        {(["all", "manual", "generated"] as TestMode[]).map((item) => (
          <Pressable key={item} onPress={() => setMode(item)} style={[styles.filter, mode === item ? styles.filterActive : null]}>
            <Text style={[styles.filterText, mode === item ? styles.filterTextActive : null]}>
              {item === "generated" ? "AI Generated" : typeLabel[item]}
            </Text>
            <Text style={[styles.filterCount, mode === item ? styles.filterTextActive : null]}>
              {item === "all" ? tests.length : item === "manual" ? manualTests.length : generatedTests.length}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search by test title"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <View style={styles.row}>
        {(["newest", "oldest", "duration", "questions"] as SortMode[]).map((item) => (
          <Pressable key={item} onPress={() => setSort(item)} style={[styles.filter, sort === item ? styles.filterActive : null]}>
            <Text style={[styles.filterText, sort === item ? styles.filterTextActive : null]}>{item.replace("-", " ")}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsGrid}>
        <Card>
          <Text style={styles.statLabel}>Showing</Text>
          <Text style={styles.statValue}>{filtered.length}</Text>
          <Text style={styles.statCopy}>{typeLabel[mode]} tests</Text>
        </Card>
        <Card>
          <Text style={styles.statLabel}>Manual papers</Text>
          <Text style={styles.statValue}>{manualTests.length}</Text>
          <Text style={styles.statCopy}>Created with fixed structure</Text>
        </Card>
        <Card>
          <Text style={styles.statLabel}>AI sets</Text>
          <Text style={styles.statValue}>{generatedTests.length}</Text>
          <Text style={styles.statCopy}>Generated practice tests</Text>
        </Card>
      </View>

      {filtered.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No tests found</Text>
          <Text style={styles.copy}>{search ? "Try another search term or clear the search field." : emptyCopy}</Text>
          <View style={{ height: 16 }} />
          <Button
            label={mode === "generated" ? "Generate AI test" : mode === "manual" ? "Create manual test" : "Create a test"}
            onPress={() => router.push(mode === "generated" ? "/(app)/create/generate" : mode === "manual" ? "/(app)/create/manual" : "/(app)/create")}
          />
        </Card>
      ) : (
        filtered.map((test) => (
          <Card key={test._id}>
            <View style={styles.itemMetaRow}>
              <View style={[styles.badge, test.type === "generated" ? styles.badgePrimary : null]}>
                <Text style={[styles.badgeText, test.type === "generated" ? styles.badgeTextActive : null]}>
                  {test.type === "generated" ? "AI" : "Manual"}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{(test.testFormat || "mcq").toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.itemTitle}>{test.title || "Untitled test"}</Text>
            <Text style={styles.copy}>
              {test.totalQuestions || 0} questions - {test.duration || 0} min
            </Text>
            <Text style={styles.copy}>Created {formatDate(test.createdAt)}</Text>

            <View style={{ height: 16 }} />
            <Button label="Preview" onPress={() => router.push(`/(app)/test/preview/${test._id}`)} variant="secondary" />
          </Card>
        ))
      )}
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
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filter: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  filterCount: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 11,
  },
  filterTextActive: {
    color: colors.white,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  statsGrid: {
    gap: 12,
  },
  statLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12,
  },
  statValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 28,
    marginTop: 8,
  },
  statCopy: {
    color: colors.muted,
    marginTop: 6,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
  },
  itemMetaRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgePrimary: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 11,
    textTransform: "uppercase",
  },
  badgeTextActive: {
    color: colors.white,
  },
  itemTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 20,
    marginTop: 12,
  },
});
