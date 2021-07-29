import { ChatText, Renderer } from "@mangoplex/mc-ui-renderer";
import { Component } from "./components/Component";
import { FocusComponent } from "./components/FocusComponent";
import { ComponentMouse, ComponentMouseEventType } from "./events/ComponentMouse";

export class UserInterface {
    renderer: Renderer;
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    get uiScale() { return this.renderer.uiScale; }
    components: Component[] = [];
    tooltip: ChatText[] = null;
    focus: FocusComponent = null;

    private _mousePos: [number, number] = [0, 0];

    constructor(
        public canvas: HTMLCanvasElement | OffscreenCanvas
    ) {
        this.ctx = canvas.getContext("2d");
        this.renderer = new Renderer();

        if (canvas instanceof HTMLCanvasElement) {
            canvas.addEventListener("mousemove", event => {
                this.triggerMouseEvent(event);
                this._mousePos[0] = event.offsetX;
                this._mousePos[1] = event.offsetY;
            });
            canvas.addEventListener("mousedown", event => {
                this.triggerMouseEvent(event);
            });
            canvas.addEventListener("mouseup", event => {
                this.triggerMouseEvent(event);
            });

            document.addEventListener("keydown", event => {
                if (this.focus) event.preventDefault();
                this.focus?.onKeyDown.emit(event);
                this.scheduleRender();
            });
            document.addEventListener("keyup", event => {
                if (this.focus) event.preventDefault();
                this.focus?.onKeyUp.emit(event);
                this.scheduleRender();
            });
        }
    }

    private _hovering: Component;

    triggerMouseEvent(event: MouseEvent) {
        const mouseX = event.offsetX / this.uiScale;
        const mouseY = event.offsetY / this.uiScale;
        const component = this.componentAt(mouseX, mouseY);
        if (component) {
            const event2: ComponentMouse = {
                componentX: mouseX - component.x,
                componentY: mouseY - component.y,
                parent: event,
                type: <ComponentMouseEventType> event.type.substr(5),
                button: event.button,
                ui: this
            };
            if (event.type == "mousemove") component.onMouseMove.emit(event2);
            if (event.type == "mousedown") component.onMouseDown.emit(event2);
            if (event.type == "mouseup") component.onMouseUp.emit(event2);

            if (event.type == "mousemove") {
                if (this._hovering != component) {
                    if (this._hovering) {
                        const event2: ComponentMouse = {
                            componentX: mouseX - this._hovering.x,
                            componentY: mouseY - this._hovering.y,
                            parent: event, type: "out",
                            button: event.button, ui: this
                        };
                        this._hovering.onMouseOut.emit(event2);
                    }

                    this._hovering = component;
                    const event2: ComponentMouse = {
                        componentX: mouseX - component.x,
                        componentY: mouseY - component.y,
                        parent: event, type: "over",
                        button: event.button, ui: this
                    };
                    component.onMouseOver.emit(event2);
                }
            }
            if (event.type == "mousedown" && component instanceof FocusComponent) {
                this.focus = component;
            }
        } else {
            if (event.type == "mousedown" && this.focus) {
                this.focus = null;
            }
            if (this._hovering) {
                const event2: ComponentMouse = {
                    componentX: mouseX - this._hovering.x,
                    componentY: mouseY - this._hovering.y,
                    parent: event, type: "out",
                    button: event.button, ui: this
                };
                this._hovering.onMouseOut.emit(event2);
                this._hovering = null;
            }
        }
        this.scheduleRender();
    }

    componentAt(x: number, y: number) {
        for (let i = 0; i < this.components.length; i++) {
            const comp = this.components[i];
            if (x >= comp.x && y >= comp.y && x <= comp.x + comp.width && y <= comp.y + comp.height) return comp;
        }
        return null;
    }

    async prepareRenderer() {
        await this.renderer.loadAssets();
        console.log("Assets loaded!");
    }

    renderComponent(component: Component) {
        const x = Math.floor(component.x * this.uiScale);
        const y = Math.floor(component.y * this.uiScale);
        this.ctx.translate(x, y);
        component.renderComponent(this.ctx, this.renderer, this);
        component.children.forEach(child => {
            this.renderComponent(child);
        });
        this.ctx.translate(-x, -y);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.components.forEach(comp => { this.renderComponent(comp); });
        if (this.tooltip) {
            this.ctx.fillStyle = "white";
            this.renderer.drawItemTooltip(this.ctx, ...this._mousePos, this.tooltip);
        }
    }

    renderScheduled = false;
    scheduleRender() {
        if (!this.renderScheduled) {
            this.renderScheduled = true;
            window.requestAnimationFrame(() => {
                this.renderScheduled = false;
                this.render();
            });
        }
    }
}