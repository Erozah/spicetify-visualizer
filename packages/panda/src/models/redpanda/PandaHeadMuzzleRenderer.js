import { PandaAnatomyCoordinates } from './PandaAnatomyCoordinates.js';

// src/models/redpanda/PandaHeadMuzzleRenderer.js - Skull base, white markings, snout & rhythmic bamboo chewing
// SOLID Architecture: Dedicated renderer for the Red Panda's facial markings, muzzle, mouth, and rhythmic bamboo chewing

export class PandaHeadMuzzleRenderer {
    render(ctx, palette, audio, time, eyesRenderer, earTwitchReflexes) {
        ctx.save();
        const headY = -80;
        ctx.translate(0, headY);

        const highs = audio && typeof audio === "object" && audio.highs ? audio.highs : 0.2;

        // 1. Large Fluffy Ears with Independent Twitches
        earTwitchReflexes.render(ctx, palette);

        // 2. Head Base & Wide Fluffy Cheek Tufts
        ctx.save();
        PandaAnatomyCoordinates.buildHeadPath(ctx);
        ctx.fillStyle = "rgba(12, 6, 16, 0.98)";
        ctx.fill();

        // Warm reddish-copper head gradient
        const headGradient = ctx.createRadialGradient(0, -5, 10, 0, 0, 75);
        headGradient.addColorStop(0, palette.accentAlpha ? palette.accentAlpha(0.95) : "rgba(255, 95, 45, 0.95)");
        headGradient.addColorStop(0.6, palette.secondaryAlpha ? palette.secondaryAlpha(0.85) : "rgba(200, 50, 70, 0.85)");
        headGradient.addColorStop(1.0, "rgba(35, 12, 28, 0.95)");
        ctx.fillStyle = headGradient;
        PandaAnatomyCoordinates.buildHeadPath(ctx);
        ctx.fill();

        // Laser contour for head
        ctx.globalCompositeOperation = "screen";
        ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(0.9) : "#00f0ff";
        ctx.lineWidth = 1.8;
        PandaAnatomyCoordinates.buildHeadPath(ctx);
        ctx.stroke();
        ctx.restore();

        // 3. Characteristic White Face Markings
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // White cheek ruffs
        const cheekGrad = ctx.createLinearGradient(-65, 0, 65, 0);
        cheekGrad.addColorStop(0, palette.coreAlpha ? palette.coreAlpha(0.85) : "rgba(255, 255, 255, 0.85)");
        cheekGrad.addColorStop(0.25, "transparent");
        cheekGrad.addColorStop(0.75, "transparent");
        cheekGrad.addColorStop(1.0, palette.coreAlpha ? palette.coreAlpha(0.85) : "rgba(255, 255, 255, 0.85)");
        ctx.fillStyle = cheekGrad;
        PandaAnatomyCoordinates.buildHeadPath(ctx);
        ctx.fill();

        // White Eyebrow Spots
        ctx.fillStyle = palette.coreAlpha ? palette.coreAlpha(0.92) : "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-22, -24, 7, 5, -0.2, 0, Math.PI * 2);
        ctx.ellipse(22, -24, 7, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // White Curved "Tear Tracks"
        ctx.strokeStyle = palette.coreAlpha ? palette.coreAlpha(0.88) : "#ffffff";
        ctx.lineWidth = 3.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-16, -6);
        ctx.quadraticCurveTo(-28, 8, -32, 24);
        ctx.moveTo(16, -6);
        ctx.quadraticCurveTo(28, 8, 32, 24);
        ctx.stroke();

        // White Muzzle / Snout Mound
        const muzzleGrad = ctx.createRadialGradient(0, 16, 2, 0, 16, 28);
        muzzleGrad.addColorStop(0, palette.coreAlpha ? palette.coreAlpha(0.95) : "#ffffff");
        muzzleGrad.addColorStop(0.65, palette.coreAlpha ? palette.coreAlpha(0.80) : "rgba(255, 255, 255, 0.8)");
        muzzleGrad.addColorStop(1.0, "transparent");
        ctx.fillStyle = muzzleGrad;
        ctx.beginPath();
        ctx.ellipse(0, 16, 24, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Dark Button Nose
        ctx.save();
        ctx.fillStyle = "#0c0812";
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.lineTo(6, 9);
        ctx.quadraticCurveTo(0, 7, -6, 9);
        ctx.closePath();
        ctx.fill();

        // Nose catchlight
        ctx.fillStyle = palette.coreAlpha ? palette.coreAlpha(0.8) : "#ffffff";
        ctx.beginPath();
        ctx.arc(-1.5, 9, 1.0, 0, Math.PI * 2);
        ctx.fill();

        // Rhythmic bamboo sprig chewing calculation
        const bpm = audio && typeof audio === "object" && audio.bpm ? audio.bpm : 120;
        const isPlaying = audio && typeof audio === "object" && audio.isPlaying;
        const chewingPhase = isPlaying ? (time * (bpm / 60) * Math.PI * 2) : 0;
        const chewingDisplacementY = isPlaying ? (Math.sin(chewingPhase) * 1.5) : 0;
        const bambooSwayAngle = isPlaying ? (Math.sin(chewingPhase) * 0.14) : 0;

        // Tender bamboo sprig in the corner of the mouth
        ctx.save();
        ctx.translate(6, 20 + chewingDisplacementY);
        ctx.rotate(0.35 + bambooSwayAngle);

        ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(0.95) : "#10b981";
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(18, 12, 38, 22);
        ctx.stroke();

        // Node ring on sprig
        ctx.strokeStyle = palette.coreAlpha ? palette.coreAlpha(0.85) : "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(18, 10);
        ctx.lineTo(20, 14);
        ctx.stroke();

        // Leaves at sprig tip
        ctx.fillStyle = palette.primaryAlpha ? palette.primaryAlpha(0.9) : "#34d399";
        ctx.beginPath();
        ctx.moveTo(38, 22);
        ctx.quadraticCurveTo(48, 18, 54, 20);
        ctx.quadraticCurveTo(46, 26, 38, 22);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(38, 22);
        ctx.quadraticCurveTo(44, 28, 48, 34);
        ctx.quadraticCurveTo(40, 30, 38, 22);
        ctx.fill();
        ctx.restore();

        // Gentle mouth line with rhythmic jaw displacement
        ctx.strokeStyle = "#0c0812";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.lineTo(0, 20 + chewingDisplacementY * 0.4);
        ctx.moveTo(0, 20 + chewingDisplacementY * 0.4);
        ctx.quadraticCurveTo(-6, 25 + chewingDisplacementY, -12, 21);
        ctx.moveTo(0, 20 + chewingDisplacementY * 0.4);
        ctx.quadraticCurveTo(6, 25 + chewingDisplacementY, 12, 21);
        ctx.stroke();
        ctx.restore();

        // 5. Soulful Glowing Eyes & Blinking
        eyesRenderer.render(ctx, palette, audio);

        // 6. Delicate Laser Whiskers
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(0.75) : "rgba(0, 240, 255, 0.7)";
        ctx.lineWidth = 1.0;

        const whiskerTwitch = Math.sin(time * 20) * highs * 3;
        ctx.beginPath();
        ctx.moveTo(-14, 16); ctx.quadraticCurveTo(-45, 12 + whiskerTwitch, -72, 14);
        ctx.moveTo(-14, 19); ctx.quadraticCurveTo(-45, 20 + whiskerTwitch, -70, 26);
        ctx.moveTo(-14, 22); ctx.quadraticCurveTo(-42, 27 + whiskerTwitch, -65, 38);
        ctx.moveTo(14, 16); ctx.quadraticCurveTo(45, 12 - whiskerTwitch, 72, 14);
        ctx.moveTo(14, 19); ctx.quadraticCurveTo(45, 20 - whiskerTwitch, 70, 26);
        ctx.moveTo(14, 22); ctx.quadraticCurveTo(42, 27 - whiskerTwitch, 65, 38);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }
}
