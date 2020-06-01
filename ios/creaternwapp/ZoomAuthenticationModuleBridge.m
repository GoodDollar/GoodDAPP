//
//  ZoomAuthenticationModuleBridge.m
//  ZoomVerificationNative
//
//  Created by Alex Serdukov on 4/27/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ZoomAuthentication, NSObject)

RCT_EXTERN_METHOD(
    preload:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    initialize:(NSString *)licenseKey
    preload:(BOOL)preload
    goodServerURL:(NSString *)goodServerURL
    zoomServerURL:(NSString *)zoomServerURL
    resolver: (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    faceVerification:(NSString *)enrollmentIdentifier
    jwtAccessToken:(NSString *)jwtAccessToken
    resolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    unload:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)

@end
