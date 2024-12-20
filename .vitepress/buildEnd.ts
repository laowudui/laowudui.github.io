import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function findFilesSync(dirPath: string) {
    const files: string[] = [];
    fs.readdirSync(dirPath).forEach((itemName: string) => {
        const itemPath = path.join(dirPath, itemName);
        if (fs.statSync(itemPath).isDirectory()) {
            files.push(...findFilesSync(itemPath));
        } else {
            files.push(itemPath);
        }
    });
    return files;
}
function run(command: string) {
    return execSync(command).toString().trim();
}

export function updateServiceWorker(distPath: string) {
    const swPath = path.join(distPath, "sw.js");
    if (fs.existsSync(swPath)) {
        const swManifest = JSON.stringify({
            revision: run("git rev-parse --short=7 HEAD"),
            resources: findFilesSync(distPath)
                .map(filePath => "/" + path.relative(distPath, filePath))
                .concat("/"),
        });
        const swContent = fs.readFileSync(swPath, "utf8");
        const swContentReplaced = swContent.replace("__MANIFEST__", swManifest);
        fs.writeFileSync(swPath, swContentReplaced);
    }
}
