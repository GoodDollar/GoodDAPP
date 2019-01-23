// @flow
import { extend } from "lodash";
import React, { Component } from "react";
import GoodWallet from "../../lib/wallet/GoodWallet";
import { View, Text, StyleSheet, Image } from "react-native";

import { createSwitchNavigator } from "@react-navigation/core";
import { Link } from "@react-navigation/web";

import Rewards from "./Rewards";
import BuySell from "./BuySell";
import Dashboard from "./Dashboard";
import Donate from "./Donate";

type AppNavigationState = {
  pubkey: string
};

type AppNavigationProps = {
  navigation: any
};

const AppNavigator = createSwitchNavigator(
  {
    Rewards,
    BuySell,
    Dashboard,
    Donate
  },
  {
    initialRouteName: "Dashboard"
  }
);

type TabButtonProps = {
  text: string,
  routeName: string
};
const TabButton = (props: TabButtonProps) => {
  return (
    <Link routeName={props.routeName}>
      <Image
        source="https://facebook.github.io/react-native/img/opengraph.png"
        style={styles.tabIcon}
      />
      <Text style={styles.tabView}>{props.text}</Text>
    </Link>
  );
};

class AppNavigation extends React.Component<
  AppNavigationProps,
  AppNavigationState
> {
  static router = AppNavigator.router;

  constructor(props: AppNavigationProps) {
    super(props);
    console.log(props);
  }

  render() {
    return (
      <React.Fragment>
        <View style={styles.tabView}>
          <TabButton routeName="Rewards" text="Rewards" />
          <TabButton routeName="BuySell" text="BuySell" />
          <TabButton routeName="Donate" text="Donate" />
          <TabButton routeName="Dashboard" text="Dashboard" />
        </View>
        <AppNavigator navigation={this.props.navigation} />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  tabButton: { color: "#d2d2d2", alignItems: "center", textAlign: "center" },
  tabView: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: "60px",
    backgroundColor: "#909090",
    color: "#d2d2d2"
  },
  tabIcon: { width: 40, height: 40 }
});
export default AppNavigation;
