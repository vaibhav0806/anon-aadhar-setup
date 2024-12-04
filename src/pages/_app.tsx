import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect, useState } from "react";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()
import { config } from "@/config";

export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState<boolean>(false);
  const [useTestAadhaar, setUseTestAadhaar] = useState<boolean>(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {ready ? (
          <AnonAadhaarProvider
            _useTestAadhaar={useTestAadhaar}
            _appName="Anon Aadhaar"
          >
            <Component
              {...pageProps}
              setUseTestAadhaar={setUseTestAadhaar}
              useTestAadhaar={useTestAadhaar}
            />
          </AnonAadhaarProvider>
        ) : null}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
