import { ResourcesLoader } from "../resources/ResourcesLoader";
import { ChatText } from "../text/ChatText";
import { FontMapping } from "./FontMapping";
import { FontProvider } from "./FontProvider";

export class FontRenderer {
    offscreenCanvas: OffscreenCanvas;
    fontMaps: FontMap[] = [];
    characters: Map<string, CharacterMap> = new Map();

    constructor(
        public resourcesLoader: ResourcesLoader
    ) {
        this.offscreenCanvas = new OffscreenCanvas(1, 1);
    }

    async loadFontFromFile(path: string) {
        let fetchInfo = await fetch(path);
        if (!fetchInfo.ok) return;

        let mapping: FontMapping = await fetchInfo.json();
        for (let i = 0; i < mapping.providers.length; i++) {
            if (mapping.providers[i].type != "bitmap") continue;
            let img = await this.resourcesLoader.loadImage(mapping.providers[i].file);
            this.addFontMap(img, mapping.providers[i]);
        }
    }

    addFontMap(img: HTMLImageElement, provider: FontProvider) {
        this.offscreenCanvas.width = img.width;
        this.offscreenCanvas.height = img.height;
        let ctx = this.offscreenCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        let data = ctx.getImageData(0, 0, img.width, img.height);
        function pixelAt(x = 0, y = 0) {
            const ptr = (y * img.width + x) * 4;
            return [data.data[ptr], data.data[ptr + 1], data.data[ptr + 2], data.data[ptr + 3]];
        }
        function isColPresent(x = 0, y = 0, height = 12) {
            let pixelData: number[];
            for (let i = 0; i < height; i++) {
                pixelData = pixelAt(x, y + i);
                if (pixelData[0] != 0 || pixelData[1] != 0 || pixelData[2] != 0 || pixelData[3] != 0) return true;
            }
            return false;
        }
        function measureWidth(x = 0, y = 0, height = 12, limit = 0, maxWidth = false) {
            let w = 0;
            while (isColPresent(x + w, y, height) && (limit == 0 || w < limit)) w++;
            if (w == 0) return 0;
            if (!maxWidth) return w;

            w++;
            while (!isColPresent(x + w, y, height) && (limit == 0 || w < limit)) w++;
            return w;
        }
        function textureData(x = 0, y = 0, width = 0, height = 0) {
            const out = new Uint8Array(width * height);
            let pixelData: number[];
            for (let yy = 0; yy < height; yy++) for (let xx = 0; xx < width; xx++) {
                pixelData = pixelAt(x + xx, y + yy);
                out[yy * width + xx] = (pixelData[0] != 0 || pixelData[1] != 0 || pixelData[2] != 0 || pixelData[3] != 0)? 1 : 0;
            }
            return out;
        }

        let boxWidth: number, boxWidthFinderVal = 0;
        do {
            boxWidth = measureWidth(0, boxWidthFinderVal * (provider.height ?? 8), provider.height ?? 8, 30, true);
            boxWidthFinderVal++;
        } while (boxWidth == 0);

        let fontMap: FontMap = {
            characters: []
        };

        for (let charsRow = 0; charsRow < provider.chars.length; charsRow++) {
            const y = charsRow * (provider.height ?? 8);
            const chars = provider.chars[charsRow];
            for (let i = 0; i < chars.length; i++) {
                const x = i * boxWidth;
                const width = measureWidth(x, y, (provider.height ?? 8), boxWidth);
                let characterMap: CharacterMap = {
                    fontMap,
                    char: chars[i],
                    x, y,
                    width, height: (provider.height ?? 8),
                    ascent: provider.ascent,
                    texture: textureData(x, y, width, (provider.height ?? 8))
                };

                fontMap.characters.push(characterMap);
                this.characters.set(chars[i], characterMap);
            }
        }
    }

    fillTexture(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        scale: number,
        x: number, y: number, width: number, height: number,
        texture: CharacterTextureData, italic = false
    ) {
        for (let yy = 0; yy < height; yy++) for (let xx = 0; xx < width; xx++) {
            if (texture[yy * width + xx] == 1) {
                if (italic) {
                    const offset = Math.floor((1 - yy / height) * scale * 2) / 2;
                    ctx.fillRect(x + (xx + offset) * scale, y + yy * scale, scale, scale);
                } else ctx.fillRect(x + xx * scale, y + yy * scale, scale, scale);
            }
        }
    }

    fillText(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        text: string,
        scale: number,
        x: number, y: number,
        bold = false, italic = false, underlined = false, strikethrough = false, obfuscated = false
    ) {
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charInfo = this.characters.get(char);
            if (charInfo == null) continue;

            let charWidth = char == " "? 3 : charInfo.width;
            if (obfuscated) {
                ctx.fillRect(x, y - 8 * scale, (charWidth + (bold? 1 : 0)) * scale, 10 * scale);
                if (bold) x += 1 * scale;
            } else {
                this.fillTexture(ctx, scale, x, y - charInfo.ascent * scale, charWidth, charInfo.height, charInfo.texture, italic);
                if (bold) {
                    x += 1 * scale;
                    this.fillTexture(ctx, scale, x, y - charInfo.ascent * scale, charWidth, charInfo.height, charInfo.texture, italic);
                }
            }

            const barWidth = (bold? scale : 0) + (charWidth + (i == text.length - 1? 2 : 1)) * scale;
            if (underlined) ctx.fillRect(x - scale, y, barWidth, scale);
            if (strikethrough) ctx.fillRect(x - scale, y - scale * 4, barWidth, scale);

            x += (charWidth + 1) * scale;
        }
    }

    measureText(text: ChatText, bold = false, italic = false, underlined = false, strikethrough = false, obfuscated = false) {
        let w = 0;
        if (typeof text == "string") {
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char == " ") w += 3;
                
                const charInfo = this.characters.get(char);
                if (charInfo == null) continue;
                w += charInfo.width + (bold? 1 : 0) + 1;
            }
        } else if (text instanceof Array) {
            text.forEach(comp => {
                w += this.measureText(comp, bold, italic, underlined, strikethrough, obfuscated);
            });
        } else {
            if (text.bold !== undefined) bold = text.bold;
            if (text.italic !== undefined) italic = text.italic;
            if (text.underlined !== undefined) underlined = text.underlined;
            if (text.strikethrough !== undefined) strikethrough = text.strikethrough;
            if (text.obfuscated !== undefined) obfuscated = text.obfuscated;

            w += this.measureText(text.text ?? "", bold, italic, underlined, strikethrough, obfuscated);
            text.extra?.forEach(comp => {
                w += this.measureText(comp, bold, italic, underlined, strikethrough, obfuscated);
            });
        }
        return w;
    }
}

interface FontMap {
    characters: CharacterMap[];
}

interface CharacterMap {
    fontMap: FontMap;
    char: string;
    x: number;
    y: number;
    width: number;
    height: number;
    ascent: number;
    texture: CharacterTextureData;
}

type CharacterTextureData = Uint8Array;