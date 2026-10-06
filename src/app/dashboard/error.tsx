"use client";
import ErrorPanel from "@/components/ErrorPanel";
export default function DashboardError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorPanel {...props} inDashboard />;
}
