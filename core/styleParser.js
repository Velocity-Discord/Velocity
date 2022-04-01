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

module.exports = { varParser }