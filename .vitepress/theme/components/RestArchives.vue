<script lang="ts" setup>
import { useData } from "vitepress";
import { ref } from "vue";
import { Octokit } from "octokit";
import { encode, decode } from "js-base64";
import { date } from "../utils/date.ts"

const { page } = useData();
const tokenFromStorage = localStorage.getItem("token") || "";
const searchParams = new URLSearchParams(location.search);

let isLogin = ref(false);
let submit = ref(false);
let content = ref("");
let remoteContent = ref("");

const runtime = {
    repo: "laowudui.github.io",
    user: "laowudui",
    path: () => {
        let path = page.value.filePath;
        if (path == "README.md") {
            path = date("YYYY/MM/DD.md");
        }
        return "archives/" + path;
    },
    token: "",
    sha: "",
    committer: {
        name: "laowudui",
        email: "laowudui@gmail.com",
    },
    headers: {
        "X-GitHub-Api-Version": "2022-11-28",
    },
    markContent: /^##\s+(.+)\n((?:^[^#]+\n?)+)/gm,
};

async function getContent() {
    try {
        const octokit = getOctokit(runtime.token);
        const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner: runtime.user,
            repo: runtime.repo,
            path: runtime.path(),
            headers: runtime.headers,
        });
        if (Array.isArray(data)) {
            // 文件夹
        } else {
            if (data.type == "file") {
                runtime.sha = data.sha;
                remoteContent.value = decode(data.content);
            }
        }
    } catch (error) {
        if (error.status !== 404) {
            alert(error.status);
        }
    }
}
async function updateContent() {
    submit.value = true;
    let newContent = date("## YYYY-MM-DD HH:mm:ss\n") + content.value;
    if (remoteContent.value.length > 0) {
        newContent = remoteContent.value + "\n\n" + newContent;
    }
    try {
        const octokit = getOctokit(runtime.token);
        const { data } = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
            owner: runtime.user,
            repo: runtime.repo,
            path: runtime.path(),
            message: "更新笔记",
            committer: runtime.committer,
            content: encode(newContent),
            sha: runtime.sha,
            headers: runtime.headers,
        });
        runtime.sha = data.content?.sha || "";
        content.value = "";
        remoteContent.value = newContent;
        alert("保存成功!");
    } catch (error) {
        alert(error.message);
    }
    submit.value = false;
}
function markContent() {
    return remoteContent.value.replace(runtime.markContent, (_, title, context) => {
        return `<div class="thought">
                    <div class="title">${title}</div>
                    <div class="context">${context}</div>
                </div>`;
    });
}
function getOctokit(token: string) {
    return new Octokit({
        auth: token,
    });
}
async function tryStartWith(tokenTried: string) {
    try {
        const octokit = getOctokit(tokenTried);
        const { data: { login } } = await octokit.rest.users.getAuthenticated();
        if (login == runtime.user) {
            runtime.token = tokenTried;
            isLogin.value = true;
            localStorage.setItem("token", tokenTried);
            getContent();
        }
    } catch (error) {
        alert(error.message);
        tryStartWith(prompt("更换密钥?") || tokenTried);
    }
}


if (tokenFromStorage) {
    tryStartWith(tokenFromStorage);
} else {
    if (searchParams.get("login") == "prompt") {
        tryStartWith(prompt("密钥") || "");
    }
}
</script>

<template>
    <div v-if="isLogin" class="archives form-ui grid-gap">
        <textarea v-model="content" placeholder="记录点什么..."></textarea>
        <div v-if="content && !submit" class="flex-end">
            <button @click="updateContent">提交内容</button>
        </div>
        <div class="grid-gap" v-html="markContent()"></div>
    </div>
</template>

<style>
.archives {
    font-size: 14px;
    padding-top: 24px;
    margin-bottom: -50px;

    .thought {
        padding: 0.5em;
        background: var(--vp-c-bg-alt);
        border-radius: 8px;

        .title {
            color: var(--vp-c-text-2);
        }
    }
}

.form-ui {

    textarea,
    button {
        border: 1px solid var(--vp-c-border);
        border-radius: 8px;
        transition: border-color 0.25s;

        &:hover {
            border-color: var(--vp-c-brand-1);
        }
    }

    textarea {
        width: 100%;
        padding: 5px;
        height: 50px;
        resize: none;

        &:focus {
            height: 120px;
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

@media (max-width: 720px) {
    .mac {
        textarea {
            font-size: 16px;
        }
    }
}

.grid-gap {
    display: grid;
    gap: 0.5em;
}

.flex-end {
    display: flex;
    justify-content: flex-end;
}
</style>
