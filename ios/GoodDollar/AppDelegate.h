/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
#import <UserNotifications/UNUserNotificationCenter.h>
#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <React/RCTRootView.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>


@property (nonatomic, strong) UIWindow *window;

- (UIViewController *) initializeRootViewController:(RCTBridge *)bridge;
- (UIWindow *) initializeWindow:(UIViewController *)rootViewController;
- (void) initializeAnalytics;
- (void) initializeBranch:(NSDictionary *)launchOptions;
- (void) initializeBackgroundFetch;
- (void) initializeNotifications;

@end
