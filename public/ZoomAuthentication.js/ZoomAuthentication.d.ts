import * as ZoomCustomization from './ZoomCustomization';
import { ZoomLoggingMode } from "./ZoomLogging";
import { ZoomSessionResult } from "./ZoomSessionResult";
import { KnownIncompatibleBrowsers } from "./ZoomIncompatibleBrowsers";
declare enum ZoomCaptureResult {
    /**
     * Missing or Invalid Camera Object.
     */
    MissingCameraObject = "Missing or Invalid Camera Object.",
    /**
     * ZoOm is not ready to capture.  A ZoOm Session could already be in progress.
     */
    ZoomSessionInProgress = "ZoOm is not ready to capture.  A ZoOm Session could already be in progress.",
    /**
     * Selected camera is not active.
     */
    CameraNotRunning = "Selected camera is not active.",
    /**
     * Zoom is currently busy.
     */
    ZoomIsNotReady = "Zoom is currently busy.",
    /**
     * The session timed out before completion.
     */
    SessionTimedOut = "The session timed out before completion.",
    /**
     * Session failed due to an internal error.
     */
    FailedDueToInternalError = "Session failed due to an internal error.",
    /**
     * Session cancelled due to Browser/OS Context Switch.
     */
    FailedDueToOSContextSwitch = "Session cancelled due to Browser/OS Context Switch.",
    /**
     * Session cancelled due to Timout while looking for first face
     */
    FailedDueToTooMuchTimeToDetectFirstFace = "Session cancelled due to too much time before first face was found.",
    /**
     * Session cancelled due to Timout while looking for first face in phase 2
     */
    FailedDueToTooMuchTimeToDetectFirstFaceInPhaseTwo = "Session cancelled due to too much time before first face found in Phase two.",
    /**
     * Session cancelled programatically by developer code
     */
    ProgramaticallyCancelled = "Session cancelled programatically.",
    /**
     * Session cancelled due to device orientation change
     */
    FailedDueToOrientationChange = "Session cancelled due to Device orientation change.",
    /**
     * ZoOm session did not start because user is in landscape mode on iOS.
     */
    DeviceInLandscapeMode = "ZoOm session did not start because user is in landscape mode on iOS.",
    /**
     * A network connection when using an HTTPS license.
     */
    NetworkingMissingInDevMode = "A network connection when using an HTTPS license.",
    /**
     * User cancelled the session before completion.
     */
    UserCancelled = "User cancelled the session before completion.",
    /**
     * Zoom is in lockout state.
     */
    UserIsLockedOut = "Zoom is in lockout state.",
    /**
     * Zoom failed due to network issues.
     */
    NetworkIssues = "Zoom failed due to network issues.",
    /**
     * Session captured successfully.
     */
    SessionCompleted = "Session captured successfully.",
    /**
     * Preload was never completed.
     */
    PreloadIsNotComplete = "Preload was never completed.",
    /**
     * Camera does not exist.
     */
    CameraDoesNotExist = "Camera does not exist.",
    /**
     * Never validated.
     */
    NeverValidated = "Never validated.",
    /**
     * Initialized.
     */
    Initialized = "Initialized.",
    /**
     * ZoomSDK.preload() must be ran before capturing a ZoOm Session.
     */
    NotPreloaded = "ZoomSDK.preload() must be ran before capturing a ZoOm Session.",
    /**
     * ZoomSDK.prepare must be ran before capturing a ZoOm Session.
     */
    NotPrepared = "ZoomSDK.prepare must be ran before capturing a ZoOm Session.",
    /**
     * ZoOm Session Completed.
     */
    ZoomSessionCompleted = "ZoOm Session Completed.",
    /**
     * ZoOm is not properly initialized.  Please call ZoomSDK.getStatus() for more information.
     */
    GetStatusNotInitialized = "ZoOm is not properly initialized.  Please call ZoomSDK.getStatus() for more information."
}
declare enum ZoomSDKStatus {
    /**
     * Initialize was never attempted.
     */
    NEVER_INITIALIZED = "Initialize was never attempted.",
    /**
     * Initialized successfully.
     */
    INITIALIZED = "Initialized successfully.",
    /**
     * Initialize failed due to network issues.
     */
    NETWORK_ISSUES = "Initialize failed due to network issues.",
    /**
     * Validation of your App Token did not succeed.
     */
    INVALID_TOKEN = "Validation of your App Token did not succeed.",
    /**
     * Current version of SDK is deprecated.
     */
    VERSION_DEPRECATED = "Current version of SDK is deprecated.",
    /**
     * The App Token has not been validated recently.
     */
    OFFLINE_SESSIONS_EXCEEDED = "The App Token has not been validated recently.",
    /**
     *  The system is incompatible with the ZoOm SDK.
     */
    DEVICE_NOT_SUPPORTED = "The system is incompatible with the ZoOm SDK.",
    /**
     *  The device is in landscape mode.
     */
    DEVICE_IN_LANDSCAPE_MODE = "The device is in landscape mode.",
    /**
     *  Selected camera is not active.
     */
    CAMERA_NOT_RUNNING = "Selected camera is not active.",
    /**
     *  The device is locked out of ZoOm.
     */
    DEVICE_LOCKED_OUT = "The device is locked out of ZoOm.",
    /**
    * License was expired, contained invalid text, or you are attempting to initialize on a domain that is not specified in your license.
    */
    LICENSE_EXPIRED_OR_INVALID = "License was expired, contained invalid text, or you are attempting to initialize on a domain that is not specified in your license."
}
declare class ZoomSession {
    onZoomSessionComplete: (zoomResult: ZoomSessionResult) => void;
    selectedTrack: MediaStreamTrack;
    onZoomSessionProcessingStarted: (status: string) => void;
    capture: () => void;
    cancel: () => void;
    setOnZoomSessionProcessingStarted: (onZoomSessionProcessingStartedFunction: (status: string) => void) => void;
    constructor(onZoomSessionComplete: (zoomResult: ZoomSessionResult) => void, selectedTrack: MediaStreamTrack);
    private setCaptureStatusAndReturnToDeveloper;
    private captureZoomSession;
}
declare enum ZoomPreloadResult {
    /**
     * Preload Completed Successfully.
     */
    Success = "Preload Completed Successfully.",
    /**
     * An error was encountered preloading ZoOm resources.
     */
    Error = "An error was encountered preloading ZoOm resources."
}
declare enum ZoomPrepareInterfaceResult {
    /**
     * Prepare Interface Completed Successfully.
     */
    Success = "Prepare Interface Completed Successfully.",
    /**
     * Cannot prepare ZoOm interface without calling ZoomSDK.preload() first and waiting for ZoomSDK.preload() to successfully complete.
     */
    NotPreloaded = "Cannot prepare ZoOm interface without calling ZoomSDK.preload() first and waiting for ZoomSDK.preload() to successfully complete.",
    /**
     * Cannot prepare ZoOm interface because one of the element IDs passed in does not exist on the DOM.
     */
    ZoomVideoOrInterfaceDOMElementDoesNotExist = "Cannot prepare ZoOm interface because one of the element IDs passed in does not exist on the DOM.",
    /**
     * Cannot prepare ZoOm interface when ZoOm Session is in progress.
     */
    ZoomSessionInProgress = "Cannot prepare ZoOm interface when ZoOm Session is in progress.",
    /**
     * Cannot prepare ZoOm interface when document not ready.
     */
    DocumentNotReady = "Cannot prepare ZoOm interface when document not ready.",
    /**
     * Cannot prepare ZoOm interface when on iOS and in landscape mode.  Portrait mode is required on iOS.
     */
    DeviceInLandscapeMode = "Cannot prepare ZoOm interface when on iOS and in landscape mode.  Portrait mode is required on iOS.",
    /**
     * Cannot prepare ZoOm interface because the video height/width was 0. The camera or video may not be initialized.
     */
    VideoHeightOrWidthZeroOrUninitialized = "Cannot prepare ZoOm interface because the video height/width was 0. The camera or video may not be initialized."
}
declare enum ZoomAuditTrailType {
    None = 0,
    FullResolution = 1
}
export declare var ZoomSDK: {
    /**
      * Initialize ZoomSDK using a Device SDK License - HTTPS Log mode
    **/
    initialize: (appToken: string, onInitializationComplete: (result: boolean) => void) => void;
    /**
      * Initialize ZoomSDK using a Device SDK License - SFTP Log mode
    **/
    initializeWithLicenseText: (licenseText: string, appToken: string, callback: (result: boolean) => void) => void;
    /**
      * Preload the ZoomSDK Engine  before attempting to start a ZoOm session
    **/
    preload: (onPreloadComplete: (status: any) => void) => void;
    /**
      * Ensure that the ZoomSDK is initialized and ready before attempting to start a ZoOm session
    **/
    getStatus: () => string;
    /**
      * Create the Zoom interface after the video element is ready and before intiating any ZoomSession functionality
    **/
    prepareInterface: (zoomContainerId: string, videoElementId: string, onPrepareInterfaceComplete: (result: string) => void) => void;
    /**
      * Core function calls that create and launch the ZoOm interface
    **/
    ZoomSession: typeof ZoomSession;
    /**
      * Return the Zoom enums associated with the core ZoomSDK API results
    **/
    ZoomTypes: {
        ZoomSDKStatus: typeof ZoomSDKStatus;
        ZoomPreloadResult: typeof ZoomPreloadResult;
        ZoomPrepareInterfaceResult: typeof ZoomPrepareInterfaceResult;
        ZoomCaptureResult: typeof ZoomCaptureResult;
        ZoomLoggingMode: typeof ZoomLoggingMode;
        ZoomAuditTrailType: typeof ZoomAuditTrailType;
    };
    /**
       * Return the ZoomSDK customization object
     **/
    ZoomCustomization: () => typeof ZoomCustomization.ZoomCustomization;
    /**
      * Return the ZoomSDK oval customization object
    **/
    ZoomOvalCustomization: () => ZoomCustomization.OvalCustomization;
    /**
      * Return the ZoomSDK cancel button customization object
    **/
    ZoomCancelButtonCustomization: () => ZoomCustomization.CancelButtonCustomization;
    /**
      * Return the ZoomSDK Exit Animation customization object
    **/
    ZoomExitAnimationCustomization: () => ZoomCustomization.ExitAnimationCustomization;
    /**
      * Return the ZoomSDK Feedback customization object
    **/
    ZoomFeedbackCustomization: () => ZoomCustomization.FeedbackCustomization;
    /**
      * Return the ZoomSDK Frame customization object
    **/
    ZoomFrameCustomization: () => ZoomCustomization.FrameCustomization;
    /**
     * Return the ZoomSDK Frame customization object
   **/
    ZoomSessionTimerCustomization: () => ZoomCustomization.ZoomSessionTimerCustomization;
    /**
      * Apply the specified customization parameters for ZoOm
    **/
    setCustomization: (customization: ZoomCustomization.ZoomCustomization) => void;
    /**
      * Return the available ZoomSDK Exit Animation styles
    **/
    ZoomExitAnimationStyle: typeof ZoomCustomization.ZoomExitAnimationStyle;
    /**
      * Return the available ZoomSDK Cancel Button locations
    **/
    ZoomCancelButtonLocation: typeof ZoomCustomization.ZoomCancelButtonLocation;
    /**
      * Return data about the current ZoomSDK lockout state
    **/
    getLockoutData: () => {
        lockoutTime: number;
        attemptsAvailable: number;
    };
    /**
      * Set the desired ZoomSDK audit trail behaviour
    **/
    auditTrailType: ZoomAuditTrailType;
    /**
      * Unload all ZoomSDK and all its resources
    **/
    unload: (callback: () => void) => void;
    /**
      * Return the current ZoomSDK version
    **/
    /**
    *   Developer API to set logging mode to enumerated ZoomLoggingMode
    *   Default       - Log all important messages to the console.
    *   LocalhostOnly - Remove all logging except for when developing on Localhost
    *   Usage Example - ZoomSDK.setZoomLoggingMode(ZoomSDK.ZoomTypes.ZoomLoggingMode.LocalhostOnly)
    */
    setZoomLoggingMode: (enumValue: ZoomLoggingMode) => void;
    currentZoomVersion: () => string;
    /**
      * Change the default location of the ZoomSDK resources to be loaded. Default is "../ZoomAuthentication.js/resources"
    **/
    zoomResourceDirectory: (directory?: string | undefined) => string;
    /**
      * Return information about the current browser and OS related to support for ZoomSDK
    **/
    getBrowserSupport: () => {
        ZoomVersion: string;
        supported: boolean;
        status: string;
        osName: string;
        browserName: string;
        isMobileDevice: boolean;
        zoomSupportData: {
            deficientSystem: boolean;
            zoomModeResponse: any;
        };
        DetectRTC: {
            isGetUserMediaSupported: boolean;
            isWebWasmSupported: boolean;
            isWebWorkerSupported: boolean;
            isIosAndNotSafari: boolean;
            browser: {
                name: string;
                osName: string;
                version: string;
                isChrome: boolean;
                isFirefox: boolean;
                isSafari: boolean;
                isEdge: boolean;
                isOpera: boolean;
                isIE: boolean;
            };
            osName: string;
            deficientSystem: boolean;
            isMobileDevice: boolean;
        };
        incompatibleBrowserInformation: KnownIncompatibleBrowsers;
    };
    /**
      * Create a Zoom Rest API compatible User Agent string to be used in header element X-User-Agent when using FaceTec's Rest Api Services
    **/
    createZoomAPIUserAgentString: (sessionID: string) => string;
};
export {};
