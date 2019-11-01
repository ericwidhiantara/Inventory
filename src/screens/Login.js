//import libraries
import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator
} from "react-native";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-community/async-storage";
import { StackActions, NavigationActions } from "react-navigation";

import { Toast } from "native-base";

let username = "";
let password = "";

let serverAddress = "";
let serverPort = "";
let serverFullAddress = "";
const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: "Home" })]
});

// create a component
class Login extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null,
      message: "",
      serverAddress: "",
      serverPort: "",
      serverFullAddress: "",
      modalVisible: false
    };
  }

  componentDidMount() {
    username = null;
    password = null;

    this.getServerAddress();
    this.getServerAddress();
    this.getUser();
  }

  saveData = () => {
    username = this.state.username;
    password = this.state.password;

    AsyncStorage.setItem("username", String(username));
    AsyncStorage.setItem("password", String(password));

    this.props.navigation.dispatch(resetAction);
  };

  getServerAddress = () => {
    AsyncStorage.getItem("serverAddress", (err, result) => {
      if (!err && result != null) {
        serverAddress = String(result);
        this.setState({ serverAddress: serverAddress });
      }
    });

    AsyncStorage.getItem("serverPort", (err, result) => {
      if (!err && result != null) {
        serverPort = String(result);
        this.setState({ serverPort: serverPort });
      }
    });

    if (serverPort === "") {
      serverFullAddress = this.state.serverAddress;
    } else {
      // serverFullAddress = String(this.state.serverAddress) + ':' + String(this.state.serverPort);
      serverFullAddress = "A";
    }

    this.setState({ serverFullAddress: serverFullAddress });
  };

  getUser = () => {
    AsyncStorage.getItem("username", (err, result) => {
      if (!err && result != null) {
        serverAddress = String(result);
        this.setState({ username: username });
      }
    });

    AsyncStorage.getItem("password", (err, result) => {
      if (!err && result != null) {
        serverPort = String(result);
        this.setState({ password: password });
      }
    });
  };
  validateLogin = () => {
    if (this.state.username == null || this.state.password == null) {
      if (this.state.username == null) {
        Toast.show({
          text: "Please input username!",
          textStyle: { color: "white" },
          buttonText: "Ok"
        });
      }
      else if (this.state.password == null) {
        Toast.show({
          text: "Please input password!",
          textStyle: { color: "white" },
          buttonText: "Ok"
        });
      } else {
        this.login();
      }
    } else {
      this.login();
    }
  };
  login = () => {
    this.setState({ modalVisible: true });
    fetch(this.state.serverAddress + "/apiv2/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        LOGIN_ID: this.state.username,
        PASSWORD: this.state.password
      })
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          modalVisible: false
        });
        console.warn(responseJson);
        if (responseJson.message === "Success!") {
          if (
            this.state.username === "user2" ||
            this.state.username === "User2"
          ) {
            this.props.navigation.navigate("OutletHome", {
              serverAddress: this.state.serverAddress,
              serverPort: this.state.serverPort,
              serverFullAddress: this.state.serverFullAddress
            });
          } else if (
            this.state.username === "admin" ||
            this.state.username === "Admin"
          ) {
            this.props.navigation.navigate("Home", {
              serverAddress: this.state.serverAddress,
              serverPort: this.state.serverPort,
              serverFullAddress: this.state.serverFullAddress
            });
          }
        }
       else if (responseJson.message === "Failed!") {
          if (
            this.state.username === "user2" ||
            this.state.username === "User2"
          ) {
            this.props.navigation.navigate("OutletHome", {
              serverAddress: this.state.serverAddress,
              serverPort: this.state.serverPort,
              serverFullAddress: this.state.serverFullAddress
            });
          } else if (
            this.state.username === "admin" ||
            this.state.username === "Admin"
          ) {
            this.props.navigation.navigate("Home", {
              serverAddress: this.state.serverAddress,
              serverPort: this.state.serverPort,
              serverFullAddress: this.state.serverFullAddress
            });
          }
        } else {
          Toast.show({
            text: "Wrong username or password!",
            textStyle: { color: "white" },
            buttonText: "Ok"
          });
        }
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.box1}>
          <Image
            source={require("../../src/images/FINNS.jpeg")}
            resizeMode={"contain"}
            style={{ width: 350 }}
          />
        </View>
        <View style={styles.box2}>
          <TextInput
            style={styles.textInput}
            placeholder="Username"
            returnKeyType={"next"}
            onSubmitEditing={() => {
              this.password.focus();
            }}
            onChangeText={username => this.setState({ username: username })}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            secureTextEntry={true}
            ref={input => {
              this.password = input;
            }}
            onChangeText={password => this.setState({ password: password })}
          />
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.buttonStyle}
            onPress={() => this.validateLogin()}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, paddingTop: 20 }}>
            <Modal
              isVisible={this.state.modalVisible}
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <View
                style={{
                  width: 200,
                  height: 200,
                  backgroundColor: "#FFFFFF"
                }}
              >
                <View
                  style={{
                    backgroundColor: "#212121",
                    height: 50,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 20 }}>
                    Login
                  </Text>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 20
                  }}
                >
                  <ActivityIndicator
                    size="large"
                    color="#00bcd4"
                    position="relative"
                  />
                  <Text style={{ textAlign: "center", fontSize: 16 }}>
                    Logging in ... please wait!
                  </Text>
                </View>
              </View>
            </Modal>
          </View>
          <Text style={{ marginTop: 20, color: "#f44336" }}>
            {this.state.message}
          </Text>
        </View>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  box1: {
    marginTop: 70,
    marginBottom: 60
  },
  box2: {
    marginLeft: 70,
    marginRight: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50
  },
  box3: {
    marginTop: 60,
    alignItems: "center",
    paddingBottom: 10
  },
  textInput: {
    width: 170,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 7,
    borderColor: "#00bcd4",
    marginTop: 10,
    paddingLeft: 10
  },
  buttonStyle: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00bcd4",
    marginTop: 20,
    marginBottom: 20,
    height: 40,
    width: 150,
    borderRadius: 7
  },
  buttonText: {
    fontSize: 20,
    color: "#fff"
  }
});

export default Login;
