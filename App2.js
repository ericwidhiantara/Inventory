import React from 'react';
import { createStackNavigator, createAppContainer } from "react-navigation";
import Home from './src/screens/Home';

import About from './src/screens/About';
import Help from './src/screens/Help';


import Stock from "./src/screens/stock";
import DetailStock from "./src/screens/stock/detailstock";
import AddStock from "./src/screens/form/addstock";
import UpdateStock from "./src/screens/form/updatestock";
import Splash from './src/screens/Splash';

const AppNavigator = createStackNavigator(
  {
    Home: Home,
    Splash: Splash,
    About: About,
    Help: Help,

    Stock: Stock,
    DetailStock: DetailStock,
    AddStock: AddStock,
    UpdateStock: UpdateStock
  },
  {
    initialRouteName: "Home"
  }
);

export default createAppContainer(AppNavigator);
