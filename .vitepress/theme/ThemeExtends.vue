<script lang="ts" setup>
import DefaultTheme from "vitepress/theme";
import RestArchives from "./components/RestArchives.vue";

const { Layout } = DefaultTheme;
</script>

<template>
    <Layout>
        <template #doc-after>
            <ClientOnly>
                <RestArchives />
            </ClientOnly>
        </template>
    </Layout>
</template>
