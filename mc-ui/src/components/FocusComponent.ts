import { Emitter } from "../events/Emitter";
import { Component } from "./Component";

export abstract class FocusComponent extends Component {
    onKeyDown: Emitter<KeyboardEvent> = new Emitter();
    onKeyUp: Emitter<KeyboardEvent> = new Emitter();
}