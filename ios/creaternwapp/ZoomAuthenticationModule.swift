//
//  ZoomAuthenticationModule.swift
//  ZoomVerificationNative
//
//  Created by Alex Serdukov on 4/27/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import UIKit
import ZoomAuthentication
import LocalAuthentication

@objc(ZoomAuthentication)
open class ZoomAuthenticationModule: RCTEventEmitter {
  override static public func moduleName() -> String! {
    return "ZoomAuthentication";
  }
  
  override static public func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override public init() {
    super.init()
    
    EventEmitter.shared.register(withRCTEventEmitter: self)
  }
  
  @objc
  override open func supportedEvents() -> [String]! {
    return UXEvent.allCases.map({ $0.rawValue })
  }
  
  @objc
  override open func startObserving() {
    EventEmitter.shared.restore()
  }
  
  @objc
  override open func stopObserving() {
    EventEmitter.shared.suspend()
  }
  
  @objc
  override open func constantsToExport() -> [AnyHashable : Any]! {
    // should do it manually as ZoomSDKStatus is an NS_ENUM so
    //    a) it doesn't implements CaseIterable
    //    b) we couldn't define all cases then map to the dictionary
    //       as NS_ENUM's doesn't supports enum case name to string conversion
    let sdkStatuses = [
      // common statuses (status names are aligned with the web sdk)
      "NeverInitialized": ZoomSDKStatus.neverInitialized,
      "Initialized": ZoomSDKStatus.initialized,
      "NetworkIssues": ZoomSDKStatus.networkIssues,
      "InvalidDeviceLicenseKeyIdentifier": ZoomSDKStatus.invalidDeviceLicenseKeyIdentifier,
      "VersionDeprecated": ZoomSDKStatus.versionDeprecated,
      "DeviceNotSupported": ZoomSDKStatus.unknownError,
      "DeviceInLandscapeMode": ZoomSDKStatus.deviceInLandscapeMode,
      "DeviceInReversePortraitMode": ZoomSDKStatus.deviceInReversePortraitMode,
      "DeviceLockedOut": ZoomSDKStatus.deviceLockedOut,
      "LicenseExpiredOrInvalid": ZoomSDKStatus.licenseExpiredOrInvalid,
      // native-specific statuses
      "EncryptionKeyInvalid": ZoomSDKStatus.encryptionKeyInvalid,
      "OfflineSessionsExceeded": ZoomSDKStatus.offlineSessionsExceeded,
    ]
    
    let sessionStatuses = [
      // common statuses (status names are aligned with the web sdk)
      "SessionCompletedSuccessfully": ZoomSessionStatus.sessionCompletedSuccessfully,
      "MissingGuidanceImages": ZoomSessionStatus.missingGuidanceImages,
      "NonProductionModeNetworkRequired": ZoomSessionStatus.nonProductionModeNetworkRequired,
      "Timeout": ZoomSessionStatus.timeout,
      "ContextSwitch": ZoomSessionStatus.contextSwitch,
      "LandscapeModeNotAllowed": ZoomSessionStatus.landscapeModeNotAllowed,
      "ReversePortraitNotAllowed": ZoomSessionStatus.reversePortraitNotAllowed,
      "UserCancelled": ZoomSessionStatus.userCancelled,
      "UserCancelledViaClickableReadyScreenSubtext": ZoomSessionStatus.userCancelledViaClickableReadyScreenSubtext,
      "UserCancelledWhenAttemptingToGetCameraPermissions": ZoomSessionStatus.cameraPermissionDenied,
      "LockedOut": ZoomSessionStatus.lockedOut,
      "NonProductionModeLicenseInvalid": ZoomSessionStatus.nonProductionModeLicenseInvalid,
      "UnmanagedSessionVideoInitializationNotCompleted": ZoomSessionStatus.cameraInitializationIssue,
      "UnknownInternalError": ZoomSessionStatus.unknownInternalError,
      // native-specific statuses
      "SessionUnsuccessful": ZoomSessionStatus.sessionUnsuccessful,
      "LowMemory": ZoomSessionStatus.lowMemory,
      "GracePeriodExceeded": ZoomSessionStatus.gracePeriodExceeded,
      "EncryptionKeyInvalid": ZoomSessionStatus.encryptionKeyInvalid,
    ]
    
    let uxEvents = UXEvent.allCases.reduce(into: [String: UXEvent]()) {
      $0[String(describing: $1)] = $1
    }
    
    return [
      // returning .rawValue explicitly, due to the reason described above
      "ZoomUXEvent": uxEvents.mapValues({ $0.rawValue }),
      "ZoomSDKStatus": sdkStatuses.mapValues({ $0.rawValue }),
      "ZoomSessionStatus": sessionStatuses.mapValues({ $0.rawValue })
    ]
  }
  
  @objc(preload:rejecter:)
  open func preload(_ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) -> Void
  {
    Zoom.sdk.preload()
    resolve(nil)
  }
  
  @objc(initialize:preload:goodServerURL:zoomServerURL:resolver:rejecter:)
  open func initialize(_ licenseKey: String, preloadSDK: Bool, goodServerURL: String, zoomServerURL: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) -> Void
  {
    if ZoomSDKStatus.initialized == Zoom.sdk.getStatus() {
      resolve(nil)
      return
    }
    
    ZoomGlobalState.DeviceLicenseKeyIdentifier = licenseKey
    ZoomGlobalState.GoodServerURL = goodServerURL
    ZoomGlobalState.ZoomServerBaseURL = zoomServerURL
    
    Zoom.sdk.initialize(
      licenseKeyIdentifier: licenseKey,
      faceMapEncryptionKey: ZoomGlobalState.PublicFaceMapEncryptionKey,
      preloadZoomSDK: preloadSDK,
      completion: { initializationSuccessful in
        if initializationSuccessful {
          resolve(nil)
          return
        }
        
        let status = Zoom.sdk.getStatus()
        let message = ZoomSDKStatus.neverInitialized != status
          ? Zoom.sdk.description(for: status)
          : """
            Initialize wasn't attempted as Simulator has been detected. \
            FaceTec ZoomSDK could be ran on the real devices only
            """
        
        ZoomRCTUtils.rejectWith(message, status.rawValue, rejecter: reject)
    })
  }
  
  @objc(faceVerification:jwtAccessToken:resolver:rejecter:)
  open func faceVerification(
    _ enrollmentIdentifier: String, jwtAccessToken: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) -> Void
  {
    let presentedVC = RCTPresentedViewController()!
    let delegate = ZoomRCTPromiseProcessingDelegate(resolver: resolve, rejecter: reject)
    let processor = EnrollmentProcessor(fromVC: presentedVC, delegate: delegate)
    
    processor.enroll(enrollmentIdentifier, jwtAccessToken)
  }
  
  @objc(unload:rejecter:)
  open func unload(_ resolve: @escaping RCTPromiseResolveBlock,
   rejecter reject: @escaping RCTPromiseRejectBlock) -> Void
  {
    Zoom.sdk.unload()
    resolve(nil)
  }
}
