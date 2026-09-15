export class GlobalKeybindings {
    static register(engine) {
        window.addEventListener("keydown", (event) => {
            if (event.defaultPrevented) return;
            const target = event.target;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

            if ((event.key === "p" || event.key === "P") && !event.shiftKey) {
                event.preventDefault();
                engine.toggleActive();
                return;
            }
            if ((event.key === "P" || event.key === "p") && event.shiftKey) {
                event.preventDefault();
                if (engine.togglePictureInPicture) {
                    engine.togglePictureInPicture();
                }
                return;
            }
            if (event.key === "t" || event.key === "T") {
                event.preventDefault();
                engine.nextPalette();
                return;
            }
            if (event.key === "f" || event.key === "F" || event.key === "F11") {
                event.preventDefault();
                engine.toggleFullscreen();
                return;
            }
            if (event.key === "Escape" && engine.isFullscreen) {
                event.preventDefault();
                engine.toggleFullscreen(false);
            }
        });
    }
}
