const internalPatches = [
    { name: "VelocityInternal-GuildTooltip-Patch" },
    { name: "VelocityInternal-Badge-Patch" },
    { name: "VelocityInternal-Settings-Patch", warning: true },
    { name: "VelocityInternal-Settings-Info-Patch" },
    { name: "VelocityInternal-Protocol-Patch", beta: true, warning: true },
];

module.exports = { internalPatches };
