const { revision, resources } = JSON.parse(`__MANIFEST__`);

function logger(method, ...args) {
    const colors = {
        debug: "#808fa3", // --data-gray-color-emphasis
        log: "#30a147",   // --data-green-color-emphasis
        warn: "#b88700",  // --data-yellow-color-emphasis
        error: "#df0c24", // --data-red-color-emphasis
    };
    const style1 = [
        "background: #59636e", // --bgColor-neutral-emphasis
        "color: white",
        "font-weight: bold",
        "padding: 2px 0.5em",
        "border-radius: 3px 0 0 3px",
    ].join(";");
    const style2 = [
        `background: ${colors[method]}`,
        "color: white",
        "font-weight: bold",
        "padding: 2px 0.5em",
        "border-radius: 0 3px 3px 0",
    ].join(";");
    console[method]("%c%s%c%s", style1, "Service Worker", style2, ...args);
}
async function cacheAddAll(resources) {
    try {
        const cache = await caches.open(revision);
        await cache.addAll(resources);
        logger("log", "缓存成功!");
    } catch (error) {
        logger("error", "缓存失败", error.message);
    }
}
async function getCachedData(request) {
    try {
        const cache = await caches.open(revision);
        return await cache.match(request);
    } catch (error) {
        logger("error", "缓存获取失败", error.message);
    }
}
async function deleteHistoryCaches() {
    try {
        const keys = await caches.keys();
        for (const key of keys) {
            if (key !== revision) {
                await caches.delete(key);
            }
        }
    } catch (error) {
        logger("error", "历史缓存删除失败", error.message);
    }
}
async function sameOriginCacheFirst(request, target) {
    // 404 => 200
    // 非资源请求返回缓存的404页面
    if (!resources.includes(target.pathname)) {
        request = new Request("/404.html");
    }
    // 缓存优先
    const cached = await getCachedData(request);
    if (cached) {
        if (cached.ok) {
            return cached;
        } else {
            logger("warn", "无效缓存", cached.url);
        }
    }
    return fetch(request);
}

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(cacheAddAll(resources));
});
self.addEventListener("activate", (event) => {
    event.waitUntil(Promise.all([
        self.clients.claim(),
        deleteHistoryCaches(),
    ]));
});
self.addEventListener("fetch", (event) => {
    const target = new URL(event.request.url);
    if (target.origin !== self.location.origin) {
        return;
    }
    event.respondWith(sameOriginCacheFirst(event.request, target));
});
