import type { HeadConfig } from "vitepress";

const headConfig: HeadConfig[] = [
    // 主题颜色
    ["meta", { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#ffffff" }],
    ["meta", { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#1b1b1f" }],
    // https://favicon.io
    ["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }],
    ["link", { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" }],
    ["link", { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" }],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
];

export default headConfig;
