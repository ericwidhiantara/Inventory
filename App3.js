import React from "react";
import { Root } from "native-base";
// import { StackNavigator, DrawerNavigator } from "react-navigation";
import { createDrawerNavigator, createStackNavigator, createAppContainer } from "react-navigation";

import Splash from "./src2/screens/Splash";
import Login from "./src2/screens/Login";
import SideBar from "./src2/screens/sidebar";
import Home from "./src2/screens/home";
import Stock from "./src2/screens/stock";
import DetailStock from "./src2/screens/stock/detailstock";
import AddStock from "./src2/screens/form/addstock";
import UpdateStock from "./src2/screens/form/updatestock";

const Drawer = createDrawerNavigator(
  {
    Stock: { screen: Stock },
    Home: { screen: Home }
  },
  {
    initialRouteName: "Home",
    contentOptions: {
      activeTintColor: "#e91e63"
    },
    contentComponent: props => <SideBar {...props} />
  }
);

const AppNavigator = createStackNavigator(
  {
    Drawer: { screen: Drawer },

    Login: { screen: Login },
    Splash: { screen: Splash},
    AddStock: {screen: AddStock},
    UpdateStock: { screen: UpdateStock},
    DetailStock: { screen: DetailStock}
  },
  {
    initialRouteName: "Splash",
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default () =>
  <Root>
    <AppContainer />
  </Root>;
