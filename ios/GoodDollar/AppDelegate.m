/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Delegate definition
#import "AppDelegate.h"

// React imports
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

// React native plugins / services
#import <TSBackgroundFetch/TSBackgroundFetch.h>
#import <UserNotifications/UserNotifications.h>
#import <RNBranch/RNBranch.h>
#import <Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [self initializeAnalytics];
  [self initializeBranch:launchOptions];
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  UIViewController *rootViewController = [self initializeRootViewController:bridge];

  self.window = [self initializeWindow:rootViewController];

  [self initializeBackgroundFetch];
  [self initializeNotifications];
  
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

- (UIViewController *) initializeRootViewController:(RCTBridge *)bridge
{
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"GoodDollar" initialProperties:nil];
  UIViewController *rootViewController = [UIViewController new];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  rootViewController.view = rootView;
  
  return rootViewController;
}

- (UIWindow *) initializeWindow:(UIViewController *)rootViewController
{
  UIWindow *window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  
  window.rootViewController = rootViewController;
  [window makeKeyAndVisible];

  return window;
}


- (void) initializeAnalytics
{
  if ([FIRApp defaultApp] != nil) {
    return;
  }

  [FIRApp configure];
}

- (void) initializeBranch:(NSDictionary *)launchOptions
{
  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
}

- (void) initializeBackgroundFetch
{
  [[TSBackgroundFetch sharedInstance] didFinishLaunching];
}

- (void) initializeNotifications
{
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  
  center.delegate = self;
}

@end
