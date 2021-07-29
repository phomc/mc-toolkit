import { Renderer } from "@mangoplex/mc-ui-renderer";
import { ComponentMouse } from "../events/ComponentMouse";
import { Emitter } from "../events/Emitter";
import { UserInterface } from "../UserInterface";
import { FocusComponent } from "./FocusComponent";

export abstract class Component {
    private _x = 0;
    private _y = 0;
    private _width = 12;
    private _height = 12;

    /** The scaled X position of the component */
    get x() { return this._x; }
    /** The scaled Y position of the component */
    get y() { return this._y; }
    /** The scaled width of the component */
    get width() { return this._width; }
    /** The scaled height of the component */
    get height() { return this._height; }

    /** The scaled X position of the component */
    set x(v: number) { this._x = v; }
    /** The scaled Y position of the component */
    set y(v: number) { this._y = v; }
    /** The scaled width of the component */
    set width(v: number) { this._width = v; }
    /** The scaled height of the component */
    set height(v: number) { this._height = v; }

    /** Visiblity of the component */
    visible = true;
    /** Children in this component */
    children: Component[] = [];

    // Events
    onMouseMove: Emitter<ComponentMouse> = new Emitter();
    onMouseDown: Emitter<ComponentMouse> = new Emitter();
    onMouseUp: Emitter<ComponentMouse> = new Emitter();
    onMouseOver: Emitter<ComponentMouse> = new Emitter();
    onMouseOut: Emitter<ComponentMouse> = new Emitter();

    constructor() {
        // Bubbling
        let hovering: Component = null;
        const self = this;
        function bubble(event: ComponentMouse) {
            const child = self.childrenAt(event.componentX, event.componentY);
            if (child) {
                const event2: ComponentMouse = {
                    componentX: event.componentX - child._x,
                    componentY: event.componentY - child._y,
                    parent: event.parent, type: event.type,
                    ui: event.ui, button: event.button
                };
                
                if (event.type == "move") child.onMouseMove.emit(event2);
                if (event.type == "down") child.onMouseDown.emit(event2);
                if (event.type == "up") child.onMouseUp.emit(event2);

                if (event.type == "move") {
                    if (hovering != child) {
                        if (hovering) {
                            const event2: ComponentMouse = {
                                componentX: event.componentX - hovering._x,
                                componentY: event.componentY - hovering._y,
                                parent: event.parent, type: "out",
                                ui: event.ui, button: event.button
                            };
                            hovering.onMouseOut.emit(event2);
                        }

                        hovering = child;
                        const event2: ComponentMouse = {
                            componentX: event.componentX - child._x,
                            componentY: event.componentY - child._y,
                            parent: event.parent, type: "over",
                            ui: event.ui, button: event.button
                        };
                        child.onMouseOver.emit(event2);
                    }
                }
                if (event.type == "down" && "onKeyDown" in child) {
                    event.ui.focus = <FocusComponent> child;
                }
            } else {
                if (event.type == "down" && event.ui.focus) {
                    event.ui.focus = null;
                }
                if (hovering) {
                    const event2: ComponentMouse = {
                        componentX: event.componentX - hovering._x,
                        componentY: event.componentY - hovering._y,
                        parent: event.parent, type: "out",
                        ui: event.ui, button: event.button
                    };  
                    hovering.onMouseOut.emit(event2);
                    hovering = null;
                }
            }
        }
        this.onMouseMove.add(event => { bubble(event); });
        this.onMouseDown.add(event => { bubble(event); });
        this.onMouseUp.add(event => { bubble(event); });
    }

    /**
     * Render the component. The context already translated to current position and ready to be drawn at
     * 0:0
     * @param ctx The context
     */
    abstract renderComponent(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        renderer: Renderer,
        ui: UserInterface
    ): any;

    /**
     * Get the children component at location
     * @param x The local location, scaled
     * @param y The local location, scaled
     */
    childrenAt(x: number, y: number) {
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (x >= child._x && y >= child._y && x <= child._x + child.width && y <= child._y + child.height) return child;
        }
        return null;
    }
}