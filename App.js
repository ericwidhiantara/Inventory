import React from 'react';
import { createStackNavigator, createAppContainer } from "react-navigation";
import { Root } from "native-base";


import About from './src/screens/About';
import Help from './src/screens/Help';

import Home from "./src/screens/Home";
import Inventory from "./src/screens/Inventory";
import DetailInventory from "./src/screens/DetailInventory";
import AddInventory from "./src/screens/AddInventory";
import UpdateInventory from "./src/screens/UpdateInventory";
import Report from "./src/screens/Report";

import OutletHome from "./src/screens/outlet/Home";
import OutletInventory from "./src/screens/outlet/Inventory";
import OutletDetailInventory from "./src/screens/outlet/DetailInventory";
import OutletUpdateInventory from "./src/screens/outlet/UpdateInventory";

import Login from "./src/screens/Login";
import Splash from "./src/screens/Splash";
import SystemConfiguration from "./src/screens/SystemConfiguration";
import DeviceInfoApp from "./src/screens/DeviceInfoApp";

const AppNavigator = createStackNavigator(
  {
    Splash: Splash,
    SystemConfiguration: SystemConfiguration,
    Login: Login,

    Home: Home,
    OutletHome: OutletHome,
    About: About,
    Help: Help,
    DeviceInfo: DeviceInfoApp,

    Inventory: Inventory,
    DetailInventory: DetailInventory,
    AddInventory: AddInventory,
    UpdateInventory: UpdateInventory,
    Report: Report,

    OutletInventory: OutletInventory,
    OutletDetailInventory: OutletDetailInventory,
    OutletUpdateInventory: OutletUpdateInventory
  },
  {
    initialRouteName: "Splash",
    headerMode: null
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default () => (
  <Root>
    <AppContainer />
  </Root>
);
