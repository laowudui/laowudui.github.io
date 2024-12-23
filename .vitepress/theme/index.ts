import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./index.css";
import ThemeExtends from "./ThemeExtends.vue";

export default {
    extends: DefaultTheme,
    Layout: ThemeExtends,
} satisfies Theme;
