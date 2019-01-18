#!/usr/bin/env node

const {getPossibilities, headers, log, strings} = require("./internal");
const path = require("path");
const fs = require("fs");
const minimist = require("minimist");

let data = "";
const stdin = process.openStdin();
const config = minimist(
    process.argv.slice(2),
    {
        alias: {'c': 'create', 'b': 'barrel'},
        default: {barrel: 'index.ts'}
    }
);

stdin.on('data', function (chunk) {
    data += chunk;
});

stdin.on('end', function () {
    if (data.trim().length === 0) {
        headers.NgBarrel();
        log.error("No input received.");
        return;
    }

    headers.Angular();
    log.withIndention(data);

    const regex = /CREATE ((.+\/)(((?!spec).)*)\.ts) \(\d+ bytes\)/gm; // matches .ts files without .spec.ts
    const str = data;
    let m;

    let matched = false;
    while ((m = regex.exec(str)) !== null) {
        matched = true;
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        const [, , directory, moduleName] = m;

        headers.NgBarrel();

        if (config.create !== undefined) {
            const p = path.join(directory, config.create);
            const newFile = path.join(p, config.barrel);

            const fromPath = strings.trimStart(p, directory + moduleName);
            const exportStatement = strings.exportStatement(fromPath);

            const fileExists = fs.existsSync(newFile);

            if (fileExists) {
                fs.appendFileSync(newFile, `${exportStatement}\n`);
            } else {
                fs.writeFileSync(newFile, `${exportStatement}\n`);
            }
            log.fileWriteEvent(exportStatement, newFile, fileExists ? 'UPDATE' : 'NEW');
        } else {
            const possiblePlaces = getPossibilities(directory, config.barrel);
            const closestBarrel = possiblePlaces.find(path => fs.existsSync(path));

            if (closestBarrel !== undefined) {
                const closestBarrelPath = strings.trimEnd(config.barrel, closestBarrel);

                const fromPath = strings.trimStart(closestBarrelPath, directory + moduleName);
                const exportStatement = strings.exportStatement(fromPath);

                fs.appendFileSync(closestBarrel, `${exportStatement}\n`);
                log.fileWriteEvent(exportStatement, closestBarrel);
            } else {
                log.error(`No barrel file named '${config.barrel}' found in tree. No --create/-c argument set either.`);
            }
        }
    }
    if (!matched) {
        headers.NgBarrel();
        log.error("My RegEx didn't match any Angular output! :(");
    }
});
