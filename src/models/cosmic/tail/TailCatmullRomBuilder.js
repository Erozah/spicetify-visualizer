// src/models/cosmic/tail/TailCatmullRomBuilder.js - Catmull-Rom closed spline path builder for feline tail

/**
 * Builds a smooth Catmull-Rom closed path for the feline tail using pre-allocated envelope points.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {Array<Object>} tailNodes
 * @param {Array<Object>} leftEnvelopePoints
 * @param {Array<Object>} rightEnvelopePoints
 * @param {number} totalSegmentCount
 * @param {number} baseRenderScale
 */
export function buildTailClosedPath(
    canvasRenderingContext,
    tailNodes,
    leftEnvelopePoints,
    rightEnvelopePoints,
    totalSegmentCount,
    baseRenderScale
) {
    const leftPoints = leftEnvelopePoints;
    const rightPoints = rightEnvelopePoints;
    const segmentCount = totalSegmentCount;

    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(leftPoints[0].x, leftPoints[0].y);

    // 1. Left spine side contour (Smooth Catmull-Rom spline)
    for (let segmentIndex = 0; segmentIndex < segmentCount - 1; segmentIndex++) {
        const point0 = segmentIndex > 0 ? leftPoints[segmentIndex - 1] : leftPoints[0];
        const point1 = leftPoints[segmentIndex];
        const point2 = leftPoints[segmentIndex + 1];
        const point3 = segmentIndex < segmentCount - 2 ? leftPoints[segmentIndex + 2] : point2;

        const controlPoint1X = point1.x + (point2.x - point0.x) * 0.1666666;
        const controlPoint1Y = point1.y + (point2.y - point0.y) * 0.1666666;
        const controlPoint2X = point2.x - (point3.x - point1.x) * 0.1666666;
        const controlPoint2Y = point2.y - (point3.y - point1.y) * 0.1666666;

        canvasRenderingContext.bezierCurveTo(
            controlPoint1X, controlPoint1Y,
            controlPoint2X, controlPoint2Y,
            point2.x, point2.y
        );
    }

    // 2. Rounded feline tail tip cap
    const tipNode = tailNodes[segmentCount - 1];
    const tipRightPoint = rightPoints[segmentCount - 1];
    canvasRenderingContext.quadraticCurveTo(
        tipNode.x - 4 * baseRenderScale,
        tipNode.y + 2 * baseRenderScale,
        tipRightPoint.x,
        tipRightPoint.y
    );

    // 3. Right spine side contour (returning back to root anchor)
    for (let segmentIndex = segmentCount - 1; segmentIndex > 0; segmentIndex--) {
        const point0 = segmentIndex < segmentCount - 1 ? rightPoints[segmentIndex + 1] : rightPoints[segmentCount - 1];
        const point1 = rightPoints[segmentIndex];
        const point2 = rightPoints[segmentIndex - 1];
        const point3 = segmentIndex > 1 ? rightPoints[segmentIndex - 2] : point2;

        const controlPoint1X = point1.x + (point2.x - point0.x) * 0.1666666;
        const controlPoint1Y = point1.y + (point2.y - point0.y) * 0.1666666;
        const controlPoint2X = point2.x - (point3.x - point1.x) * 0.1666666;
        const controlPoint2Y = point2.y - (point3.y - point1.y) * 0.1666666;

        canvasRenderingContext.bezierCurveTo(
            controlPoint1X, controlPoint1Y,
            controlPoint2X, controlPoint2Y,
            point2.x, point2.y
        );
    }

    canvasRenderingContext.closePath();
}

// Backward-compatible alias
