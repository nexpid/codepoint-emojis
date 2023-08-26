import { existsSync } from "fs";
import { mkdir, rm, readdir, readFile } from "fs/promises";
import { join } from "path";
import runner, { tmpDir } from "./runner.mjs";
import { toKebabCase } from "js-convert-case";

console.time("Done");

const keepTmp = process.argv.includes("--keep-tmp");

if (existsSync(join("../../", "data")))
  await rm(join("../../", "data"), { force: true, recursive: true });
if (existsSync(tmpDir) && !keepTmp)
  await rm(tmpDir, { force: true, recursive: true });

await mkdir(join("../../", "data"));
if (!existsSync(tmpDir)) await mkdir(tmpDir);

const msSkintones = [
  "Default",
  "Light",
  "Medium-Light",
  "Medium",
  "Medium-Dark",
  "Dark",
];

const animatedPaths = {};

await runner(
  "microsoft/fluentui-emoji",
  async (path) => {
    const paths = [];
    for (const x of await readdir(join(path, "assets"))) {
      const metadata = JSON.parse(
        await readFile(join(path, "assets", x, "metadata.json"), "utf8")
      );
      if (metadata.unicodeSkintones) {
        for (let i = 0; i < msSkintones.length; i++) {
          const imgFolder = join(path, "assets", x, msSkintones[i], "3D");
          paths.push([
            join(imgFolder, (await readdir(imgFolder))[0]),
            `${toKebabCase(metadata.unicodeSkintones[i])}.png`,
          ]);

          animatedPaths[`${x.toLowerCase()} ${msSkintones[i].toLowerCase()}`] =
            toKebabCase(metadata.unicodeSkintones[i]);
        }
      } else {
        const imgFolder = join(path, "assets", x, "3D");
        paths.push([
          join(imgFolder, (await readdir(imgFolder))[0]),
          `${toKebabCase(metadata.unicode)}.png`,
        ]);

        animatedPaths[x.toLowerCase()] = toKebabCase(metadata.unicode);
      }
    }

    return {
      folder: "fluentui-emoji-static",
      paths,
    };
  },
  keepTmp
);
await runner(
  "nexpid/Animated-Fluent-Emojis",
  async (path) => {
    const additional = Object.fromEntries(
      Object.entries(
        (0, eval)(await readFile(join(path, "additional.mjs"), "utf8"))
      ).map(([x, y]) => [
        x.toLowerCase(),
        Array.from(y)
          .map((x) => x?.codePointAt(0)?.toString(16))
          .filter((x) => !!x)
          .join("-"),
      ])
    );

    const paths = [];
    for (const category of await readdir(join(path, "Emojis")))
      for (const emoji of await readdir(join(path, "Emojis", category))) {
        const name = emoji.split(".").slice(0, -1).join(".").toLowerCase();
        const codepoint = animatedPaths[name] ?? additional[name];
        if (codepoint)
          paths.push([
            join(path, "Emojis", category, emoji),
            `${codepoint}.png`,
          ]);
      }

    return {
      folder: "fluentui-emoji-animated",
      paths,
    };
  },
  keepTmp
);

console.timeEnd("Done");
