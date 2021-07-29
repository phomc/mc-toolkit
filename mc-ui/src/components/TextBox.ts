import { Renderer } from "../../../mc-ui-renderer/dist";
import { UserInterface } from "../UserInterface";
import { FocusComponent } from "./FocusComponent";

const COLORS = ["#000000", "#acacac", "#ffffff"]

export class TextBox extends FocusComponent {
    private caretPosition = 0;
    private _unfocus = false;

    constructor(
        public contents = "",
        public placeholder = ""
    ) {
        super();
        this.caretPosition = contents.length;

        this.onKeyDown.add(event => {
            if (event.key == "Enter") {
                this._unfocus = true;
                return;
            }
            if (event.key.length > 1 && !["ArrowLeft", "ArrowRight", "Backspace"].includes(event.key)) return;

            if (event.code == "ArrowLeft") {
                if (this.caretPosition > 0) this.caretPosition--;
            } else if (event.code == "ArrowRight") {
                if (this.caretPosition < this.contents.length) this.caretPosition++;
            } else if (event.code == "Backspace") {
                if (this.contents.substr(0, this.caretPosition).length > 0) {
                    this.contents = this.contents.substr(0, this.caretPosition - 1) + this.contents.substr(this.caretPosition);
                    this.caretPosition--;
                }
            } else {
                this.contents = this.contents.substr(0, this.caretPosition) + event.key + this.contents.substr(this.caretPosition);
                this.caretPosition++;
            }
        });
    }

    caretToEnd() {
        this.caretPosition = this.contents.length;
    }

    renderComponent(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, renderer: Renderer, ui: UserInterface) {
        if (this._unfocus) {
            this._unfocus = false;
            ui.focus = null;
        }

        ctx.fillStyle = ui.focus == this? COLORS[2] : COLORS[1];
        renderer.fillFrame(ctx, 0, 0, this.width, this.height);

        ctx.fillStyle = COLORS[0];
        renderer.fillFrame(ctx, renderer.uiScale, renderer.uiScale, this.width - 2, this.height - 2);
        
        ctx.fillStyle = this.contents.length > 0? COLORS[2] : COLORS[1];
        const centerY = Math.floor((this.height + 6) / 2);
        renderer.drawText(ctx, this.contents.length? this.contents : this.placeholder, renderer.uiScale * 8, renderer.uiScale * centerY);

        if (ui.focus == this) {
            let width = renderer.fontRenderer.measureText(this.contents.substr(0, this.caretPosition));
            ctx.fillRect((width + 8) * renderer.uiScale, (centerY - 9) * renderer.uiScale, renderer.uiScale, renderer.uiScale * 12);
        }
    }
}