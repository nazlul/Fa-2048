"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    sdk.actions.ready();
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