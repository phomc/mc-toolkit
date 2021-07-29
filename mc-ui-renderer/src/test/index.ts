import { Renderer } from "../Renderer";

let canvas = document.querySelector("canvas");
let renderer = new Renderer();
async function main() {
    await renderer.loadAssets();
    console.log(renderer);

    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";

    console.log(renderer.fontRenderer);
    renderer.drawItemTooltip(ctx, 0, 0, [
        {text: "Sell Instantly", color: "gold"},
        [{text: "Instant Sell Price: ", color: "gray"}, {text: "123.0", color: "gold"}],
        [{text: "You have ", color: "gray"}, {text: "512", color: "yellow"}, {text: " units", color: "gray"}],
        [{text: "You will get ", color: "gray"}, {text: "62,346.2", color: "gold"}, {text: " (tax included)", color: "dark_gray"}],
        "",
        [{text: "Click ", color: "yellow"}, {text: "to sell all", color: "gray"}]
    ]);
}
main();