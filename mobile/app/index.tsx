import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";

export default function IndexPage() {
  const { ready, user } = useAuth();

  if (!ready) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(app)/dashboard" />;
}
