import { ChatColor, ChatObject, ChatText, Renderer, styleFromColor } from "@mangoplex/mc-ui-renderer";
import { Emitter } from "../../events/Emitter";
import { UserInterface } from "../../UserInterface";
import { Button } from "../Button";
import { Component } from "../Component";
import { TextBox } from "../TextBox";

export class ChatTextEditor extends Component {
    prevButton: Button;
    nextButton: Button;
    insertButton: Button;
    deleteButton: Button;

    bold: Button;
    italic: Button;
    underline: Button;
    strikethrough: Button;
    obfuscate: Button;
    color: TextBox;
    
    text: TextBox;
    private _chatText: ChatObject[] = [{text: ""}];
    chatTextPointer = 0;

    onChange = new Emitter<ChatObject[]>();

    get chatText() { return this._chatText; }
    set chatText(text: ChatObject[]) {
        this._chatText = text;
        this.chatTextPointer = 0;
        this.color.contents = this._chatText[this.chatTextPointer].color ?? ""; this.color.caretToEnd();
        this.text.contents = this._chatText[this.chatTextPointer].text; this.text.caretToEnd();
    }

    constructor() {
        super();

        this.prevButton = new Button("<", [
            {text: "Previous Component", color: "yellow"},
            {text: "Select the previous component"}
        ], 8, 8, 18, 18);
        this.nextButton = new Button(">", [
            {text: "Next Component", color: "yellow"},
            {text: "Select the next component"}
        ], 26, 8, 18, 18);
        this.insertButton = new Button("+", [
            {text: "Insert Component", color: "yellow"},
            {text: "Insert new component and select it"}
        ], 44, 8, 18, 18);
        this.deleteButton = new Button("-", [
            {text: "Delete Component", color: "yellow"},
            {text: "Delete component and select previous"}
        ], 62, 8, 18, 18);

        this.bold =          new Button({text: "B", bold: true}, ["Bold"],                  70 + 18 * 1, 8, 18, 18);
        this.italic =        new Button({text: "I", italic: true}, ["Italic"],              70 + 18 * 2, 8, 18, 18);
        this.underline =     new Button({text: "U", underlined: true}, ["Underline"],       70 + 18 * 3, 8, 18, 18);
        this.strikethrough = new Button({text: "S", strikethrough: true}, ["Strikethough"], 70 + 18 * 4, 8, 18, 18);
        this.obfuscate =     new Button({text: "O", obfuscated: true}, ["Obfuscate"],       70 + 18 * 5, 8, 18, 18);

        this.color = new TextBox("", "Color");
        this.color.x = 70 + 18 * 6; this.color.y = 8;
        this.color.width = 60; this.color.height = 18;

        this.text = new TextBox("", "Text...");
        this.text.x = 8; this.text.y = 26;
        this.text.width = this.width - 16; this.text.height = 18;

        this.children.push(
            this.prevButton, this.nextButton, this.insertButton, this.deleteButton,
            this.bold, this.italic, this.underline, this.strikethrough, this.obfuscate, this.color,
            this.text
        );

        this.text.onKeyDown.add(event => {
            this._chatText[this.chatTextPointer].text = this.text.contents;
            this.onChange.emit(this._chatText);
        });
        this.color.onKeyDown.add(event => {
            const color = <ChatColor> this.color.contents;
            const style = styleFromColor(color);
            if (style == null) this._chatText[this.chatTextPointer].color = undefined;
            else this._chatText[this.chatTextPointer].color = color;
            this.onChange.emit(this._chatText);
        });

        const self = this;
        function componentToTextBoxes() {
            self.color.contents = self._chatText[self.chatTextPointer].color ?? ""; self.color.caretToEnd();
            self.text.contents = self._chatText[self.chatTextPointer].text; self.text.caretToEnd();
            self.onChange.emit(self.chatText);
        }

        this.prevButton.onMouseDown.add(event => {
            if (this.chatTextPointer == 0) return;
            this.chatTextPointer--;
            componentToTextBoxes();
        });
        this.nextButton.onMouseDown.add(event => {
            if (this.chatTextPointer >= this._chatText.length - 1) return;
            this.chatTextPointer++;
            componentToTextBoxes();
        });
        this.insertButton.onMouseDown.add(event => {
            this._chatText.splice(this.chatTextPointer + 1, 0, {text: ""});
            this.chatTextPointer++;
            componentToTextBoxes();
        });
        this.deleteButton.onMouseDown.add(event => {
            if (this.chatTextPointer == 0) {
                if (this._chatText.length == 1) return;
                this._chatText.splice(0, 1);
                componentToTextBoxes();
            } else {
                this._chatText.splice(this.chatTextPointer, 1);
                this.chatTextPointer--;
                componentToTextBoxes();
            }
        });

        this.bold.onMouseDown.add(event => { this._chatText[this.chatTextPointer].bold = !this._chatText[this.chatTextPointer].bold; this.onChange.emit(this._chatText); });
        this.italic.onMouseDown.add(event => { this._chatText[this.chatTextPointer].italic = !this._chatText[this.chatTextPointer].italic; this.onChange.emit(this._chatText); });
        this.underline.onMouseDown.add(event => { this._chatText[this.chatTextPointer].underlined = !this._chatText[this.chatTextPointer].underlined; this.onChange.emit(this._chatText); });
        this.strikethrough.onMouseDown.add(event => { this._chatText[this.chatTextPointer].strikethrough = !this._chatText[this.chatTextPointer].strikethrough; this.onChange.emit(this._chatText); });
        this.obfuscate.onMouseDown.add(event => { this._chatText[this.chatTextPointer].obfuscated = !this._chatText[this.chatTextPointer].obfuscated; this.onChange.emit(this._chatText); });
    }

    get width() { return super.width; }
    set width(v: number) {
        super.width = v;
        this.text.width = v - 16;
    }

    renderComponent(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, renderer: Renderer, ui: UserInterface) {
        ctx.fillStyle = "#cecece";
        renderer.fillFrame(ctx, 0, 0, this.width, this.height);

        ctx.fillStyle = "#000000";
        renderer.fillFrame(ctx, 8 * renderer.uiScale, 50 * renderer.uiScale, this.width - 16, 18);

        ctx.fillStyle = "#ffffff";
        renderer.drawText(ctx, this._chatText, 16 * renderer.uiScale, (50 + 12) * renderer.uiScale);

        renderer.fillFrame(ctx, 8 * renderer.uiScale, 68 * renderer.uiScale, this.width - 16, 18);

        ctx.fillStyle = "#000000";
        renderer.drawText(ctx, this._chatText, 16 * renderer.uiScale, (68 + 12) * renderer.uiScale);
    }
}