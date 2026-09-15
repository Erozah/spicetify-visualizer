// src/models/redpanda/tail/TailKinematicsPhysics.js - Spring-damper segment kinematics & tail physics
// SOLID Architecture: Dedicated physics solver for the 18-segment ringed tail

export class TailKinematicsPhysics {
    constructor(segmentCount = 18) {
        this.segmentCount = segmentCount;
        this.points = [];
        this.velocities = [];
        for (let i = 0; i < this.segmentCount; i++) {
            this.points.push({ x: 0, y: 0 });
            this.velocities.push({ vx: 0, vy: 0 });
        }
        this.initialized = false;
    }

    initializeRestingShape(rootX, rootY, scale) {
        for (let i = 0; i < this.segmentCount; i++) {
            const fraction = i / (this.segmentCount - 1);
            const angle = 0.3 + fraction * 2.2;
            const radius = fraction * (130 * scale);
            this.points[i].x = rootX + Math.cos(angle) * radius;
            this.points[i].y = rootY + Math.sin(angle) * (radius * 0.7);
            this.velocities[i].vx = 0;
            this.velocities[i].vy = 0;
        }
        this.initialized = true;
    }

    update(rootAnchor, scale, audio, deltaTime, time, deckY, isPlaying = true) {
        if (!rootAnchor) return;

        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.35;
        const bass = audio && typeof audio === "object" && audio.bass ? audio.bass : 0.2;
        const beat = audio && typeof audio === "object" && audio.beatImpulse ? audio.beatImpulse : 0;
        const isDrop = audio && typeof audio === "object" && audio.isDrop;
        const bpm = audio && typeof audio === "object" && audio.bpm ? audio.bpm : 120;
        const tempoNormalized = Math.max(0.4, Math.min(2.0, bpm / 120));

        const rootX = rootAnchor.x;
        const rootY = rootAnchor.y;

        if (!this.initialized) {
            this.initializeRestingShape(rootX, rootY, scale);
        }

        this.points[0].x = rootX;
        this.points[0].y = rootY;

        const segmentDistance = (12.5 * scale);
        const swayFrequency = isPlaying ? (0.65 + tempoNormalized * 0.45 * (0.35 + energy * 0.65)) : 0.4;
        const swayAmplitude = isPlaying ? ((0.12 + energy * 0.22 + (isDrop ? 0.25 : 0)) * scale) : (0.08 * scale);
        const beatCurl = (beat * 0.18 + bass * 0.12) * (isDrop ? 1.4 : 1.0);

        for (let i = 1; i < this.segmentCount; i++) {
            const prevPoint = this.points[i - 1];
            const currPoint = this.points[i];
            const velocity = this.velocities[i];

            let dx = currPoint.x - prevPoint.x;
            let dy = currPoint.y - prevPoint.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 0.001;

            const fraction = i / this.segmentCount;
            const waveOffset = Math.sin(time * swayFrequency + fraction * 2.5) * swayAmplitude * (i * 2.8);
            const upwardCurl = -Math.pow(fraction, 1.8) * (28 * scale) * (1.0 + beatCurl);

            const targetX = prevPoint.x + (dx / dist) * segmentDistance + waveOffset;
            const targetY = prevPoint.y + (dy / dist) * segmentDistance + upwardCurl;

            const spring = 18.0;
            const damping = 0.82;

            velocity.vx = (velocity.vx + (targetX - currPoint.x) * spring * deltaTime) * damping;
            velocity.vy = (velocity.vy + (targetY - currPoint.y) * spring * deltaTime) * damping;

            currPoint.x += velocity.vx * deltaTime * 60;
            currPoint.y += velocity.vy * deltaTime * 60;

            dx = currPoint.x - prevPoint.x;
            dy = currPoint.y - prevPoint.y;
            dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            currPoint.x = prevPoint.x + (dx / dist) * segmentDistance;
            currPoint.y = prevPoint.y + (dy / dist) * segmentDistance;

            if (deckY && currPoint.y > deckY - 4) {
                currPoint.y = deckY - 4;
                velocity.vy *= -0.3;
            }
        }
    }
}
