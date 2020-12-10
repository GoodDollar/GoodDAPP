/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <TSBackgroundFetch/TSBackgroundFetch.h>
#import <UserNotifications/UserNotifications.h>
#import <RNBranch/RNBranch.h>
#import <RNTorusDirectSdk/RNTorus.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"GoodDollar"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  [[TSBackgroundFetch sharedInstance] didFinishLaunching];
  
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Added for torus redirect to work (remove logs when done)
- (BOOL)application:(UIApplication *)app
           openURL:(NSURL *)url
           options:(NSDictionary<NSString *, id> *)options {

 NSString *myString = url.absoluteString;

 NSLog(@"String to handle : %@ ", myString);
 if (@available(iOS 11.0, *)) {
   [RNTorusDirectSdk handle:myString];
 } else {
   // Fallback on earlier versions
 }

 // Your additional URL handling (if any) goes here.
 return NO;
}

@end
