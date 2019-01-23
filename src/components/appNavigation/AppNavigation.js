// @flow
import { extend } from "lodash";
import React, { Component } from "react";
import GoodWallet from "../../lib/wallet/GoodWallet";
import { View, Text } from "react-native";

import { createSwitchNavigator } from "@react-navigation/core";
import { Link } from "@react-navigation/web";

import Rewards from "./Rewards"
import BuySell from "./BuySell"
import Dashboard from "./Dashboard"
import Donate from "./Donate"

type AppNavigationState = {
  pubkey: string,
  email?: string,
  phone?: string,
  name?: string,
  smsValidated?: boolean
};

const AppNavigator = createSwitchNavigator({
  Rewards,
  BuySell,
  Dashboard,
  Donate
}, {
  initialRouteName: "Dashboard"
});

class AppNavigation extends React.Component<
  { navigation: any },
  AppNavigationState
> {
  static router = AppNavigator.router;
  state = {
    pubkey: GoodWallet.account
  };
  constructor(props) {
    super(props);
    console.log(props);
  }

  //TODO: Change div and links for proper tabviews
  render() {
    return (
      <React.Fragment>
        <div>
          <Link routeName="Rewards">Rewards</Link>
          {" - "}
          <Link routeName="BuySell">BuySell</Link>
          {" - "}
          <Link routeName="Donate">Donate</Link>
          {" - "}
          <Link routeName="Dashboard">Dashboard</Link>
        </div>
        <AppNavigator navigation={this.props.navigation} />
      </React.Fragment>
    );
  }
}
export default AppNavigation;
