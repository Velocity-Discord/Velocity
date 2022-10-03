export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitUntil = async (condition) => {
    let item;
    while (!(item = condition())) await sleep(1);
    return item;
};
