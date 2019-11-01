import React, { Component } from "react";
import { View, StyleSheet, Image, Text, ImageBackground } from "react-native";

import { StackActions, NavigationActions } from 'react-navigation';

const resetAction = StackActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'SystemConfiguration' }),
  ],
});

class Splash extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.navigation.dispatch(resetAction);
    }, 3000);
  }
  static navigationOptions = {
    header: null
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.box1}>
          <Image source={require("../../src/images/FINNS.jpeg")} resizeMode={"contain"} style={{width: 200,}}/>
          
        </View>
        <ImageBackground
          source={require("../../src/images/bgSplash.jpg")}
          style={{
            width: 350,
            height: 250,
            justifyContent: "center"
            //alignItems: "center"
          }}
        >
          <View style={styles.box2}>
            <Text style={styles.textCash}>
              Cashless System {"\n"} for {"\n"}
              Event & Party
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.box3}>
          <Image style={{ width: 80, }} resizeMode={"contain"} source={require("../../src/images/dimatalogo.jpg")} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  box1: {
    //marginBottom: 60
  },
  box2: {
    //borderWidth: 1,
    //alignItems: "center",
    //justifyContent: "center",
    //marginBottom: 70
  },
  textCash: {
    color: "#fff",
    fontSize: 28,
    textAlign: "center",
    fontWeight: "bold"
  },
  box3: {
    marginTop: 30,
    alignItems: "center",
    paddingBottom: 10
  }
});
export default Splash;
