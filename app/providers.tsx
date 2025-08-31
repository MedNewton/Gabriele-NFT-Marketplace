"use client";
import { ThemeProvider } from "next-themes";
import { MetaMaskProvider } from "metamask-react";
import { ThirdwebProvider } from "thirdweb/react";
import { ConvexClientProvider } from "./ConvexClientProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            enableSystem={false}
            themes={["is_dark", "is_light"]}
        >
            <MetaMaskProvider>
                <ThirdwebProvider>
                    <ConvexClientProvider>
                        {children}
                    </ConvexClientProvider>
                </ThirdwebProvider>
            </MetaMaskProvider>
        </ThemeProvider>
    );
}
