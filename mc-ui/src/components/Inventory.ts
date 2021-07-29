import { Renderer } from "../../../mc-ui-renderer/dist";
import { Item } from "../core/Item";
import { UserInterface } from "../UserInterface";
import { Component } from "./Component";

export class Inventory extends Component {
    get width() { return this.columns * 18; }
    get height() { return this.rows * 18; }

    readonly slots: Item[];
    private _hovering = [-1, -1];

    constructor(
        public readonly columns = 9,
        public readonly rows = 6
    ) {
        super();
        this.slots = new Array<Item>(columns * rows);
        this.onMouseMove.add(event => {
            const slotCoord = [
                Math.floor(event.componentX / 18),
                Math.floor(event.componentY / 18)
            ];
            const slotIndex = slotCoord[1] * columns + slotCoord[0];
            const slot = this.slots[slotIndex];
            if (slot) {
                if (slot.meta?.tooltip) event.ui.tooltip = slot.meta.tooltip;
            } else {
                event.ui.tooltip = null;
            }

            [this._hovering[0], this._hovering[1]] = slotCoord;
        });
        this.onMouseOut.add(event => {
            [this._hovering[0], this._hovering[1]] = [-1, -1];
        });
    }

    renderComponent(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, renderer: Renderer, ui: UserInterface) {
        for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.columns; x++) {
            renderer.drawItemSlot(ctx, x * 18 * renderer.uiScale, y * 18 * renderer.uiScale);
            // TODO: draw item icon
            if (this._hovering[0] == x && this._hovering[1] == y) {
                ctx.fillStyle = "#ffffff7f";
                renderer.fillFrame(ctx, (1 + x * 18) * renderer.uiScale, (1 + y * 18) * renderer.uiScale, renderer.uiScale * 16, renderer.uiScale * 16);
            }
        }
    }
}