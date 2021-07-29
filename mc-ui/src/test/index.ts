import { Button } from "../components/Button";
import { ChatTextEditor } from "../components/editors/ChatTextEditor";
import { TooltipEditor } from "../components/editors/TooltipEditor";
import { Inventory } from "../components/Inventory";
import { TextBox } from "../components/TextBox";
import { UserInterface } from "../UserInterface";

let canvas = document.querySelector("canvas");
let ui = new UserInterface(canvas);

ui.prepareRenderer().then(() => {
    let tooltip = new TooltipEditor();
    tooltip.x = 0; tooltip.y = 0;
    tooltip.width = 246; tooltip.height = 500;
    ui.components.push(tooltip);
    ui.render();
});