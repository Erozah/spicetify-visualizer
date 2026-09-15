export class GlobalKeybindings {
    static register(visualizerEngine) {
        window.addEventListener("keydown", (keyboardEvent) => {
            if (keyboardEvent.defaultPrevented) return;
            const targetTagName = keyboardEvent.target.tagName ? keyboardEvent.target.tagName.toLowerCase() : "";
            if (targetTagName === "input" || targetTagName === "textarea" || targetTagName === "select" || keyboardEvent.target.isContentEditable) return;

            const pressedKey = keyboardEvent.key;
            if ((pressedKey === "c" || pressedKey === "C") && !keyboardEvent.shiftKey) {
                keyboardEvent.preventDefault();
                visualizerEngine.toggleActive();
                return;
            }
            if (pressedKey === "p" || pressedKey === "P") {
                if (visualizerEngine.isForeground && typeof visualizerEngine.togglePiP === "function") {
                    keyboardEvent.preventDefault();
                    visualizerEngine.togglePiP();
                }
                return;
            }
            if (pressedKey === "m" || pressedKey === "M") {
                if (visualizerEngine.isForeground) {
                    keyboardEvent.preventDefault();
                    visualizerEngine.nextModel();
                }
                return;
            }
            if (pressedKey === "t" || pressedKey === "T") {
                if (visualizerEngine.isForeground) {
                    keyboardEvent.preventDefault();
                    visualizerEngine.nextPalette();
                }
                return;
            }
            if (pressedKey === "f" || pressedKey === "F" || pressedKey === "F11") {
                if (visualizerEngine.isForeground || visualizerEngine.isFullscreen) {
                    keyboardEvent.preventDefault();
                    visualizerEngine.toggleFullscreen();
                }
                return;
            }
            if (pressedKey === "Escape" && visualizerEngine.isFullscreen) {
                keyboardEvent.preventDefault();
                visualizerEngine.toggleFullscreen(false);
            }
        });
    }
}
export const setupVisualizerKeybindings = (engine) => GlobalKeybindings.register(engine);
