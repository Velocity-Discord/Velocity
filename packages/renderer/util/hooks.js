export const useFilter = (items, filter) => {
    let filteredItems = [];

    switch (typeof filter) {
        case "string":
            items.map((item) => {
                if (item.name && item.description && item.author) {
                    if (item.name.toLowerCase().includes(filter.toLowerCase())) {
                        filteredItems.push(item);
                    } else if (item.description.toLowerCase().includes(filter.toLowerCase())) {
                        filteredItems.push(item);
                    } else if (item.author.name.toLowerCase().includes(filter.toLowerCase())) {
                        filteredItems.push(item);
                    }
                }
            });
            break;
        case "object":
            items.map((item) => {
                if (item.name && item.description && item.author) {
                    if (item.name.toLowerCase().includes(filter.target.value.toLowerCase())) {
                        filteredItems.push(item);
                    } else if (item.description.toLowerCase().includes(filter.target.value.toLowerCase())) {
                        filteredItems.push(item);
                    } else if (item.author.name.toLowerCase().includes(filter.target.value.toLowerCase())) {
                        filteredItems.push(item);
                    }
                }
            });
            break;
    }

    return filteredItems;
};

export const useForceUpdate = () => {
    const [value, setValue] = React.useState(0);
    return () => setValue((value) => value + 1);
};
