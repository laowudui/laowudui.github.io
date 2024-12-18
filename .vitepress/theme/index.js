import DefaultTheme from "vitepress/theme";
import "./custom.css";
import LayoutExtends from "./LayoutExtends.vue";

export default {
    extends: DefaultTheme,
    Layout: LayoutExtends,
}
