import { ChatObject, ChatText, convertToLegacy, Renderer } from "@mangoplex/mc-ui-renderer";
import { UserInterface } from "../../UserInterface";
import { Button } from "../Button";
import { Component } from "../Component";
import { ChatTextEditor } from "./ChatTextEditor";

export class TooltipEditor extends Component {
    chatText: ChatTextEditor;
    tooltip: ChatObject[][] = [[{text: "Hello Tooltip!"}]];
    tooltipPointer = 0;

    previousLine: Button;
    nextLine: Button;
    insertLine: Button;
    removeLine: Button;
    
    copyAsYAML: Button;

    constructor() {
        super();

        this.chatText = new ChatTextEditor();
        this.chatText.x = 0; this.chatText.y = 18;
        this.chatText.width = 0; this.chatText.height = 96;

        this.chatText.chatText = this.tooltip[0];

        this.previousLine = new Button("<", [
            {text: "Previous Line", color: "yellow"},
            {text: "Select the previous line"}
        ], 8, 38 + 96, 18, 18);
        this.nextLine = new Button(">", [
            {text: "Next Line", color: "yellow"},
            {text: "Select the next line"}
        ], 26, 38 + 96, 18, 18);
        this.insertLine = new Button("+", [
            {text: "Insert Line", color: "yellow"},
            {text: "Insert new line and select it"}
        ], 44, 38 + 96, 18, 18);
        this.removeLine = new Button("-", [
            {text: "Delete Line", color: "yellow"},
            {text: "Delete line and select previous"}
        ], 62, 38 + 96, 18, 18);

        this.copyAsYAML = new Button("YAML", [
            {text: "Copy as YAML", color: "yellow"},
            {text: "Copy tooltip as YAML array"}
        ], 88, 38 + 96, 40, 18);

        this.children.push(
            this.chatText,
            this.previousLine, this.nextLine, this.insertLine, this.removeLine,
            this.copyAsYAML
        );

        const self = this;

        this.previousLine.onMouseDown.add(event => {
            if (this.tooltipPointer == 0) return;
            this.tooltipPointer--;
            self.chatText.chatText = self.tooltip[self.tooltipPointer];
        });
        this.nextLine.onMouseDown.add(event => {
            if (this.tooltipPointer >= this.tooltip.length - 1) return;
            this.tooltipPointer++;
            self.chatText.chatText = self.tooltip[self.tooltipPointer];
        });
        this.insertLine.onMouseDown.add(event => {
            this.tooltip.splice(this.tooltipPointer + 1, 0, [{text: ""}]);
            this.tooltipPointer++;
            self.chatText.chatText = self.tooltip[self.tooltipPointer];
        });
        this.removeLine.onMouseDown.add(event => {
            if (this.tooltipPointer == 0) {
                if (this.tooltip.length == 1) return;
                this.tooltip.splice(0, 1);
            } else {
                this.tooltip.splice(this.tooltipPointer, 1);
                this.tooltipPointer--;
            }
            self.chatText.chatText = self.tooltip[self.tooltipPointer];
        });

        this.copyAsYAML.onMouseDown.add(event => {
            let yaml = this.tooltip.map(v => "- '" + convertToLegacy(v).replaceAll("'", "\\'") + "'\n").join();
            navigator.clipboard.writeText(yaml).then(() => {
                alert("YAML array code copied! (Using legacy format)");
            });
        });
    }

    get width() { return super.width; }
    set width(v: number) {
        super.width = v;
        this.chatText.width = v;
    }

    renderComponent(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, renderer: Renderer, ui: UserInterface) {
        ctx.fillStyle = "#efefef";
        renderer.fillFrame(ctx, 0, 0, this.width, this.height);

        ctx.fillStyle = "#000000";
        renderer.drawText(ctx, "Text Editor:", renderer.uiScale * 8, renderer.uiScale * 13);
        renderer.drawText(ctx, `Tooltip: (Line ${this.tooltipPointer + 1}/${this.tooltip.length})`, renderer.uiScale * 8, renderer.uiScale * (32 + 96));
        renderer.drawItemTooltip(ctx, renderer.uiScale * 8, renderer.uiScale * (38 + 96 + 24), this.tooltip);
    }
}