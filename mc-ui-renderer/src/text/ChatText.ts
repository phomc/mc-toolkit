export type ChatText = string | ChatObject | ChatText[];

export interface ChatObject {
    text?: string;
    
    bold?: boolean; italic?: boolean; underlined?: boolean; strikethrough?: boolean;
    obfuscated?: boolean;

    color?: ChatColor;

    insertion?: string;
    extra?: ChatText[];
    font?: string;

    [x: string]: any;
}

export type ClassicChatColor =
    | "black" | "dark_blue" | "dark_green" | "dark_aqua" | "dark_red" | "dark_purple" | "gold"
    | "gray" | "dark_gray" | "blue" | "green" | "aqua" | "red" | "light_purple" | "yellow"
    | "white"
    | "reset"
;
export type ChatColor = "reset" | `#${string}` | ClassicChatColor;

export function styleFromColor(color: ChatColor): string {
    if (color == "reset") return null;
    if (color.startsWith("#")) return color;

    switch (color) {
        case "black": return "#000000";
        case "dark_blue": return "#0000aa";
        case "dark_green": return "#00aa00";
        case "dark_aqua": return "#00aaaa";
        case "dark_red": return "#aa0000";
        case "dark_purple": return "#aa00aa";
        case "gold": return "#ffaa00";
        case "gray": return "#aaaaaa";
        case "dark_gray": return "#555555";
        case "blue": return "#5555ff";
        case "green": return "#55ff55";
        case "aqua": return "#55ffff";
        case "red": return "#ff5555";
        case "light_purple": return "#ff55ff";
        case "yellow": return "#ffff55";
        case "white": return "#ffffff";
        default: return null;
    }
}

export function colorToLegacy(color: ChatColor) {
    if (color == null) return "";
    if (color == "reset") return "§r";
    if (color.startsWith("#")) return `§x§${color[1]}§${color[2]}§${color[3]}§${color[4]}§${color[5]}§${color[6]}`;

    switch (color) {
        case "black": return "§0";
        case "dark_blue": return "§1";
        case "dark_green": return "§2";
        case "dark_aqua": return "§3";
        case "dark_red": return "§4";
        case "dark_purple": return "§5";
        case "gold": return "§6";
        case "gray": return "§7";
        case "dark_gray": return "§8";
        case "blue": return "§9";
        case "green": return "§a";
        case "aqua": return "§b";
        case "red": return "§c";
        case "light_purple": return "§d";
        case "yellow": return "§e";
        case "white": return "§f";
        default: return "";
    }
}

export function convertToLegacy(text: ChatText): string {
    if (typeof text == "string") return text;
    else if (text instanceof Array) {
        return text.map(v => convertToLegacy(v)).join("");
    } else {
        let styles =
            (text.bold? "§l" : "") +
            (text.italic? "§o" : "") +
            (text.underlined? "§n" : "") +
            (text.strikethrough? "§m" : "") +
            (text.obfuscated? "§l" : "");
        return "§r" + colorToLegacy(text.color) + styles + (text.text ?? "") + (text.extra? text.extra.map(v => convertToLegacy(v)) : "");
    }
}