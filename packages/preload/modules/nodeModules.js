const node_fs = require("fs");
const node_originalFs = require("original-fs");

export const path = require("path");
export const sucrase = require("sucrase");
export const electron = require("electron");

export const shell = {
    openPath: electron.shell.openPath,
};

const validateFilePaths = (path) => {
    if (!path.startsWith(process.env.VELOCITY_DIRECTORY)) throw new Error("Blocked access of files outside of Velocity directories.");
};

export const fs = {
    rmSync: (...args) => {
        validateFilePaths(args[0]);
        return node_fs.rmSync(...args);
    },
    mkdirSync: (...args) => {
        validateFilePaths(args[0]);
        return node_fs.mkdirSync(...args);
    },
    existsSync: (...args) => {
        validateFilePaths(args[0]);
        return node_fs.existsSync(...args);
    },
    readFileSync: (...args) => {
        validateFilePaths(args[0]);
        return node_fs.readFileSync(...args);
    },
    writeFileSync: (...args) => {
        validateFilePaths(args[0]);
        return node_fs.writeFileSync(...args);
    },

    readdir: (...args) => {
        validateFilePaths(args[0]);
        return node_fs.readdir(...args);
    },
    writeFile: (...args) => {
        validateFilePaths(args[0]);
        return node_fs.writeFile(...args);
    },

    promises: {
        rm: (...args) => {
            validateFilePaths(args[0]);
            return node_fs.promises.rm(...args);
        },
        writeFile: (...args) => {
            validateFilePaths(args[0]);
            return node_fs.promises.writeFile(...args);
        },
    },
};

export const originalFs = {
    existsSync: (...args) => {
        validateFilePaths(args[0]);
        return node_originalFs.existsSync(...args);
    },
    writeFileSync: (...args) => {
        validateFilePaths(args[0]);
        return node_originalFs.writeFileSync(...args);
    },
};
