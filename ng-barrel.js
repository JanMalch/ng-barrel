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
        alias: {'b': 'barrel', 'v': 'version', 'h': 'help'},
        boolean: ['version', 'help'],
        default: {barrel: 'index.ts'}
    }
);

if (config.version) {
    console.log("2.0.0");
    process.exit(0);
}

if (config.help) {
    console.log(`
    Usage:
        ng g c foo | ngb [create-path] [options]
        
    Arguments:
        [create-path]      define path to put barrel file, relative to created .ts files

    Options:
        -h, --help         print usage information
        -v, --version      show version info and exit
        -b, --barrel       define barrel file name, default: index.ts`);
    process.exit(0);
}

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

        const isPathProvidedWithoutOption = config["_"] && !!config["_"][0];
        if (isPathProvidedWithoutOption) {
            config.create = config["_"][0];
        }

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
