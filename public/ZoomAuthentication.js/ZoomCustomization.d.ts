export declare enum ZoomExitAnimationStyle {
    None = 0,
    RippleOut = 1,
    FadeOutMin = 2
}
export declare enum ZoomCancelButtonLocation {
    Disable = 0,
    TopLeft = 1,
    TopRight = 2
}
export interface OvalCustomization {
    strokeColor: string;
    progressColor1: string;
    progressColor2: string;
    progressStrokeWidth: number;
    strokeWidth: number;
}
export interface FeedbackCustomization {
    backgroundColor: string;
    textFont: string;
    textColor: string;
}
export interface FrameCustomization {
    backgroundColor: string;
}
export interface CancelButtonCustomization {
    location: number;
}
export interface ExitAnimationCustomization {
    exitAnimationSuccess: number;
    exitAnimationUnsuccess: number;
}
export interface ZoomSessionTimer {
    maxTimeOverall: number;
    maxTimeToDetectFirstFace: number;
    maxTimeToDetectFirstFaceInPhaseTwo: number;
}
export interface Customization {
    ovalCustomization: ZoomOvalCustomization;
    feedbackCustomization: ZoomFeedbackCustomization;
    frameCustomization: ZoomFrameCustomization;
    exitAnimationCustomization: ZoomExitAnimationCustomization;
    cancelButtonCustomization: ZoomCancelButtonCustomization;
    sessionTimerCustomization: ZoomSessionTimer;
}
export declare class ZoomCustomization implements Customization {
    ovalCustomization: ZoomOvalCustomization;
    feedbackCustomization: ZoomFeedbackCustomization;
    frameCustomization: ZoomFrameCustomization;
    exitAnimationCustomization: ZoomExitAnimationCustomization;
    cancelButtonCustomization: ZoomCancelButtonCustomization;
    sessionTimerCustomization: ZoomSessionTimerCustomization;
    constructor();
}
export declare class ZoomSessionTimerCustomization implements ZoomSessionTimer {
    maxTimeOverall: number;
    maxTimeToDetectFirstFace: number;
    maxTimeToDetectFirstFaceInPhaseTwo: number;
    constructor();
}
export declare class ZoomExitAnimationCustomization implements ExitAnimationCustomization {
    exitAnimationSuccess: ZoomExitAnimationStyle;
    exitAnimationUnsuccess: ZoomExitAnimationStyle;
    constructor();
}
export declare class ZoomOvalCustomization implements OvalCustomization {
    strokeColor: string;
    progressColor1: string;
    progressColor2: string;
    progressStrokeWidth: number;
    strokeWidth: number;
    constructor();
}
export declare class ZoomFrameCustomization implements FrameCustomization {
    backgroundColor: string;
    constructor();
}
export declare class ZoomCancelButtonCustomization implements CancelButtonCustomization {
    location: ZoomCancelButtonLocation;
    constructor();
}
export declare class ZoomFeedbackCustomization implements FeedbackCustomization {
    backgroundColor: string;
    textColor: string;
    textFont: string;
    constructor();
}
export declare var Properties: {
    setCustomization: (customization: ZoomCustomization) => void;
    ZoomCustomization: Customization;
    currentCustomization: ZoomCustomization;
    ZoomOvalCustomization: ZoomOvalCustomization;
    ZoomCancelButtonCustomization: ZoomCancelButtonCustomization;
    ZoomExitAnimationCustomization: ZoomExitAnimationCustomization;
    ZoomFeedbackCustomization: ZoomFeedbackCustomization;
    ZoomFrameCustomization: ZoomFrameCustomization;
    ZoomSessionTimerCustomization: ZoomSessionTimerCustomization;
    ZoomExitAnimationStyle: typeof ZoomExitAnimationStyle;
    ZoomCancelButtonLocation: typeof ZoomCancelButtonLocation;
};
//# sourceMappingURL=ZoomCustomization.d.ts.map