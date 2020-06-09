//
//  RCTUtils.swift
//  ZoomVerificationNative
//
//  Created by Alex Serdukov on 5/13/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation
import ZoomAuthentication

class ZoomRCTPromiseProcessingDelegate: NSObject, ProcessingDelegate {
  private var resolver: RCTPromiseResolveBlock
  private var rejecter: RCTPromiseRejectBlock
  
  init(resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    self.resolver = resolver
    self.rejecter = rejecter
  }
  
  func onProcessingComplete(isSuccess: Bool, zoomSessionResult: ZoomSessionResult?, zoomSessionMessage: String?) {
    if isSuccess {
      resolver(zoomSessionMessage)
      return
    }
    
    let status = zoomSessionResult?.status
    
    if status == nil {
      onSessionTokenError()
      return
    }
    
    let message = zoomSessionMessage ?? Zoom.sdk.description(for: status!)
    
    ZoomRCTUtils.rejectWith(message, status!.rawValue, rejecter: rejecter)
  }
  
  func onSessionTokenError() {
    let message = "Session could not be started due to an unexpected issue during the network request."
    
    ZoomRCTUtils.rejectWith(message, ZoomSessionStatus.unknownInternalError.rawValue, rejecter: rejecter)
  }
}

class ZoomRCTUtils {
  static func rejectWith(_ message: String, _ code: Int, rejecter: RCTPromiseRejectBlock) -> Void {
    let exception = NSError(domain: message, code: code)
    
    rejecter(String(code), message, exception)
  }
}
