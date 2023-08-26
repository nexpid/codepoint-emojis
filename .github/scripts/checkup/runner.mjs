import { execSync } from "child_process";
import { join } from "path";
import { toKebabCase } from "js-convert-case";
import { copyFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

export const tmpDir = join("../../", "tmp");

/**
 * @param repo {string}
 * @param callback {(path: string) => Promise<{ folder: string, paths: [ string, string ][] }>}
 * @param keepTmp {boolean}
 */
export default async (repo, callback, keepTmp) => {
  const id = toKebabCase(repo);
  if (!keepTmp || !existsSync(join(tmpDir, id))) {
    console.log(`Cloning ${repo}...\n`);
    execSync(`git clone https://github.com/${repo} ${id}`, {
      stdio: [0, 1, 2],
      cwd: tmpDir,
    });
    console.log("");
  }

  const res = await callback(join(tmpDir, id));

  console.log(`Copying ${res.paths.length} files...`);

  const dataPath = join("../../", "data", res.folder);
  for (const p of res.paths) {
    await mkdir(join(dataPath, p[1], "../"), { recursive: true });
    await copyFile(p[0], join(dataPath, p[1]));
  }
};
