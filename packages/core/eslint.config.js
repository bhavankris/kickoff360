const { base, corePurity } = require("@repo/config/eslint-preset");

module.exports = [...base, ...corePurity];
