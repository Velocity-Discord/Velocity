const { createHash, randomBytes } = require("crypto");

const internalPatches = [];
let InternalSecurityToken = createHash("sha512").update(randomBytes(30).toString()).digest("hex");

module.exports = { internalPatches, InternalSecurityToken };
