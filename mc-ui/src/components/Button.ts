import { ChatText, Renderer } from "@mangoplex/mc-ui-renderer";
import { UserInterface } from "../UserInterface";
import { Component } from "./Component";

const COLORS = ["#000000", "#ffffff", "#d6d6d6", "#808080", "#4d4d4d", "#ffffff"];

export class Button extends Component {
    pressed = false;

    constructor(
        public text: ChatText,
        public tooltip: ChatText[] = null,
        x = 0, y = 0,
        width = 12, height = 18
    ) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.onMouseDown.add(event => { this.pressed = true; });
        this.onMouseUp.add(event => { this.pressed = false; });

        this.onMouseOver.add(event => { event.ui.tooltip = this.tooltip; });
        this.onMouseOut.add(event => {
            this.pressed = false;
            event.ui.tooltip = null;
        });
    }

    renderComponent(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, renderer: Renderer, ui: UserInterface) {
        ctx.fillStyle = COLORS[0];
        renderer.fillFrame(ctx, 0, 0, this.width, this.height);
        
        ctx.fillStyle = this.pressed? COLORS[4] : COLORS[2];
        renderer.fillFrame(ctx, renderer.uiScale, renderer.uiScale, this.width - 2, 1);
        
        ctx.fillStyle = this.pressed? COLORS[3] : COLORS[3];
        renderer.fillFrame(ctx, renderer.uiScale, renderer.uiScale * 2, this.width - 2, this.height - 4);
        
        ctx.fillStyle = this.pressed? COLORS[2] : COLORS[4];
        renderer.fillFrame(ctx, renderer.uiScale, (this.height - 2) * renderer.uiScale, this.width - 2, 1);

        ctx.fillStyle = COLORS[5];
        const centerX = Math.floor((this.width - renderer.fontRenderer.measureText(this.text) + 1) / 2);
        const centerY = Math.floor((this.height + 6) / 2);
        renderer.drawText(ctx, this.text, renderer.uiScale * centerX, renderer.uiScale * centerY);
    }
}