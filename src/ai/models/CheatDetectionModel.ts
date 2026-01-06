import * as tf from '@tensorflow/tfjs';

export interface DetectionResult {
  gazeDirection: { x: number; y: number };
  faceDetected: boolean;
  handsVisible: number;
  headPose: { pitch: number; yaw: number; roll: number };
  suspiciousActivity: boolean;
  confidence: number;
}

export class CheatDetectionModel {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize() {
    try {
      this.model = await tf.loadLayersModel('/models/cheat_detection_model.json');
      this.isInitialized = true;
      console.log('Cheat detection model loaded successfully');
    } catch (err) {
      console.warn('Model not found, using rule-based fallback');
      this.isInitialized = true;
    }
  }

  async processFaceMesh(faceResults: any): Promise<DetectionResult | null> {
    if (!faceResults) return null;

    // Parse results
    const faceDetected = !!faceResults.multiFaceLandmarks?.length;
    const handsVisible = 0; // updated later from processHands
    const gazeDirection = this.calculateGazeDirection(faceResults);
    const headPose = this.calculateHeadPose(faceResults);

    // Evaluate
    const suspiciousActivity = this.ruleBasedDetection(gazeDirection, headPose, handsVisible, faceDetected);
    const confidence = this.calculateConfidence(gazeDirection, headPose, handsVisible, faceDetected);

    return {
      gazeDirection,
      faceDetected,
      handsVisible,
      headPose,
      suspiciousActivity,
      confidence
    };
  }

  processHands(handResults: any): number {
    return handResults?.multiHandLandmarks?.length || 0;
  }

  processPose(_poseResults: any) {
    // optional for future extension
  }

  // -----------------------------------
  //  ANALYTICS
  // -----------------------------------

  private calculateGazeDirection(faceResults: any) {
    if (!faceResults?.multiFaceLandmarks?.[0]) {
      return { x: 0, y: 0 };
    }

    const lm = faceResults.multiFaceLandmarks[0];
    const leftEye = lm[33];
    const rightEye = lm[263];
    const nose = lm[1];

    const gazeX = (leftEye.x + rightEye.x) / 2 - nose.x;
    const gazeY = (leftEye.y + rightEye.y) / 2 - nose.y;

    return { x: gazeX, y: gazeY };
  }

  private calculateHeadPose(faceResults: any) {
    if (!faceResults?.multiFaceLandmarks?.[0]) {
      return { pitch: 0, yaw: 0, roll: 0 };
    }

    const lm = faceResults.multiFaceLandmarks[0];

    const leftEar = lm[234];
    const rightEar = lm[454];
    const chin = lm[175];
    const forehead = lm[10];

    const yaw = Math.atan2(rightEar.x - leftEar.x, rightEar.z - leftEar.z) * 180 / Math.PI;
    const pitch = Math.atan2(forehead.y - chin.y, forehead.z - chin.z) * 180 / Math.PI;
    const roll = Math.atan2(rightEar.y - leftEar.y, rightEar.x - leftEar.x) * 180 / Math.PI;

    return { pitch, yaw, roll };
  }

  // -----------------------------------
  // RULE BASED FALLBACK
  // -----------------------------------

  private ruleBasedDetection(
    gaze: any,
    head: any,
    handsVisible: number,
    faceDetected: boolean
  ) {
    const gazeThreshold = 0.3;
    const headThreshold = 30;

    const badGaze = Math.abs(gaze.x) > gazeThreshold || Math.abs(gaze.y) > gazeThreshold;
    const badHead = Math.abs(head.yaw) > headThreshold || Math.abs(head.pitch) > headThreshold;
    const noFace = !faceDetected;
    const tooManyHands = handsVisible > 2;

    return badGaze || badHead || noFace || tooManyHands;
  }

  private calculateConfidence(
    gaze: any,
    head: any,
    handsVisible: number,
    faceDetected: boolean
  ) {
    let c = 0.5;

    if (!faceDetected) c += 0.3;
    if (Math.abs(gaze.x) > 0.3) c += 0.2;
    if (Math.abs(gaze.y) > 0.3) c += 0.2;
    if (Math.abs(head.yaw) > 30) c += 0.15;
    if (handsVisible > 2) c += 0.1;

    return Math.min(c, 1.0);
  }

  dispose() {
    this.model?.dispose();
  }
}
