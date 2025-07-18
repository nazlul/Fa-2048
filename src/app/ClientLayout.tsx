"use client";
import { PrivyProvider } from "@privy-io/react-auth";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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