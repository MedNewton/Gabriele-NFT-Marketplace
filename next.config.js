/** @type {import('next').NextConfig} */
const nextConfig = {
    // experimental: {
    //     appDir: true,
    // },
    // styledComponents: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "tremendous-basilisk-700.convex.cloud",
            },
            {
                protocol: "https",
                hostname: "colorless-porcupine-722.convex.cloud",
            },
            {
                protocol: "https",
                hostname: "ipfs.io",
                pathname: "/ipfs/**",
            },
        ],
    },
};

module.exports = nextConfig;
