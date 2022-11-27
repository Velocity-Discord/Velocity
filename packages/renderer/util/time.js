export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitUntil = async (condition) => {
    let item;
    while (!(item = condition())) await sleep(1);
    return item;
};

export const relative = (compare, base = Date.now()) => {
    const units = [
        ["year", 31536000000],
        ["month", 2628000000],
        ["day", 86400000],
        ["hour", 3600000],
        ["minute", 60000],
        ["second", 1000],
    ];

    const diff = base - compare;

    for (const [unit, ms] of units) {
        if (diff >= ms) {
            const amount = Math.floor(diff / ms);
            return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`;
        }

        if (unit === "second") return "just now";
    }
};
