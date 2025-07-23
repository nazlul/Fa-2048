"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.privy?.actions?.ready
    ) {
      window.privy.actions.ready();
    }
  }, []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["farcaster"],
        appearance: { theme: "light" },
      }}
    >
      {children}
    </PrivyProvider>
  );
} 