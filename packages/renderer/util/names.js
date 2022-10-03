export default {
    formatName(name) {
        // take something like 'this-name' and turn it into 'This Name'

        const words = name.split(/[-_]/);
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].slice(1);
        }

        return words.join(" ");
    },
};
