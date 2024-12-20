<template>
    <Layout>
        <template #doc-after></template>
    </Layout>
</template>

<script lang="ts" setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { onMounted, onUnmounted } from "vue";
// data
import pages from "../pages.ts";

const { Layout } = DefaultTheme;
const { page } = useData();

function handleKeyPress(event: any) {
    function handle(name: string) {
        let config = pages[name];
        if (config) {
            let { pattern, code } = config;
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

onMounted(() => document.addEventListener("keydown", handleKeyPress));
onUnmounted(() => document.removeEventListener("keydown", handleKeyPress));
</script>
