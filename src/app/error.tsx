"use client";
import ErrorPanel from "@/components/ErrorPanel";
export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorPanel {...props} />;
}
