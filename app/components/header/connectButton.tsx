import client from "@/app/thirdwebClient";
import { ConnectButton } from "thirdweb/react";
import useDarkModeCheck from "@/hooks/useDarkModeCheck";

import {
    inAppWallet,
    createWallet,
} from "thirdweb/wallets";

const wallets = [
    inAppWallet({
        auth: {
            options: [
                "google",
                "facebook",
                "email",
                "phone",
            ],
        },
    }),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
];

const ConnectWalletButton = () => {
    const isDarkMode = useDarkModeCheck();
    return (
        <ConnectButton
            client={client}
            connectModal={{ size: "compact" }}
            connectButton={{
                label: "Connect Wallet",
                className: `is-${isDarkMode ? "dark-connect-button" : "light-connect-button"}`,
            }}
            wallets={wallets}
            theme={isDarkMode ? "dark" : "light"}
        />
    );
};

export default ConnectWalletButton;
