export default {
    intToHex(int) {
        const hex = int.toString(16);
        const final = hex.length !== 6 ? "0".repeat(6 - hex.length) + hex : hex;
        return `#${final}`;
    },
    hexToRGB(hex) {
        const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
        return [r, g, b];
    },
    rgbToHSL(rgb) {
        const { r: r255, g: g255, b: b255 } = rgb;

        const r = r255 / 255;
        const g = g255 / 255;
        const b = b255 / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);

        let h = (max + min) / 2;
        let s = h;
        let l = h;

        if (max === min) {
            return [0, 0, l];
        }

        const d = max - min;
        s = l >= 0.5 ? d / (2 - (max + min)) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + 0) * 60;
                break;
            case g:
                h = ((b - r) / d + 2) * 60;
                break;
            case b:
                h = ((r - g) / d + 4) * 60;
                break;
        }

        return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
    },
    hexToHSL(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        const rHex = parseInt(result[1], 16);
        const gHex = parseInt(result[2], 16);
        const bHex = parseInt(result[3], 16);

        const r = rHex / 255;
        const g = gHex / 255;
        const b = bHex / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        let h = (max + min) / 2;
        let s = h;
        let l = h;

        if (max === min) {
            return [0, 0, l];
        }

        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;

        s = s * 100;
        s = Math.round(s);
        l = l * 100;
        l = Math.round(l);
        h = Math.round(360 * h);

        return [h, s, l];
    },
    rgbToHex(rgb) {
        const { r, g, b } = rgb;
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    },
    hslToRGB(hsl) {
        const h = hsl[0] / 360;
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
    getType(value) {
        const val = value.toLowerCase().trim();

        if (val.startsWith("#")) return "hex";
        if (val.startsWith("rgba")) return "rgba";
        if (val.startsWith("rgb")) return "rgb";
        if (val.startsWith("hsla")) return "hsla";
        if (val.startsWith("hsl")) return "hsl";
        return "int";
    },
    getVariable(variable, type) {
        const root = document.documentElement;
        const value = getComputedStyle(root)
            .getPropertyValue(variable.startsWith("--") ? variable : `--${variable}`)
            .trim();

        if (value.includes("calc")) return value;
        if (value.includes("var")) return value;

        const typed = this.getType(value);

        switch (type) {
            case "hex":
                if (typed === "hex") return value;
                if (typed === "rgb") return this.rgbToHex(value);
                if (typed === "hsl") return this.rgbToHex(this.hslToRGB(value));
                break;
            case "rgb":
                if (typed === "rgb") return value;
                if (typed === "hex") return this.hexToRGB(value);
                if (typed === "hsl") return this.hslToRGB(value);
            case "hsl":
                if (typed === "hsl") return value;
                if (typed === "hex") return this.rgbToHSL(this.hexToRGB(value));
                if (typed === "rgb") return this.rgbToHSL(value);
            default:
                return value;
        }

        return null;
    },
    formatHex(hex) {
        switch (hex.length) {
            case 4:
                return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
            case 7:
                return hex;
            case 9:
                return hex.substring(0, 7);
            default:
                return null;
        }
    },
    getRootVariables(css) {
        const root = css.match(/:root,*[\s]*.*\{([^}]+)\}/);
        if (!root) return [];

        const variables = root[1].match(/--[^:]+:[^;]+/g);
        if (!variables) return [];

        return variables.map((variable) => {
            const [name, value] = variable.split(":");
            return { name: name.trim(), value: value.trim() };
        });
    },
};
