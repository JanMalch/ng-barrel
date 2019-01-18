const Reset = "\x1b[0m";
const Bright = "\x1b[1m";
const FgYellow = "\x1b[33m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgBlue = "\x1b[34m";

function Angular() {
  console.log(FgYellow + Bright + "Angular:" + Reset);
}

function NgBarrel() {
  console.log(FgYellow + Bright + "NgBarrel:" + Reset);
}

exports.headers = {Angular, NgBarrel};

function withIndention(input) {
  console.log(input.split("\n")
    .map(x => "\t" + x)
    .join("\n"));
}

function error(msg) {
  console.log("\t" + FgRed + msg + Reset);
}

function fileWriteEvent(content, path, hint) {
  hint = !!hint ? ` (${hint})` : '';
  console.log('\t' + FgGreen + Bright + content + Reset + ' >> ' + FgBlue + path + Reset + hint);
}

exports.log = {withIndention, error, fileWriteEvent};

function exportStatement(fromPath) {
  return `export * from './${fromPath}';`;
}

function trimStart(prefix, input) {
  return input.substring(prefix.length)
}

function trimEnd(suffix, input) {
  return input.substring(0, input.length - suffix.length)
}


exports.strings = {exportStatement, trimStart, trimEnd};

exports.getPossibilities = function(directory, barrelFile) {
  const parts = directory.split("/");
  const possible = [];

  for (let i = parts.length - 1; i >= 0; i--) {
    possible.push(parts.slice(0, i).join("/") + "/" + barrelFile);
  }

  return possible;
};
