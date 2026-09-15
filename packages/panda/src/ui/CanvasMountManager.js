export function mountGlobalCanvas() {
    let canvas = document.getElementById('panda-visualizer-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'panda-visualizer-canvas';
        canvas.className = 'panda-visualizer-canvas';
        document.body.prepend(canvas);
    }
    return canvas;
}
