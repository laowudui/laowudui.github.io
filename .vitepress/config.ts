import { defineConfig } from "vitepress";
import head from "./head.js";
import { updateServiceWorker } from "./buildEnd.ts";
import { localSearch } from "./search.ts";
import { navItem, sidebarMulti } from "./sitebars.ts";

export default defineConfig({
    title: "网络日志",
    description: "网络上记录个人思想、经历、见解和各种信息的在线平台",
    srcDir: "./docs",
    outDir: "./dist",
    lang: "zh",
    lastUpdated: true,
    head,
    sitemap: {
        hostname: "https://laowudui.github.io",
    },
    rewrites: {
        "README.md": "index.md",
        "(.*)/README.md": "(.*)/index.md",
    },
    async buildEnd(siteConfig) {
        updateServiceWorker(siteConfig.outDir);
    },
    vite: {
        publicDir: "../public",
    },
    markdown: {
        codeCopyButtonTitle: "复制代码",
        container: {
            tipLabel: "提示",
            warningLabel: "警告",
            dangerLabel: "危险",
            infoLabel: "信息",
            detailsLabel: "详细信息",
        },
    },
    themeConfig: {
        externalLinkIcon: true,
        nav: navItem("./docs"),
        sidebar: sidebarMulti("./docs"),
        search: {
            provider: "local",
            options: localSearch(),
        },
        outline: {
            level: [2, 4],
            label: "页面导航",
        },
        editLink: {
            pattern: "https://github.dev/laowudui/laowudui.github.io/blob/main/docs/:path",
            text: "编辑此页面",
        },
        lastUpdated: {
            text: "最后更新于",
            formatOptions: {
                dateStyle: "short",
                timeStyle: "medium",
            },
        },
        docFooter: {
            prev: "上一页",
            next: "下一页",
        },
        footer: {
            copyright: `© ${new Date().getFullYear()} 网络日志`,
        },
        notFound: {
            title: "请求的页面不存在",
            quote: "无人扶我青云志, 我自踏雪至山巅",
            linkText: "返回首页",
            linkLabel: "返回首页",
        },
        langMenuLabel: "多语言",
        returnToTopLabel: "回到顶部",
        sidebarMenuLabel: "菜单",
        darkModeSwitchLabel: "主题",
        darkModeSwitchTitle: "切换到深色模式",
        lightModeSwitchTitle: "切换到浅色模式",
    },
});
