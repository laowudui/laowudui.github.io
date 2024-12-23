import type { DefaultTheme } from "vitepress";

export function localSearch(): DefaultTheme.LocalSearchOptions {
    return {
        miniSearch: {
            options: {
                processTerm: (term) => {
                    let segmenter = new Intl.Segmenter("zh", {
                        granularity: "word",
                    });
                    let tokens: string[] = [];
                    for (let seg of segmenter.segment(term)) {
                        tokens.push(seg.segment);
                    }
                    return tokens;
                },
            },
            searchOptions: {
                // 前缀搜索
                prefix: true,
                // 模糊搜索
                fuzzy: 0.2,
                // 匹配方式
                combineWith: "AND",
            },
        },
        locales: {
            root: {
                translations: {
                    modal: {
                        displayDetails: "显示详细列表",
                        resetButtonTitle: "重置搜索",
                        backButtonTitle: "关闭搜索",
                        noResultsText: "没有搜索到结果:",
                        footer: {
                            selectText: "选择",
                            selectKeyAriaLabel: "输入",
                            navigateText: "导航",
                            navigateUpKeyAriaLabel: "上箭头",
                            navigateDownKeyAriaLabel: "下箭头",
                            closeText: "关闭",
                            closeKeyAriaLabel: "关闭",
                        }
                    },
                    button: {
                        buttonText: "搜索",
                        buttonAriaLabel: "搜索",
                    },
                },
            },
        },
    }
}
