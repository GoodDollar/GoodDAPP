//
//  RNBranch+AppDelegate.m
//  GoodDollar
//
//  Created by Nicolas Castellanos on 2/29/20.
//

#import <Foundation/Foundation.h>
#import "AppDelegate.h"
#import <RNBranch/RNBranch.h>

@implementation AppDelegate(AppDelegate)

// Add the openURL and continueUserActivity functions
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    if (![RNBranch.branch application:app openURL:url options:options]) {
        // do other deep link routing for the Facebook SDK, Pinterest SDK, etc
    }
    return YES;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *restorableObjects))restorationHandler {
    return [RNBranch continueUserActivity:userActivity];
}

@end
