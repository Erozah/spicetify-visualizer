// src/models/cosmic/CatBodyBezierCurve.js - Anatomical bezier spline path for cat viewed from behind

export function traceCatBodyBezierCurve(
    canvasRenderingContext,
    deformationParameters,
    anatomyCoordinatesInstance
) {
    const { centerX: cx, centerY: cy, scaleX, scaleY, spineSway, earPerk, bass } = deformationParameters;
    canvasRenderingContext.beginPath();

    const baseBottomX = cx, baseBottomY = cy + 0.98 * scaleY;
    canvasRenderingContext.moveTo(baseBottomX, baseBottomY);

    const leftPawX = cx - 0.54 * scaleX, leftPawY = cy + 0.97 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx - 0.25 * scaleX, cy + 0.98 * scaleY, leftPawX, leftPawY);

    const leftThighX = cx + (-0.66 - bass * 0.04) * scaleX, leftThighY = cy + 0.68 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx - 0.64 * scaleX, cy + 0.92 * scaleY, leftThighX, leftThighY);

    const leftBackX = cx + (-0.42 + spineSway * 0.2) * scaleX, leftBackY = cy + 0.24 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx - 0.65 * scaleX, cy + 0.44 * scaleY, leftBackX, leftBackY);

    const leftShoulderX = cx + (-0.34 + spineSway * 0.4) * scaleX, leftShoulderY = cy - 0.04 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx - 0.40 * scaleX, cy + 0.08 * scaleY, leftShoulderX, leftShoulderY);

    const leftNapeX = cx + (-0.32 + spineSway * 0.6) * scaleX, leftNapeY = cy - 0.36 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx - 0.28 * scaleX, cy - 0.20 * scaleY, leftNapeX, leftNapeY);

    const leftEarOuterX = cx + (-0.36 + spineSway * 0.6) * scaleX, leftEarOuterY = cy - 0.52 * scaleY;
    canvasRenderingContext.lineTo(leftEarOuterX, leftEarOuterY);

    const leftEarTipX = cx + (-0.31 - earPerk * 0.2 + spineSway * 0.7) * scaleX, leftEarTipY = cy + (-0.98 - earPerk * 0.4) * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx - 0.37 * scaleX, cy - 0.76 * scaleY, leftEarTipX, leftEarTipY);

    const leftEarInnerX = cx + (-0.13 + spineSway * 0.7) * scaleX, leftEarInnerY = cy - 0.64 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx - 0.20 * scaleX, cy - 0.78 * scaleY, leftEarInnerX, leftEarInnerY);

    const rightEarInnerX = cx + (0.13 + spineSway * 0.7) * scaleX, rightEarInnerY = cy - 0.64 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx + spineSway * 0.7 * scaleX, cy - 0.67 * scaleY, rightEarInnerX, rightEarInnerY);

    const rightEarTipX = cx + (0.31 + earPerk * 0.2 + spineSway * 0.7) * scaleX, rightEarTipY = cy + (-0.98 - earPerk * 0.4) * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx + 0.20 * scaleX, cy - 0.78 * scaleY, rightEarTipX, rightEarTipY);

    const rightEarOuterX = cx + (0.36 + spineSway * 0.6) * scaleX, rightEarOuterY = cy - 0.52 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx + 0.37 * scaleX, cy - 0.76 * scaleY, rightEarOuterX, rightEarOuterY);

    const rightNapeX = cx + (0.32 + spineSway * 0.6) * scaleX, rightNapeY = cy - 0.36 * scaleY;
    canvasRenderingContext.lineTo(rightNapeX, rightNapeY);

    const rightShoulderX = cx + (0.34 + spineSway * 0.4) * scaleX, rightShoulderY = cy - 0.04 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx + 0.28 * scaleX, cy - 0.20 * scaleY, rightShoulderX, rightShoulderY);

    const rightBackX = cx + (0.42 + spineSway * 0.2) * scaleX, rightBackY = cy + 0.24 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx + 0.40 * scaleX, cy + 0.08 * scaleY, rightBackX, rightBackY);

    const rightThighX = cx + (0.66 + bass * 0.04) * scaleX, rightThighY = cy + 0.68 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx + 0.65 * scaleX, cy + 0.44 * scaleY, rightThighX, rightThighY);

    const rightPawX = cx + 0.54 * scaleX, rightPawY = cy + 0.97 * scaleY;
    canvasRenderingContext.quadraticCurveTo(cx + 0.64 * scaleX, cy + 0.92 * scaleY, rightPawX, rightPawY);
    canvasRenderingContext.quadraticCurveTo(cx + 0.25 * scaleX, cy + 0.98 * scaleY, baseBottomX, baseBottomY);

    canvasRenderingContext.closePath();

    if (anatomyCoordinatesInstance) {
        if (typeof anatomyCoordinatesInstance.updateTailAnchor === "function") {
            anatomyCoordinatesInstance.updateTailAnchor(cx - 0.14 * scaleX, cy + 0.92 * scaleY);
            anatomyCoordinatesInstance.updateEars(
                [leftEarTipX, leftEarTipY], [leftEarOuterX, leftEarOuterY], [leftEarInnerX, leftEarInnerY],
                [rightEarTipX, rightEarTipY], [rightEarOuterX, rightEarOuterY], [rightEarInnerX, rightEarInnerY]
            );
            anatomyCoordinatesInstance.updateSpineAndHead(
                [cx + spineSway * 0.7 * scaleX, cy - 0.45 * scaleY],
                [cx + spineSway * 0.3 * scaleX, cy + 0.12 * scaleY],
                [baseBottomX, baseBottomY]
            );
        } else if (anatomyCoordinatesInstance.landmarks) {
            const lm = anatomyCoordinatesInstance.landmarks;
            lm.tailAnchor = [cx - 0.14 * scaleX, cy + 0.92 * scaleY];
            lm.leftEarTip = [leftEarTipX, leftEarTipY]; lm.leftEarOuter = [leftEarOuterX, leftEarOuterY]; lm.leftEarInner = [leftEarInnerX, leftEarInnerY];
            lm.rightEarTip = [rightEarTipX, rightEarTipY]; lm.rightEarOuter = [rightEarOuterX, rightEarOuterY]; lm.rightEarInner = [rightEarInnerX, rightEarInnerY];
            lm.headCenter = [cx + spineSway * 0.7 * scaleX, cy - 0.45 * scaleY];
            lm.spineMid = [cx + spineSway * 0.3 * scaleX, cy + 0.12 * scaleY];
            lm.baseCenter = [baseBottomX, baseBottomY];
        }
    }
}

