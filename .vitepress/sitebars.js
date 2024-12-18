import path from "path";
import fs from "fs";

class Sitebars {
    constructor(srcDir) {
        this.srcDir = path.resolve(srcDir);
        this.sidebar = [];
        this.ignores = [
            "node_modules",
            "public",
            "dist",
            ".git",
            ".vscode",
            ".vitepress",
        ];
        this.indexFile = "README.md";
    }
    sortArrayFromText(items) {
        return items.sort((a, b) => {
            return a.text.localeCompare(b.text, "zh-Hans-CN")
        })
    }
    sortArrayWithType(items) {
        return [
            ...items.filter(item => item.type === "file"),
            ...items.filter(item => item.type === "directory")
        ]
    }
    getLink(dirPath) {
        return dirPath.replace(this.srcDir, "") + "/";
    }
    getFileItem(itemPath) {
        let content = fs.readFileSync(itemPath, "utf-8");
        let matched = content.match(/^#{1,2} (.+)$/m);
        return {
            name: path.basename(itemPath),
            type: "file",
            text: matched ? matched[1].trim() : path.basename(itemPath),
            link: itemPath.replace(".md", ".html").replace(this.srcDir, ""),
        }
    }
    getDirectoryItem(items, dirPath) {
        let link = this.getLink(dirPath);
        let depth = link.split("/").length - 2;
        return {
            name: path.basename(dirPath),
            type: "directory",
            text: path.basename(dirPath),
            collapsed: depth > 2,
            items: items,
        }
    }
    readdirSync(dirPath) {
        return fs.readdirSync(dirPath)
            .filter(itemName => !this.ignores.includes(itemName))
            .map(itemName => path.join(dirPath, itemName))
    }
    parseSidebar(dirPath) {
        let items = [];
        this.readdirSync(dirPath).forEach(itemPath => {
            if (fs.statSync(itemPath).isDirectory()) {
                let parsedSidebar = this.parseSidebar(itemPath);
                if (parsedSidebar) {
                    if (parsedSidebar.items.length > 0) {
                        items.push(parsedSidebar);
                    }
                }
            } else {
                if (itemPath.endsWith(".md")) {
                    items.push(this.getFileItem(itemPath));
                }
            }
        });
        let index = items.find(item => item.name === this.indexFile);
        items = this.sortArrayFromText(items);
        items = this.sortArrayWithType(items);
        if (index) {
            this.sidebar.push({
                link: this.getLink(dirPath),
                text: index.text,
                items: items.filter(item => item.name !== this.indexFile),
            });
        } else {
            return this.getDirectoryItem(items, dirPath);
        }
    }
    parseNavbar(dirPath) {
        let navbar = [];
        this.readdirSync(dirPath).forEach(itemPath => {
            // 只处理目录
            if (fs.statSync(itemPath).isDirectory()) {
                let childIndex = path.join(itemPath, this.indexFile);
                let childItems = this.parseNavbar(itemPath);
                let current = {
                    text: path.basename(itemPath),
                };
                if (fs.existsSync(childIndex)) {
                    if (childItems.length > 0) {
                        current.items = childItems;
                    } else {
                        current.link = this.getLink(itemPath);
                        current.activeMatch = current.link;
                    }
                    navbar.push(current);
                } else {
                    if (childItems.length > 0) {
                        current.items = childItems;
                        navbar.push(current);
                    }
                    // 目录不包含索引, 又不包含子文件夹, 取消递归
                }
            }
        });
        return this.sortArrayFromText(navbar);
    }
    getSidebar() {
        this.parseSidebar(this.srcDir);
        let sidebar = {};
        this.sortArrayFromText(this.sidebar).forEach(node => {
            sidebar[node.link] = node.items;
        });
        return sidebar;
    }
    getNavbar() {
        let navbar = this.parseNavbar(this.srcDir);
        if (navbar.length === 0) {
            navbar = false;
        }
        return navbar;
    }
}

export function autoSiteBars() {
    return {
        name: "vitepress:auto-sitebars",
        config(config) {
            let sitebars = new Sitebars(config.vitepress.srcDir);
            config.vitepress.site.themeConfig.nav = sitebars.getNavbar();
            config.vitepress.site.themeConfig.sidebar = sitebars.getSidebar();
        },
    }
}
