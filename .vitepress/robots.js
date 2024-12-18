import path from "path";
import fs from "fs";

export default async function (outDir, data) {
    try {
        await fs.promises.writeFile(
            path.join(outDir, "robots.txt"),
            Object.entries(data).map(([key, value]) => `${key}: ${value}`).join("\n"),
        );
    } catch (e) {
        console.error("robots.txt:", e.message);
    }
}
