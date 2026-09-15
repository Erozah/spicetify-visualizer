export class CosmicParticleSingularityLayer {
    constructor() {
        this.dotCount = 280;
        this.offscreenCanvas = null;
        this.gl = null;
        this.program = null;
        this.positionBuffer = null;
        this.isSupported = false;
        this.initializeWebGL2Pipeline();
    }

    initializeWebGL2Pipeline() {
        if (typeof document === "undefined") return;

        try {
            this.offscreenCanvas = document.createElement("canvas");
            this.offscreenCanvas.width = 600;
            this.offscreenCanvas.height = 600;
            this.gl = this.offscreenCanvas.getContext("webgl2", { alpha: true, antialias: true });

            if (!this.gl) {
                this.gl = this.offscreenCanvas.getContext("webgl", { alpha: true });
            }

            if (!this.gl) return;

            const vertexShaderSource = `
                attribute float aIndex;
                uniform float uTotalDots;
                uniform float uTime;
                uniform float uBass;
                uniform float uEnergy;
                uniform float uBeatImpulse;
                varying float vAlpha;

                void main() {
                    float normalizedIndex = aIndex / uTotalDots;
                    float angle = normalizedIndex * 6.28318530718 * 4.0 + uTime * 0.45;
                    float radiusBase = 0.28 + normalizedIndex * 0.48;
                    float pulsation = (uBass * 0.18 + uBeatImpulse * 0.22) * sin(angle * 3.0 + uTime * 2.0);
                    float radius = radiusBase + pulsation;

                    float x = cos(angle) * radius;
                    float y = sin(angle) * radius;

                    gl_Position = vec4(x, y, 0.0, 1.0);
                    gl_PointSize = (3.5 + uEnergy * 6.5) * (1.0 - normalizedIndex * 0.4);
                    vAlpha = 0.25 + 0.75 * sin(normalizedIndex * 3.14159);
                }
            `;

            const fragmentShaderSource = `
                precision mediump float;
                uniform vec3 uColor;
                varying float vAlpha;

                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) {
                        discard;
                    }
                    float glow = pow(1.0 - dist * 2.0, 1.8);
                    gl_FragColor = vec4(uColor, glow * vAlpha * 0.85);
                }
            `;

            const createShader = (type, source) => {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                return shader;
            };

            const vertexShader = createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

            this.program = this.gl.createProgram();
            this.gl.attachShader(this.program, vertexShader);
            this.gl.attachShader(this.program, fragmentShader);
            this.gl.linkProgram(this.program);

            const indices = new Float32Array(this.dotCount);
            for (let i = 0; i < this.dotCount; i++) {
                indices[i] = i;
            }

            this.positionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

            this.aIndexLocation = this.gl.getAttribLocation(this.program, "aIndex");
            this.uTotalDotsLocation = this.gl.getUniformLocation(this.program, "uTotalDots");
            this.uTimeLocation = this.gl.getUniformLocation(this.program, "uTime");
            this.uBassLocation = this.gl.getUniformLocation(this.program, "uBass");
            this.uEnergyLocation = this.gl.getUniformLocation(this.program, "uEnergy");
            this.uBeatImpulseLocation = this.gl.getUniformLocation(this.program, "uBeatImpulse");
            this.uColorLocation = this.gl.getUniformLocation(this.program, "uColor");

            this.isSupported = true;
        } catch (webglError) {
            console.warn("[CosmicParticleSingularityLayer] WebGL shader init failed:", webglError);
            this.isSupported = false;
        }
    }

    hexToRgbNormalized(hexColor) {
        if (!hexColor || typeof hexColor !== "string") return [0.0, 0.94, 1.0];
        let cleaned = hexColor.replace("#", "");
        if (cleaned.length === 3) {
            cleaned = cleaned.split("").map((c) => c + c).join("");
        }
        const intVal = parseInt(cleaned, 16);
        return [
            ((intVal >> 16) & 255) / 255,
            ((intVal >> 8) & 255) / 255,
            (intVal & 255) / 255
        ];
    }

    render(canvasRenderingContext, viewportWidth, viewportHeight, centerX, centerY, audioState, paletteTheme) {
        if (!this.isSupported || !this.gl || !this.program) return;

        const gl = this.gl;
        gl.viewport(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.aIndexLocation);
        gl.vertexAttribPointer(this.aIndexLocation, 1, gl.FLOAT, false, 0, 0);

        gl.uniform1f(this.uTotalDotsLocation, this.dotCount);
        gl.uniform1f(this.uTimeLocation, audioState ? audioState.liveTime : 0);
        gl.uniform1f(this.uBassLocation, audioState ? audioState.bass : 0.2);
        gl.uniform1f(this.uEnergyLocation, audioState ? audioState.energy : 0.3);
        gl.uniform1f(this.uBeatImpulseLocation, audioState ? audioState.beatImpulse : 0.0);

        const rgb = this.hexToRgbNormalized(paletteTheme.primary);
        gl.uniform3f(this.uColorLocation, rgb[0], rgb[1], rgb[2]);

        gl.drawArrays(gl.POINTS, 0, this.dotCount);

        const haloDiameter = Math.min(viewportWidth, viewportHeight) * 0.78;
        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "screen";
        canvasRenderingContext.drawImage(
            this.offscreenCanvas,
            centerX - haloDiameter * 0.5,
            centerY - haloDiameter * 0.5,
            haloDiameter,
            haloDiameter
        );
        canvasRenderingContext.restore();
    }
}
