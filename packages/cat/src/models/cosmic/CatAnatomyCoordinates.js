// src/models/cosmic/CatAnatomyCoordinates.js - Feline anatomical landmarks & reference coordinates

export class CatAnatomyCoordinates {
    constructor() {
        this.landmarks = {
            tailAnchorCoordinate: [0, 0],
            leftEarTipCoordinate: [0, 0],
            leftEarOuterBaseCoordinate: [0, 0],
            leftEarInnerBaseCoordinate: [0, 0],
            rightEarTipCoordinate: [0, 0],
            rightEarOuterBaseCoordinate: [0, 0],
            rightEarInnerBaseCoordinate: [0, 0],
            headCenterCoordinate: [0, 0],
            spineMidpointCoordinate: [0, 0],
            bodyBaseCenterCoordinate: [0, 0],
            // Backward-compatible short keys
            tailAnchor: [0, 0],
            leftEarTip: [0, 0],
            leftEarOuter: [0, 0],
            leftEarInner: [0, 0],
            rightEarTip: [0, 0],
            rightEarOuter: [0, 0],
            rightEarInner: [0, 0],
            headCenter: [0, 0],
            spineMid: [0, 0],
            baseCenter: [0, 0]
        };
    }

    updateTailAnchor(positionX, positionY) {
        this.landmarks.tailAnchorCoordinate[0] = positionX;
        this.landmarks.tailAnchorCoordinate[1] = positionY;
        this.landmarks.tailAnchor[0] = positionX;
        this.landmarks.tailAnchor[1] = positionY;
    }

    updateEars(leftTip, leftOuter, leftInner, rightTip, rightOuter, rightInner) {
        this.copyCoordinate(this.landmarks.leftEarTipCoordinate, leftTip);
        this.copyCoordinate(this.landmarks.leftEarOuterBaseCoordinate, leftOuter);
        this.copyCoordinate(this.landmarks.leftEarInnerBaseCoordinate, leftInner);
        this.copyCoordinate(this.landmarks.rightEarTipCoordinate, rightTip);
        this.copyCoordinate(this.landmarks.rightEarOuterBaseCoordinate, rightOuter);
        this.copyCoordinate(this.landmarks.rightEarInnerBaseCoordinate, rightInner);

        this.copyCoordinate(this.landmarks.leftEarTip, leftTip);
        this.copyCoordinate(this.landmarks.leftEarOuter, leftOuter);
        this.copyCoordinate(this.landmarks.leftEarInner, leftInner);
        this.copyCoordinate(this.landmarks.rightEarTip, rightTip);
        this.copyCoordinate(this.landmarks.rightEarOuter, rightOuter);
        this.copyCoordinate(this.landmarks.rightEarInner, rightInner);
    }

    updateSpineAndHead(headCoordinate, spineCoordinate, baseCoordinate) {
        this.copyCoordinate(this.landmarks.headCenterCoordinate, headCoordinate);
        this.copyCoordinate(this.landmarks.spineMidpointCoordinate, spineCoordinate);
        this.copyCoordinate(this.landmarks.bodyBaseCenterCoordinate, baseCoordinate);

        this.copyCoordinate(this.landmarks.headCenter, headCoordinate);
        this.copyCoordinate(this.landmarks.spineMid, spineCoordinate);
        this.copyCoordinate(this.landmarks.baseCenter, baseCoordinate);
    }

    copyCoordinate(targetCoordinateArray, sourceCoordinateArray) {
        targetCoordinateArray[0] = sourceCoordinateArray[0];
        targetCoordinateArray[1] = sourceCoordinateArray[1];
    }
}
