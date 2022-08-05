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
#import <CodePush/CodePush.h>
#import "RNNotifications.h"


#ifdef FB_SONARKIT_ENABLED

#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  #ifdef FB_SONARKIT_ENABLED
  [self initializeFlipper:application];
  #endif

  [self initializeAnalytics];
  [self initializeBranch:launchOptions];

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  UIViewController *rootViewController = [self initializeRootViewController:bridge];

  self.window = [self initializeWindow:rootViewController];

  [self initializeBackgroundFetch];
  [self initializeNotifications];
  [RNNotifications startMonitorNotifications];

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [CodePush bundleURL];
#endif
}

- (UIViewController *) initializeRootViewController:(RCTBridge *)bridge
{
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"GoodDollar" initialProperties:nil];
  UIViewController *rootViewController = [UIViewController new];

  rootView.backgroundColor = [UIColor whiteColor]; // we do not support dark theme
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

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [RNBranch application:app openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  return [RNBranch continueUserActivity:userActivity];
}

#ifdef FB_SONARKIT_ENABLED

- (void) initializeFlipper:(UIApplication *)application
{
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];

  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];

  [client start];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [RNNotifications didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [RNNotifications didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler {
  [RNNotifications didReceiveBackgroundNotification:userInfo withCompletionHandler:completionHandler];
}

#endif

@end
