// API for interrogating the command "database"

import bashCmds from "../assets/cmds/bash.js";
import jsCmds from "../assets/cmds/js.js";
import pyCmds from "../assets/cmds/python.js";
import htmlCmds from "../assets/cmds/html.js";
import kubernetesCmds from "../assets/cmds/kubernetes.js";

const allCmds = _.union(
    bash().cmds,
    js().cmds,
    py().cmds,
    kubernetes().cmds,
    html().cmds /* and other langs as needed */
);

export const cmdsByLang = {
    bash: bash(),
    js: js(),
    py: py(),
    html: html(),
    kubernetes: kubernetes(),
};

export function all() {
    return allCmds;
}

export function bash() {
    return bashCmds;
}

export function js() {
    return jsCmds;
}

export function py() {
    return pyCmds;
}

export function html() {
    return htmlCmds;
}

export function kubernetes() {
    return kubernetesCmds;
}


export function longest() {
    return allCmds.reduce(function(a, b) {
        return a.length > b.length ? a : b;
    }).length;
}

export function find(cmd) {
    const result = {
        lang: []
    };
    cmd = cmd.trim(); // Trim the command once outside the loop

    // Loop through each language's command list
    for (let lang in cmdsByLang) {
        // Iterate over each command or command array in the command list
        cmdsByLang[lang].cmds.forEach(command => {
            // If command is an array, check if the trimmed command matches any command in the array
            if (Array.isArray(command) && command.includes(cmd)) {
                result.cmd = command[0]; // Set result.cmd to the first command in the array
                result.lang.push(lang);
            } else if (command === cmd) { // If it's not an array, check for direct equality
                result.cmd = cmd; // Set result.cmd to the command itself
                result.lang.push(lang);
            }
        });
    }
    return result;
}

export function getLanguages() {
    let languages = [];
    Object.values(cmdsByLang).forEach(element => {
        languages.push(element.name);
    });
    return languages;
}

export function getLanguageKeys() {
    return Object.keys(cmdsByLang);
}

export function getLanguageById(name) {
    return cmdsByLang[name] ?? {};
}
