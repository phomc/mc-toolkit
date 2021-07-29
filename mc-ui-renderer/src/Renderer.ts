import { FontRenderer } from "./fonts/FontRenderer";
import { ResourcesLoader } from "./resources/ResourcesLoader";
import { ChatText, styleFromColor } from "./text/ChatText";

const TOOLTIPS_BACKGROUND = "#1E0F1E";
const TOOLTIPS_BORDER_LIGHT = "#2E0A65";

export class Renderer {
    uiScale = 2.0;

    resourcesLoader: ResourcesLoader;
    fontRenderer: FontRenderer;

    constructor() {
        this.resourcesLoader = new ResourcesLoader();
        this.fontRenderer = new FontRenderer(this.resourcesLoader);
    }

    async loadAssets() {
        console.log("Loading assets...");
        await this.fontRenderer.loadFontFromFile("assets/font_default.json");
    }

    fillText(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        text: string,
        x: number, y: number,
        bold = false, italic = false, underlined = false, strikethrough = false, obfuscated = false
    ) {
        this.fontRenderer.fillText(ctx, text, this.uiScale, x, y, bold, italic, underlined, strikethrough, obfuscated);
    }

    drawText(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        text: ChatText,
        x: number, y: number,
        bold = false, italic = false, underlined = false, strikethrough = false, obfuscated = false
    ) {
        let oldStyle = ctx.fillStyle;
        if (typeof text == "string") this.fillText(ctx, text, x, y, bold = false, italic = false, underlined = false, strikethrough = false, obfuscated = false);
        else if (text instanceof Array) {
            let currWidth = 0;
            text.forEach(comp => {
                this.drawText(ctx, comp, x + currWidth * this.uiScale, y, bold, italic, underlined, strikethrough, obfuscated);
                currWidth += this.fontRenderer.measureText(comp, bold, italic, underlined, strikethrough, obfuscated);
            });
        } else {
            if (text.bold !== undefined) bold = text.bold;
            if (text.italic !== undefined) italic = text.italic;
            if (text.underlined !== undefined) underlined = text.underlined;
            if (text.strikethrough !== undefined) strikethrough = text.strikethrough;
            if (text.obfuscated !== undefined) obfuscated = text.obfuscated;

            if (text.color) ctx.fillStyle = styleFromColor(text.color);
            if (text.text) this.fillText(ctx, text.text, x, y, bold, italic, underlined, strikethrough, obfuscated);
            if (text.extra) {
                let currWidth = text.text? this.fontRenderer.measureText(text.text, bold, italic, underlined, strikethrough, obfuscated) : 0;
                text.extra.forEach(comp => {
                    this.drawText(
                        ctx, comp, x + currWidth * this.uiScale, y,
                        italic, underlined, strikethrough, obfuscated
                    );
                    currWidth += this.fontRenderer.measureText(comp, bold, italic, underlined, strikethrough, obfuscated);
                });
            }
        }

        ctx.fillStyle = oldStyle;
    }

    drawTooltip(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        x: number, y: number, width: number, height: number
    ) {
        let prevStyle = ctx.fillStyle;
        ctx.fillStyle = TOOLTIPS_BACKGROUND;
        ctx.fillRect(x + this.uiScale, y + this.uiScale, (width - 2) * this.uiScale, (height - 2) * this.uiScale);
        ctx.fillRect(x + this.uiScale, y, (width - 2) * this.uiScale, this.uiScale);
        ctx.fillRect(x + this.uiScale, y + (height - 1) * this.uiScale, (width - 2) * this.uiScale, this.uiScale);
        ctx.fillRect(x, y + this.uiScale, this.uiScale, (height - 2) * this.uiScale);
        ctx.fillRect(x + (width - 1) * this.uiScale, y + this.uiScale, this.uiScale, (height - 2) * this.uiScale);
        
        ctx.fillStyle = TOOLTIPS_BORDER_LIGHT;
        ctx.fillRect(x + this.uiScale, y + this.uiScale, (width - 2) * this.uiScale, this.uiScale);
        ctx.fillRect(x + this.uiScale, y + (height - 2) * this.uiScale, (width - 2) * this.uiScale, this.uiScale);
        ctx.fillRect(x + this.uiScale, y + this.uiScale, this.uiScale, (height - 2) * this.uiScale);
        ctx.fillRect(x + (width - 2) * this.uiScale, y + this.uiScale, this.uiScale, (height - 2) * this.uiScale);

        ctx.fillStyle = prevStyle;
    }

    drawItemTooltip(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        x: number, y: number, itemLore: ChatText[]
    ) {
        ctx.fillStyle = "white";
        
        let maxWidth = 0;
        itemLore.forEach(line => {
            maxWidth = Math.max(maxWidth, this.fontRenderer.measureText(line));
        });

        this.drawTooltip(ctx, x, y, maxWidth + 7, 6 + 10 * itemLore.length + (itemLore.length > 1? 2 : 0));
        itemLore.forEach((line, index) => {
            let fy = 1 + 10 * (index + 1);
            if (index >= 1) fy += 2;
            this.drawText(ctx, line, x + this.uiScale * 4, y + this.uiScale * fy);
        });
    }

    fillFrame(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        x: number, y: number, width: number, height: number
    ) {
        ctx.fillRect(x, y, width * this.uiScale, height * this.uiScale);
    }

    drawItemSlot(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        x: number, y: number
    ) {
        ctx.fillStyle = "#373737";
        ctx.fillRect(x, y, 18 * this.uiScale, 18 * this.uiScale);

        ctx.fillStyle = "#8B8B8B";
        ctx.fillRect(x + this.uiScale, y + this.uiScale, 16 * this.uiScale, 16 * this.uiScale);
        ctx.fillRect(x + this.uiScale * 17, y, this.uiScale, this.uiScale);
        ctx.fillRect(x, y + this.uiScale * 17, this.uiScale, this.uiScale);
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + this.uiScale * 17, y + this.uiScale, this.uiScale, 16 * this.uiScale);
        ctx.fillRect(x + this.uiScale, y + this.uiScale * 17, this.uiScale * 17, this.uiScale);
    }
}