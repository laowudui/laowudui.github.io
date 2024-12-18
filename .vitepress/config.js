import { defineConfig } from "vitepress";
import head from "./head.js";
import robots from "./robots.js";
import { localSearch } from "./search.js";
import { autoSiteBars } from "./sitebars.js";

const pages = {
    robots: {
        "User-agent": "*",
        "Allow": "/",
        "Sitemap": "https://laowudui.github.io/sitemap.xml",
    },
    sitemap: {
        hostname: "https://laowudui.github.io",
    },
    editLink: {
        pattern: "https://github.com/laowudui/laowudui.github.io/edit/main/docs/:path",
        code: "KeyE",
        text: "编辑此页面",
    },
    editVscode: {
        pattern: "https://github.dev/laowudui/laowudui.github.io/blob/main/docs/:path",
        code: "Period",
    },
};

export default defineConfig({
    title: "网络日志",
    description: "网络上记录个人思想、经历、见解和各种信息的在线平台",
    srcDir: "./docs",
    outDir: "./dist",
    lang: "zh",
    lastUpdated: true,
    head,
    sitemap: pages.sitemap,
    rewrites: {
        "README.md": "index.md",
        "(.*)/README.md": "(.*)/index.md",
    },
    async buildEnd({ outDir }) {
        await robots(outDir, pages.robots);
    },
    vite: {
        plugins: [
            autoSiteBars(),
        ],
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
        search: localSearch(),
        outline: {
            level: [2, 4],
            label: "页面导航",
        },
        editLink: pages.editLink,
        editVscode: pages.editVscode,
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
