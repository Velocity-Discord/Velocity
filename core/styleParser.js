const logger = require("./logger")

function varParser(css) {
    let newCSS = css;
    let matchRgx = /\/\*[\s]*@var.*:[\s]*.*\*\//g;
    let varRgx = /\/\*[\s]?@var\s(.*):[\s]?(.*)\*\//;
    let variables = css.match(matchRgx);
    if (variables) {
        variables.forEach((v) => {
            let a = v.match(varRgx);
            newCSS = newCSS.replaceAll(new RegExp(":\\s?(?<!-)-" + a[1], "g"), `: ${a[2]}`);
        });
    }

    return newCSS;
}

function ifParser(css) {
    let newCSS = css;
    let matchRgx = /\/\*[\s]*@if[\s](.*)\*\/([\s].*)*\/\*[\s]*@end-if[\s]\*\//g;
    let ifRgx = /\/\*[\s]*@if[\s](.*)\*\//;
    let cRgx = /\*\/([\s].*)*\/\*[\s]*@end-if/;
    let ifs = css.match(matchRgx);
    if (ifs) {
        ifs.forEach((v) => {
            let condition = v.match(ifRgx)[1];
            let content = v.match(cRgx);
            newCSS = newCSS.replace(v, "")

            let c = content[0].replace("*/", "").replace(/\/\*[\s]*@end-if/, "");

            try {
                eval(`if (${condition}) {
                    newCSS = newCSS + \`
${c}

/* ${condition} */
                    \`
                    }`);
            } catch (e) {
                logger.error("Style Parser", e)
            }
        });
    }

    return newCSS;
}

function parse(css) {
    let newCSS = css;

    newCSS = ifParser(newCSS)
    newCSS = varParser(newCSS)

    return newCSS;
}

module.exports = { varParser, ifParser, parse };