//
//  RNBranch+AppDelegate.m
//  GoodDollar
//
//  Created by Nicolas Castellanos on 2/29/20.
//

#import <Foundation/Foundation.h>
#import "AppDelegate.h"
#import <RNBranch/RNBranch.h>
#import <RNTorusDirectSdk/RNTorus.h>

@implementation AppDelegate(AppDelegate)

// Add the openURL and continueUserActivity functions
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    if (![RNBranch.branch application:app openURL:url options:options]) {
      // do other deep link routing for the Facebook SDK, Pinterest SDK, etc

      // handle torus redirect: "gooddollar://org.gooddollar/redirect"
      if ([url.host isEqualToString:@"org.gooddollar"] && [url.path isEqualToString:@"/redirect"]){
        NSString *urlString = url.absoluteString;
       
        // minimal iOS version supported is now 12 so we don't need to check it
        [RNTorusDirectSdk handle:urlString];
      }
    }
    return YES;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler {
  // handler for Universal Links
  [RNBranch continueUserActivity:userActivity];
  return YES;
}

@end
