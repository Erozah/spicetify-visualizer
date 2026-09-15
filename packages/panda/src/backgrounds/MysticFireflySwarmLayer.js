export class MysticFireflySwarmLayer {
    constructor() {
        this.particleCount = 350;
        this.offscreenCanvas = null;
        this.gl = null;
        this.program = null;
        this.buffer = null;
        this.isSupported = false;
        this.time = 0;
        this.initializeWebGL2Pipeline();
    }

    initializeWebGL2Pipeline() {
        if (typeof document === "undefined") return;

        try {
            this.offscreenCanvas = document.createElement("canvas");
            this.offscreenCanvas.width = 960;
            this.offscreenCanvas.height = 540;
            this.gl = this.offscreenCanvas.getContext("webgl2", { alpha: true, antialias: true });

            if (!this.gl) {
                this.gl = this.offscreenCanvas.getContext("webgl", { alpha: true });
            }

            if (!this.gl) return;

            const vertexShaderSource = `
                attribute vec4 aParticleData;
                uniform float uTime;
                uniform float uBass;
                uniform float uEnergy;
                uniform float uBeatImpulse;
                uniform float uSnareImpulse;
                varying float vAlpha;
                varying float vFlicker;

                void main() {
                    float seedX = aParticleData.x;
                    float seedY = aParticleData.y;
                    float speed = aParticleData.z;
                    float phase = aParticleData.w;

                    float verticalProgress = fract(seedY - uTime * (0.04 + speed * 0.08));
                    float y = (verticalProgress * 2.0 - 1.0);

                    float horizontalDrift = sin(uTime * 0.8 + phase * 6.28) * 0.12
                                          + cos(uTime * 1.5 + phase * 3.14) * 0.05 * (1.0 + uBass * 0.5);
                    float x = (seedX * 2.0 - 1.0) + horizontalDrift;

                    float impulseScatter = (uBeatImpulse * 0.06 + uSnareImpulse * 0.08) * sin(phase * 12.56 + uTime * 4.0);
                    x += impulseScatter;
                    y += impulseScatter * 0.5;

                    gl_Position = vec4(x, y, 0.0, 1.0);

                    float flicker = 0.5 + 0.5 * sin(uTime * (3.0 + speed * 6.0) + phase * 6.28);
                    float baseSize = (4.0 + speed * 7.0 + uEnergy * 5.0);
                    gl_PointSize = baseSize * (0.8 + flicker * 0.5 + uBeatImpulse * 0.6);

                    vAlpha = (0.35 + flicker * 0.65) * sin(verticalProgress * 3.14159);
                    vFlicker = flicker;
                }
            `;

            const fragmentShaderSource = `
                precision mediump float;
                uniform vec3 uPrimaryColor;
                uniform vec3 uAccentColor;
                varying float vAlpha;
                varying float vFlicker;

                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) {
                        discard;
                    }
                    float coreGlow = pow(1.0 - dist * 2.0, 2.0);
                    vec3 fireflyColor = mix(uPrimaryColor, uAccentColor, vFlicker * 0.45);
                    gl_FragColor = vec4(fireflyColor, coreGlow * vAlpha * 0.9);
                }
            `;

            const compileShader = (type, source) => {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                return shader;
            };

            const vertexShader = compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

            this.program = this.gl.createProgram();
            this.gl.attachShader(this.program, vertexShader);
            this.gl.attachShader(this.program, fragmentShader);
            this.gl.linkProgram(this.program);

            const particleData = new Float32Array(this.particleCount * 4);
            for (let i = 0; i < this.particleCount; i++) {
                const baseIndex = i * 4;
                particleData[baseIndex + 0] = Math.random();
                particleData[baseIndex + 1] = Math.random();
                particleData[baseIndex + 2] = 0.2 + Math.random() * 0.8;
                particleData[baseIndex + 3] = Math.random();
            }

            this.buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, particleData, this.gl.STATIC_DRAW);

            this.aParticleDataLocation = this.gl.getAttribLocation(this.program, "aParticleData");
            this.uTimeLocation = this.gl.getUniformLocation(this.program, "uTime");
            this.uBassLocation = this.gl.getUniformLocation(this.program, "uBass");
            this.uEnergyLocation = this.gl.getUniformLocation(this.program, "uEnergy");
            this.uBeatImpulseLocation = this.gl.getUniformLocation(this.program, "uBeatImpulse");
            this.uSnareImpulseLocation = this.gl.getUniformLocation(this.program, "uSnareImpulse");
            this.uPrimaryColorLocation = this.gl.getUniformLocation(this.program, "uPrimaryColor");
            this.uAccentColorLocation = this.gl.getUniformLocation(this.program, "uAccentColor");

            this.isSupported = true;
        } catch (error) {
            console.warn("[MysticFireflySwarmLayer] WebGL2 initialization failed:", error);
            this.isSupported = false;
        }
    }

    resize(viewportWidth, viewportHeight) {
        if (!this.offscreenCanvas || !this.gl) return;
        const targetWidth = Math.min(1280, Math.max(480, Math.floor(viewportWidth * 0.75)));
        const targetHeight = Math.min(720, Math.max(360, Math.floor(viewportHeight * 0.75)));
        if (this.offscreenCanvas.width !== targetWidth || this.offscreenCanvas.height !== targetHeight) {
            this.offscreenCanvas.width = targetWidth;
            this.offscreenCanvas.height = targetHeight;
            this.gl.viewport(0, 0, targetWidth, targetHeight);
        }
    }

    update(deltaTimeSeconds) {
        this.time += deltaTimeSeconds;
    }

    parseHexOrRgbColor(colorString, fallbackR = 0.1, fallbackG = 0.9, fallbackB = 0.8) {
        if (!colorString || typeof colorString !== "string") {
            return [fallbackR, fallbackG, fallbackB];
        }

        if (colorString.startsWith("#")) {
            let hex = colorString.slice(1);
            if (hex.length === 3) {
                hex = hex.split("").map((c) => c + c).join("");
            }
            const integer = parseInt(hex, 16);
            if (isNaN(integer)) return [fallbackR, fallbackG, fallbackB];
            return [
                ((integer >> 16) & 255) / 255,
                ((integer >> 8) & 255) / 255,
                (integer & 255) / 255
            ];
        }

        const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            return [
                parseInt(match[1], 10) / 255,
                parseInt(match[2], 10) / 255,
                parseInt(match[3], 10) / 255
            ];
        }

        return [fallbackR, fallbackG, fallbackB];
    }

    render(ctx, viewportWidth, viewportHeight, audio, palette) {
        if (!this.isSupported || !this.gl || !this.offscreenCanvas) return;

        const gl = this.gl;
        gl.viewport(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.aParticleDataLocation);
        gl.vertexAttribPointer(this.aParticleDataLocation, 4, gl.FLOAT, false, 0, 0);

        gl.uniform1f(this.uTimeLocation, this.time);
        gl.uniform1f(this.uBassLocation, (audio && audio.bass) || 0.2);
        gl.uniform1f(this.uEnergyLocation, (audio && audio.energy) || 0.35);
        gl.uniform1f(this.uBeatImpulseLocation, (audio && audio.beatImpulse) || 0.0);
        gl.uniform1f(this.uSnareImpulseLocation, (audio && audio.snareImpulse) || 0.0);

        const primaryRgb = this.parseHexOrRgbColor(palette && palette.primary, 0.1, 0.95, 0.8);
        const accentRgb = this.parseHexOrRgbColor(palette && palette.accent, 1.0, 0.5, 0.2);

        gl.uniform3f(this.uPrimaryColorLocation, primaryRgb[0], primaryRgb[1], primaryRgb[2]);
        gl.uniform3f(this.uAccentColorLocation, accentRgb[0], accentRgb[1], accentRgb[2]);

        gl.drawArrays(gl.POINTS, 0, this.particleCount);

        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.drawImage(this.offscreenCanvas, 0, 0, viewportWidth, viewportHeight);
        ctx.restore();
    }
}
