import type { DefaultTheme } from "vitepress";
import fs from "fs";
import path from "path";

type SidebarMultiItem = {
    link: string;
    items: DefaultTheme.SidebarItem[];
};
type FsReadForEach = {
    path: string;
    dirs?: (dirPath: string) => void;
    files?: (filePath: string) => void;
};
type AnyObject = Record<string, any>;

class Sitebars {
    private srcDir: string;
    private sidebarMultiItems: SidebarMultiItem[];
    private ignores: string[];
    private indexFile: string;
    private indexHtml: string;

    constructor(srcDir: string) {
        this.srcDir = path.resolve(srcDir);
        this.sidebarMultiItems = [];
        this.ignores = [
            "node_modules",
            "dist",
            "public",
        ];
        this.indexFile = "README.md";
        this.indexHtml = this.indexFile.replace(".md", ".html");
    }
    fsReadForEach(options: FsReadForEach): void {
        if (!fs.existsSync(options.path)) {
            return;
        }
        fs.readdirSync(options.path)
            .filter((itemName: string) => {
                return !itemName.startsWith(".") && !this.ignores.includes(itemName);
            })
            .forEach((itemName: string) => {
                const itemPath: string = path.join(options.path, itemName);
                const stats: fs.Stats = fs.statSync(itemPath);
                if (stats.isDirectory() && options.dirs) {
                    options.dirs(itemPath);
                } else if (stats.isFile() && options.files) {
                    options.files(itemPath);
                }
            });
        return;
    }
    parseLink(dirPath: string): string {
        return dirPath.replace(this.srcDir, "") + "/";
    }
    parseDepth(dirPath: string): number {
        return this.parseLink(dirPath).split("/").length - 2;
    }
    safeCompare(a: AnyObject, b: AnyObject, key: string): number {
        if (key in a && key in b) {
            return String(a[key]).localeCompare(String(b[key]), "zh-Hans-CN") || 0;
        } else {
            return 0;
        }
    }
    // 侧边栏
    sortSidebarItems(items: DefaultTheme.SidebarItem[]): DefaultTheme.SidebarItem[] {
        const folders = items
            .filter(item => item.items)
            .sort((a, b) => this.safeCompare(a, b, "text"));
        const files = items
            .filter(item => !item.items)
            .sort((a, b) => this.safeCompare(a, b, "link"));
        // 侧边栏文件夹在前面
        return [...folders, ...files];
    }
    parseSidebarItem(itemPath: string): DefaultTheme.SidebarItem {
        const content = fs.readFileSync(itemPath, "utf-8");
        const matched = content.match(/^#{1,2} (.+)$/m);
        return {
            text: matched ? matched[1].trim() : path.basename(itemPath),
            link: itemPath.replace(".md", ".html").replace(this.srcDir, ""),
        }
    }
    parseSidebar(dirPath: string): DefaultTheme.SidebarItem | void {
        const sidebarItems: DefaultTheme.SidebarItem[] = [];
        this.fsReadForEach({
            path: dirPath,
            dirs: (itemPath: string) => {
                const childSidebar = this.parseSidebar(itemPath);
                if (childSidebar && childSidebar.items && childSidebar.items.length > 0) {
                    sidebarItems.push(childSidebar);
                }
            },
            files: (itemPath: string) => {
                if (itemPath.endsWith(".md")) {
                    sidebarItems.push(this.parseSidebarItem(itemPath));
                }
            },
        });
        // 统一排序
        const sortedSidebarItems = this.sortSidebarItems(sidebarItems);
        // 找出索引文件
        const index = sidebarItems.find(item => {
            if (item.link) {
                return item.link.endsWith(this.indexHtml);
            }
            return false;
        });
        if (index) {
            // 存在索引, 直接添加到侧边栏容器
            const sidebarItem = sortedSidebarItems.filter(item => {
                if (item.link) {
                    return !item.link.endsWith(this.indexHtml);
                }
                return true;
            });
            this.sidebarMultiItems.push({
                link: this.parseLink(dirPath),
                items: sidebarItem,
            });
            return;
        } else {
            // 没有索引, 传递到上级菜单
            const sidebarItem: DefaultTheme.SidebarItem = {
                text: path.basename(dirPath),
                collapsed: this.parseDepth(dirPath) > 2,
                items: sortedSidebarItems,
            };
            return sidebarItem;
        }
    }
    getSidebarMulti(): DefaultTheme.SidebarMulti | undefined {
        const sidebarMulti: DefaultTheme.SidebarMulti = {};
        this.parseSidebar(this.srcDir);
        this.sidebarMultiItems.forEach(sidebarMultiItem => {
            sidebarMulti[sidebarMultiItem.link] = sidebarMultiItem.items;
        });
        if (Object.keys(sidebarMulti).length === 0) {
            return undefined;
        }
        return sidebarMulti;
    }
    // 顶部导航栏
    sortNavItems(items: DefaultTheme.NavItem[]): DefaultTheme.NavItem[] {
        // 多级菜单
        const multiMenuItems = items
            .filter(item => "items" in item)
            .sort((a, b) => this.safeCompare(a, b, "text"))
        // 单个菜单
        const singleMenuItems = items
            .filter(item => !("items" in item))
            .sort((a, b) => this.safeCompare(a, b, "link"));
        return [...singleMenuItems, ...multiMenuItems];
    }
    // 导航栏弹出子菜单
    sortNavItemChildren(items: DefaultTheme.NavItemChildren[]): DefaultTheme.NavItemChildren[] {
        // 根据导航栏的章节标题排序
        const childrenMenuItems = items
            .filter(item => item.text)
            .sort((a, b) => this.safeCompare(a, b, "text"));
        // 导航栏按钮下的索引文档（1级目录下的文件夹）
        const firstLevelMenuItems = items.filter(item => !item.text);
        return [...firstLevelMenuItems, ...childrenMenuItems]
    }
    sortNavItemWithLinks(items: DefaultTheme.NavItemWithLink[]): DefaultTheme.NavItemWithLink[] {
        return items.sort((a, b) => this.safeCompare(a, b, "link"));
    }
    parseNavItemWithLink(itemPath: string): DefaultTheme.NavItemWithLink {
        const parsedLink = this.parseLink(itemPath);
        const navItemWithLink: DefaultTheme.NavItemWithLink = {
            text: path.basename(itemPath),
            link: parsedLink,
            activeMatch: parsedLink,
        };
        return navItemWithLink;
    }
    parseNavItemChildren(dirPath: string): DefaultTheme.NavItemChildren[] {
        const navItemChildren: DefaultTheme.NavItemChildren[] = [];
        const navItemChildrenItem: DefaultTheme.NavItemChildren = {
            items: [],
        };
        const depth = this.parseDepth(dirPath);
        if (depth > 1) {
            // 章节标题
            navItemChildrenItem.text = this.parseLink(dirPath)
                .replace(/(^\/[^/]+\/|\/$)/g, "") // 去除1级目录名和前后的斜杠
                .replace(/\//g, " » "); // 目录中间的斜杠替换为符号
        }
        this.fsReadForEach({
            path: dirPath,
            dirs: (itemPath) => {
                const childIndex = path.join(itemPath, this.indexFile);
                if (fs.existsSync(childIndex)) {
                    navItemChildrenItem.items.push(this.parseNavItemWithLink(itemPath));
                } else {
                    // 递归文件夹, 全部添加到二级菜单中
                    navItemChildren.push(...this.parseNavItemChildren(itemPath));
                }
            },
        });
        if (navItemChildrenItem.items.length > 0) {
            // 排序
            navItemChildrenItem.items = this.sortNavItemWithLinks(navItemChildrenItem.items);
            navItemChildren.push(navItemChildrenItem)
        }
        return this.sortNavItemChildren(navItemChildren);
    }
    getNavItems(): DefaultTheme.NavItem[] | undefined {
        const navItems: DefaultTheme.NavItem[] = [];
        this.fsReadForEach({
            path: this.srcDir,
            dirs: (itemPath: string) => {
                const childIndex = path.join(itemPath, this.indexFile);
                if (fs.existsSync(childIndex)) {
                    navItems.push(this.parseNavItemWithLink(itemPath));
                } else {
                    const navItemWithChildren: DefaultTheme.NavItemWithChildren = {
                        text: path.basename(itemPath), // 菜单标题
                        items: this.parseNavItemChildren(itemPath),
                    };
                    if (navItemWithChildren.items.length > 0) {
                        navItems.push(navItemWithChildren);
                    }
                }
            },
        });
        if (navItems.length == 0) {
            return undefined;
        }
        return this.sortNavItems(navItems);
    }
}

export function navItem(srcDir: string): DefaultTheme.NavItem[] | undefined {
    return new Sitebars(srcDir).getNavItems();
}
export function sidebarMulti(srcDir: string): DefaultTheme.SidebarMulti | undefined {
    return new Sitebars(srcDir).getSidebarMulti();
}
