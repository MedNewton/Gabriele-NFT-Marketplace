interface NavigationType {
    id: number;
    name: string;
    path?: string | undefined;
    dropdown?: {
        id: number;
        name: string;
        path?: string | undefined;
        dropdown?: {
            id: number;
            name: string;
            path: string;
        }[];
    }[];
}

export const navigation: NavigationType[] = [
    {
        id: 1,
        name: "Home",
        path: "/",
    },
    {
        id: 2,
        name: "Explore",
        path: "/explore",
    },
    {
        id: 3,
        name: "Create",
        dropdown: [
            {
                id: 1,
                name: "Create Collection",
                path: "/create-collection",
            },
            {
                id: 2,
                name: "Create NFT",
                path: "/create-nft",
            },
        ],
    },
    {
        id: 4,
        name: "Blog",
        path: "/blog",
    },
    {
        id: 6,
        name: "Contact",
        path: "/contact",
    },
];
