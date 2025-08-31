"use client";
import { ThemeProvider } from "next-themes";
import { MetaMaskProvider } from "metamask-react";
import { ThirdwebProvider } from "thirdweb/react";
import client from "./thirdwebClient";
import { ThirdwebClient } from "thirdweb";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            enableSystem={false}
            themes={["is_dark", "is_light"]}
        >
            <MetaMaskProvider>
                <ThirdwebProvider>
                    {children}
                </ThirdwebProvider>
            </MetaMaskProvider>
        </ThemeProvider>
    );
}
