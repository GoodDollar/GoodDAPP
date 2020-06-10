//
//  RCTEventEmitter.swift
//  ZoomVerificationNative
//
//  Created by Alex Serdukov on 5/22/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

class EventEmitter {
  // singletone instance
  public static let shared = EventEmitter()
  
  // private vars
  private static var rctEventEmitter: RCTEventEmitter!
  private var suspended = true
  private init() {}
  
  func register(withRCTEventEmitter: RCTEventEmitter) {
    EventEmitter.rctEventEmitter = withRCTEventEmitter
    restore()
  }
  
  func suspend() {
    suspended = true
  }
  
  func restore() {
    suspended = false
  }
  
  func dispatch(_ event: UXEvent, body: Any? = nil) {
    if suspended {
      return
    }
    
    EventEmitter.rctEventEmitter.sendEvent(withName: event.rawValue, body: body)
  }
}
