import { UserInterface } from "../UserInterface";

export type ComponentMouseEventType = "move" | "down" | "up" | "over" | "out";

export interface ComponentMouse {
    type: ComponentMouseEventType;
    parent: MouseEvent;
    ui: UserInterface;

    /** Mouse position X on component, scaled */
    componentX: number;
    /** Mouse position Y on component, scaled */
    componentY: number;

    button?: number;
}