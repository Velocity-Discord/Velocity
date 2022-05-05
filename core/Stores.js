const { createHash, randomBytes } = require("crypto");

const internalPatches = [];
const InternalSecurityToken = createHash("sha512").update(randomBytes(30).toString()).digest("hex");

module.exports = { internalPatches, InternalSecurityToken };
