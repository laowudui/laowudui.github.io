<script setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { onMounted, onUnmounted } from "vue";

const { Layout } = DefaultTheme;
const { site, page } = useData();

function handleKeyPress(event) {
    function handle(name) {
        let config = site.value.themeConfig[name];
        if (config) {
            let { pattern = "", code = "" } = config;
            if (event.code === code) {
                window.open(pattern.replace(":path", page.value.filePath));
            }
        }
    }
    if (event.target.tagName !== "INPUT") {
        handle("editLink");
        handle("editVscode");
    }
}

onMounted(() => {
    document.addEventListener("keydown", handleKeyPress);
});
onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyPress);
});
</script>

<template>
    <Layout>
        <template #doc-after></template>
    </Layout>
</template>
