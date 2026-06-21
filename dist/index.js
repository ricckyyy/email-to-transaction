"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMBC_CARD_CONFIG = void 0;
exports.parseEmail = parseEmail;
const extractor_js_1 = require("./extractor.js");
const parser_js_1 = require("./parser.js");
var smbc_js_1 = require("./configs/smbc.js");
Object.defineProperty(exports, "SMBC_CARD_CONFIG", { enumerable: true, get: function () { return smbc_js_1.SMBC_CARD_CONFIG; } });
function parseEmail(rawEmail, configs) {
    const fromMatch = rawEmail.match(/^From:.*@([\w.-]+)/im);
    if (!fromMatch)
        return null;
    const senderDomain = fromMatch[1].toLowerCase();
    const config = configs.find((c) => senderDomain.endsWith(c.senderDomain.toLowerCase()));
    if (!config)
        return null;
    const text = (0, extractor_js_1.extractPlainText)(rawEmail);
    if (!text)
        return null;
    return (0, parser_js_1.parseFields)(text, config);
}
