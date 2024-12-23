<script lang="ts" setup>
import { useData } from "vitepress";
import { ref } from "vue";
import { Octokit } from "octokit";
import { encode, decode } from "js-base64";
import { date } from "../utils/date.ts"

const { page } = useData();

let token = ref(localStorage.getItem("token") || "");
let sha = ref("");
let content = ref("");
let remoteContent = ref("");

const config = {
    owner: "laowudui",
    repo: () => isHome() ? "test" : "laowudui.github.io",
    path: () => isHome() ? date("YYYY/MM/DD.md") : "archives/" + page.value.filePath,
    committer: {
        name: "laowudui",
        email: "laowudui@gmail.com",
    },
    headers: {
        "X-GitHub-Api-Version": "2022-11-28",
    },
    markContent: /^##\s+(.+)\n((?:^[^#]+\n?)+)/gm,
};
// 更新 token
const searchParams = new URLSearchParams(location.search);
if (searchParams.has("check")) {
    if (!token.value) {
        const tokenFromPrompt = prompt("密钥") || "";
        token.value = tokenFromPrompt;
        localStorage.setItem("token", tokenFromPrompt);
    }
}

function isHome() {
    return page.value.filePath == "README.md";
}
async function getContent() {
    try {
        const octokit = new Octokit({
            auth: token.value,
        });
        const result = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner: config.owner,
            repo: config.repo(),
            path: config.path(),
            headers: config.headers,
        });
        const { status, data } = result;
        if (status < 400) {
            if (Array.isArray(data)) {
                // 文件夹
            } else {
                if (data.type == "file") {
                    sha.value = data.sha;
                    remoteContent.value = decode(data.content);
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}
async function updateContent() {
    let newContent = date("## YYYY-MM-DD HH:mm:ss\n") + content.value;
    if (remoteContent.value.length > 0) {
        newContent = remoteContent.value + "\n\n" + newContent;
    }
    try {
        const octokit = new Octokit({
            auth: token.value,
        });
        const result = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
            owner: config.owner,
            repo: config.repo(),
            path: config.path(),
            message: "更新笔记",
            committer: config.committer,
            content: encode(newContent),
            sha: sha.value,
            headers: config.headers,
        });
        const { status, data } = result;
        if (status < 400) {
            if (data.content && data.content.sha) {
                content.value = "";
                sha.value = data.content?.sha;
                remoteContent.value = newContent;
            }
            alert("保存成功!");
        }
    } catch (error) {
        console.log(error.message);
    }
}
function markContent() {
    return remoteContent.value.replace(config.markContent, (_, title, context) => {
        return `<div class="thought">
                    <div class="title">${title}</div>
                    <div class="context">${context}</div>
                </div>`;
    });
}

if (token.value) {
    getContent();
}
</script>

<template>
    <div class="archives form-ui">
        <div v-if="token" class="grid-gap">
            <textarea v-model="content" placeholder="记录点什么..."></textarea>
            <div v-if="content" class="flex-end">
                <button @click="updateContent">提交内容</button>
            </div>
            <div class="thoughts grid-gap" v-html="markContent()"></div>
        </div>
    </div>
</template>

<style>
.flex-end {
    display: flex;
    justify-content: flex-end;
}

.grid-gap {
    display: grid;
    gap: 0.5em;
}

.archives {
    padding-top: 24px;
    margin-bottom: -50px;
}

.thoughts {
    font-size: 14px;

    .thought {
        background: var(--vp-c-bg-alt);
        border-left: 1px solid var(--vp-c-border);
        border-radius: 8px;
        padding: 0.5em;
    }

    .title {
        color: var(--vp-c-text-2);
    }
}

.form-ui {

    textarea,
    input,
    button {
        border: 1px solid var(--vp-c-border);
        border-radius: 8px;
        transition: border-color 0.25s;
        font-size: 16px;

        &:hover {
            border-color: var(--vp-c-brand-1);
        }
    }

    textarea {
        width: 100%;
        padding: 5px;
        height: 80px;
        resize: none;

        &:focus {
            border-color: var(--vp-c-brand-1);
            background-color: var(--vp-c-bg);
        }
    }

    button {
        padding: 0 10px 0 12px;
        height: 35px;

        &:active {
            background-color: var(--vp-c-bg-alt);
        }
    }
}
</style>
