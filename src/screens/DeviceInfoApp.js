import React, { Component } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Alert
} from "react-native";
import DeviceInfo from "react-native-device-info";

type Props = {};
export default class DeviceInfoApp extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      deviceinfo: {},
      PDA_ID: '',
      PDA_SER_NUM: "",
      PDA_MAC_ADDR: "",
      PDA_MERK: "",
      PDA_TYPE: ""
    };
  }
   componentDidMount()  {
      fetch("http://api.dimatahanoman.com/apiv2/pos-cls-pda/store", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          PDA_ID: this.state.PDA_ID,
          PDA_SER_NUM: this.state.PDA_SER_NUM,
          PDA_MAC_ADDR: this.state.PDA_MAC_ADDR,
          PDA_MERK: this.state.PDA_MERK,
          PDA_TYPE: this.state.PDA_TYPE
        })
      })
        .then(response => response.json())
        .then(responseJsonFromServer => {
          Alert.alert("Warning", responseJsonFromServer.message);
        })
        .catch(error => {
          console.error(error);

          this.setState({
            loading_process: false
          });
        });
  };
  async componentWillMount() {
let currentdate = new Date();
let miliseconds = currentdate.getTime();
    const ios = Platform.OS === "ios";
    try {
      this.setState({
        PDA_ID: miliseconds,
        PDA_SER_NUM: ios ? -1 : DeviceInfo.getSerialNumber(),
        PDA_MAC_ADDR: await DeviceInfo.getMACAddress(),
        PDA_MERK: DeviceInfo.getBrand(),
        PDA_TYPE: DeviceInfo.getDeviceType()
      });
    } catch (e) {
      console.log("Trouble getting device info ", e);
    }

    
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.welcome}>
          react-native-device-info example - info:
        </Text>
        <ScrollView>
          <Text style={styles.instructions}>
            {this.state.PDA_ID} {"\n"}
            {this.state.PDA_SER_NUM} {"\n"}
            {this.state.PDA_MAC_ADDR} {"\n"}
            {this.state.PDA_MERK} {"\n"}
            {this.state.PDA_TYPE}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "left",
    color: "#333333",
    marginBottom: 5
  }
});
