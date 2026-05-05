import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import type { SyllabusRecord } from "@/types/api";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function SyllabusScreen() {
  const { token } = useAuth();
  const { showError, showSuccess } = useToast();
  const [syllabus, setSyllabus] = useState<SyllabusRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!token) return;
    try {
      const response = await api.getSyllabus(token);
      setSyllabus(response.syllabus?.[0] || null);
    } catch (error) {
      showError("Could not load syllabus", getErrorMessage(error, "Load failed"));
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const upload = async () => {
    if (!token) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    try {
      setLoading(true);
      const asset = result.assets[0];
      await api.uploadSyllabus(token, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || "application/octet-stream",
        type: asset.mimeType || "application/octet-stream",
      });
      await load();
      showSuccess("Uploaded", "Syllabus uploaded successfully.");
    } catch (error) {
      showError("Upload failed", getErrorMessage(error, "Unable to upload syllabus"));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!token || !syllabus) return;
    try {
      setLoading(true);
      await api.updateSyllabus(token, { _id: syllabus._id, subjects: syllabus.subjects });
      showSuccess("Saved", "Syllabus updated.");
    } catch (error) {
      showError("Save failed", getErrorMessage(error, "Unable to save syllabus"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SYLLABUS</Text>
        <Text style={styles.title}>Upload and manage subjects</Text>
      </View>

      <Button label={loading ? "Working..." : "Upload syllabus"} onPress={() => void upload()} disabled={loading} />

      {!syllabus ? (
        <Card>
          <Text style={styles.copy}>No syllabus uploaded yet.</Text>
        </Card>
      ) : (
        <>
          <Card>
            <Text style={styles.sectionTitle}>{syllabus.title}</Text>
            <Text style={styles.copy}>{syllabus.subjects.length} subjects</Text>
          </Card>
          {syllabus.subjects.map((subject, subjectIndex) => (
            <Card key={`${subject.name}-${subjectIndex}`}>
              <TextInput
                value={subject.name}
                onChangeText={(value) =>
                  setSyllabus((prev) =>
                    prev
                      ? {
                          ...prev,
                          subjects: prev.subjects.map((item, index) => (index === subjectIndex ? { ...item, name: value } : item)),
                        }
                      : prev,
                  )
                }
                style={styles.subjectInput}
              />
              <View style={{ height: 12 }} />
              {subject.units.map((unit, unitIndex) => (
                <View key={`${unit.title}-${unitIndex}`} style={styles.unitBox}>
                  <TextInput
                    value={unit.title}
                    onChangeText={(value) =>
                      setSyllabus((prev) =>
                        prev
                          ? {
                              ...prev,
                              subjects: prev.subjects.map((item, index) =>
                                index === subjectIndex
                                  ? {
                                      ...item,
                                      units: item.units.map((entry, entryIndex) => (entryIndex === unitIndex ? { ...entry, title: value } : entry)),
                                    }
                                  : item,
                              ),
                            }
                          : prev,
                      )
                    }
                    style={styles.unitInput}
                  />
                  <TextInput
                    value={unit.topics.map((topic) => topic.name).join(", ")}
                    onChangeText={(value) =>
                      setSyllabus((prev) =>
                        prev
                          ? {
                              ...prev,
                              subjects: prev.subjects.map((item, index) =>
                                index === subjectIndex
                                  ? {
                                      ...item,
                                      units: item.units.map((entry, entryIndex) =>
                                        entryIndex === unitIndex
                                          ? {
                                              ...entry,
                                              topics: value
                                                .split(",")
                                                .map((topic) => topic.trim())
                                                .filter(Boolean)
                                                .map((topic) => ({ name: topic })),
                                            }
                                          : entry,
                                      ),
                                    }
                                  : item,
                              ),
                            }
                          : prev,
                      )
                    }
                    placeholder="Topics separated by commas"
                    placeholderTextColor={colors.muted}
                    style={styles.unitInput}
                  />
                </View>
              ))}
              <Pressable
                onPress={() =>
                  setSyllabus((prev) =>
                    prev
                      ? {
                          ...prev,
                          subjects: prev.subjects.map((item, index) =>
                            index === subjectIndex ? { ...item, units: [...item.units, { title: "", topics: [] }] } : item,
                          ),
                        }
                      : prev,
                  )
                }
              >
                <Text style={styles.linkText}>+ Add unit</Text>
              </Pressable>
            </Card>
          ))}
          <Button label="Save syllabus" onPress={() => void save()} disabled={loading} />
        </>
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
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontWeight: "900",
  },
  unitBox: {
    gap: 8,
    marginBottom: 12,
  },
  unitInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  linkText: {
    color: colors.primary,
    fontWeight: "800",
  },
});
