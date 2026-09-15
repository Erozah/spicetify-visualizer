export class AudioMathInterpolation {
    static binarySearchIndex(array, valueExtractor, targetPosition) {
        let lowerBound = 0;
        let upperBound = array.length;

        while (upperBound - lowerBound > 1) {
            const middleIndex = Math.floor((upperBound + lowerBound) / 2);
            const positionValue = valueExtractor(array[middleIndex], middleIndex);

            if (positionValue <= targetPosition) {
                lowerBound = middleIndex;
            } else {
                upperBound = middleIndex;
            }
        }
        return lowerBound;
    }

    static decibelsToAmplitude(decibels) {
        return Math.min(Math.max(Math.pow(10, decibels / 20), 0), 1);
    }

    static smoothstep(value) {
        const clampedValue = Math.max(0, Math.min(1, value));
        return clampedValue * clampedValue * (3 - 2 * clampedValue);
    }

    static mapLinear(value, inputMin, inputMax, outputMin, outputMax) {
        const normalized = (value - inputMin) / (inputMax - inputMin);
        return normalized * (outputMax - outputMin) + outputMin;
    }

    static integrateLinearSegment(pointA, pointB) {
        return -0.5 * (pointA.x - pointB.x) * (pointA.y + pointB.y);
    }

    static sampleSegmentedFunction(array, getX, getY, interpolationFunction, targetPosition) {
        if (!array || array.length === 0) return 0;
        const index = this.binarySearchIndex(array, getX, targetPosition);
        const point = array[index];

        if (index > array.length - 2) return getY(point, index);
        const nextPoint = array[index + 1];

        const pointX = getX(point, index);
        const nextPointX = getX(nextPoint, index + 1);
        const pointY = getY(point, index);
        const nextPointY = getY(nextPoint, index + 1);

        const normalizedX = (targetPosition - pointX) / (nextPointX - pointX);
        const interpolatedT = interpolationFunction(normalizedX);
        return interpolatedT * (nextPointY - pointY) + pointY;
    }

    static sampleAmplitudeMovingAverage(amplitudeCurve, targetPosition, windowSize) {
        if (!amplitudeCurve || amplitudeCurve.length === 0) return 0;
        if (windowSize === 0) {
            return this.sampleSegmentedFunction(
                amplitudeCurve,
                (entry) => entry.x,
                (entry) => entry.y,
                (x) => x,
                targetPosition
            );
        }

        const windowStart = targetPosition - windowSize / 2;
        const windowEnd = targetPosition + windowSize / 2;
        const startIndex = this.binarySearchIndex(amplitudeCurve, (entry) => entry.x, windowStart);
        const endIndex = this.binarySearchIndex(amplitudeCurve, (entry) => entry.x, windowEnd);

        if (startIndex === endIndex) {
            const firstPoint = amplitudeCurve[startIndex];
            if (startIndex > amplitudeCurve.length - 2) return firstPoint.y;
            const secondPoint = amplitudeCurve[startIndex + 1];

            const interpolatedStart = this.mapLinear(windowStart, firstPoint.x, secondPoint.x, firstPoint.y, secondPoint.y);
            const interpolatedEnd = this.mapLinear(windowEnd, firstPoint.x, secondPoint.x, firstPoint.y, secondPoint.y);
            return (interpolatedStart + interpolatedEnd) / 2;
        }

        let integratedSum = 0;
        let previousPoint = amplitudeCurve[startIndex];
        let nextPoint = amplitudeCurve[startIndex + 1];
        let clampedStart = { x: windowStart, y: this.mapLinear(windowStart, previousPoint.x, nextPoint.x, previousPoint.y, nextPoint.y) };
        integratedSum += this.integrateLinearSegment(clampedStart, nextPoint);

        for (let currentIndex = startIndex + 1; currentIndex < endIndex; currentIndex++) {
            previousPoint = nextPoint;
            nextPoint = amplitudeCurve[currentIndex + 1];
            integratedSum += this.integrateLinearSegment(previousPoint, nextPoint);
        }

        previousPoint = nextPoint;
        if (endIndex > amplitudeCurve.length - 2) {
            integratedSum += previousPoint.y * (windowEnd - previousPoint.x);
        } else {
            nextPoint = amplitudeCurve[endIndex + 1];
            const clampedEnd = { x: windowEnd, y: this.mapLinear(windowEnd, previousPoint.x, nextPoint.x, previousPoint.y, nextPoint.y) };
            integratedSum += this.integrateLinearSegment(previousPoint, clampedEnd);
        }

        return integratedSum / windowSize;
    }

    static sampleAccumulatedIntegral(amplitudeCurve, targetPosition) {
        if (!amplitudeCurve || amplitudeCurve.length === 0) return 0;
        const index = this.binarySearchIndex(amplitudeCurve, (entry) => entry.x, targetPosition);
        const currentPoint = amplitudeCurve[index];

        if (index + 1 >= amplitudeCurve.length) {
            return (currentPoint.accumulatedIntegral || 0) + currentPoint.y * (targetPosition - currentPoint.x);
        }

        const nextPoint = amplitudeCurve[index + 1];
        const interpolatedMiddle = {
            x: targetPosition,
            y: this.mapLinear(targetPosition, currentPoint.x, nextPoint.x, currentPoint.y, nextPoint.y)
        };

        return (currentPoint.accumulatedIntegral || 0) + this.integrateLinearSegment(currentPoint, interpolatedMiddle);
    }
}
