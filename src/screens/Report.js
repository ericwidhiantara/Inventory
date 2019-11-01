import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  Picker,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import moment from "moment";

import Icon from 'react-native-vector-icons/Ionicons';

import { FlatGrid } from 'react-native-super-grid';
import AsyncStorage from '@react-native-community/async-storage';
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import { StackActions, NavigationActions } from 'react-navigation';
import Modal from "react-native-modal";

const drawerMenu = [
  { menu: "Home", icon: 'md-home', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Home' },
  { menu: "About", icon: 'md-people', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'About' },
  { menu: "Log Out", icon: 'md-power', iconColor: '#f44336', iconBackground: '#FFFFFF', route: 'LogOut' },
]

class App extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoading: true,
      refreshing: false,
      serverAddress: this.props.navigation.state.params.serverAddress,
      serverPort: this.props.navigation.state.params.serverPort,
      serverFullAddress: this.props.navigation.state.params
        .serverFullAddress
    };
  }
  componentDidMount() {
    console.warn("ini servernya", this.state.serverAddress);
    this.getData();
  }
  getData = () => {
    this.setState({ isLoading: true }, () => {
      this.setState({ refreshing: true });
      const url = this.state.serverAddress + "/apiv2/pos-material";
      //this.setState({ loading: true });
      fetch(url)
        .then(response => response.json())
        .then(responseJson => {
          console.log("comp");
          console.log(responseJson);
          this.setState(
            {
              data: responseJson.values,
              error: responseJson.error || null,
              isLoading: false,
              refreshing: false
            },
            function() {
              this.arrayholder = responseJson.values;
            }
          );
        });
    });
  };

  renderDrawer = () => {
    return (
      <View style={{ flex: 1 }}>
        <FlatGrid
          style={{ flex: 1 }}
          itemDimension={300}
          items={drawerMenu}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.drawerMenuContainer,
                {
                  marginTop: 5,
                  marginLeft: 10,
                  backgroundColor: item.iconBackground
                }
              ]}
              onPress={() => this.drawerMenuNavigation(item.route)}
            >
              <View style={styles.drawerIconContainer}>
                <Icon name={item.icon} size={25} color={item.iconColor} />
              </View>
              <Text style={[styles.drawerText, { color: item.iconColor }]}>
                {item.menu}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };
  _onRefresh = () => {
    this.setState({ refreshing: true, search: "" });
    this.componentDidMount().then(() => {
      this.setState({ refreshing: false });
    });
  };
  drawerMenuNavigation = route => {
    this.drawer.closeDrawer();
    if (route == "LogOut") {
      this.alertLogOut();
    } else {
      this.props.navigation.navigate(route);
    }
  };

  alertLogOut = () => {
    Alert.alert(
      "Log Out",
      "Are you sure want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.warn("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => this.logOut() }
      ],
      { cancelable: false }
    );
  };

  logOut = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Login" })]
    });

    this.props.navigation.dispatch(resetAction);
  };
  render() {
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <Modal
            isVisible={true}
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
                  Loading Data
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
                  Loading ... please wait!
                </Text>
              </View>
            </View>
          </Modal>
        </View>
      );
    }
    const {
      MATERIAL_ID,
      SKU,
      BARCODE,
      NAME,
      CATEGORY_ID,
      SUB_CATEGORY_ID,
      DEFAULT_PRICE,
      LAST_UPDATE
    } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <DrawerLayout
          ref={drawer => {
            this.drawer = drawer;
          }}
          drawerWidth={250}
          drawerPosition={DrawerLayout.positions.Right}
          drawerType="front"
          drawerBackgroundColor="#FFF"
          renderNavigationView={this.renderDrawer}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={{
                height: 35,
                width: 35,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 15
              }}
              onPress={() => this.props.navigation.pop()}
            >
              <Icon name="md-arrow-back" size={35} color="#616161" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Image
                source={require("../../src/images/FINNS.jpeg")}
                style={{ width: 130, height: 130 }}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity
              style={{
                height: 35,
                width: 35,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 15
              }}
              onPress={() => this.drawer.openDrawer()}
            >
              <Icon name="md-menu" size={35} color="#00bcd4" />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              textAlign: "center",
              marginTop: 10,
              fontSize: 22,
              fontWeight: "bold"
            }}
          >
            MATERIAL REPORT
          </Text>

          <View
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
          >
            <FlatList
              data={this.state.data}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.componentDidMount.bind(this)}
                />
              }
              renderItem={({ item }) => (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#03A9F4",
                    borderRadius: 3,
                    padding: 10
                  }}
                >
                  <View style={styles.row}>
                    <Text style={{ color: "#616161" }}>
                      <Text style={{ fontWeight: "bold" }}>
                        INPUT DATE :{" "}
                      </Text>
                      {moment(item.UPDATE_DATE).format(
                        "dddd, MMMM Do YYYY, h:mm:ss a"
                      )}
                    </Text>
                    <Text style={{ color: "#616161" }}>
                      <Text style={{ fontWeight: "bold" }}>NAME : </Text>
                      {item.NAME}
                    </Text>
                    <Text style={{ color: "#616161" }}>
                      <Text style={{ fontWeight: "bold" }}>
                        LAST UPDATE DATE :{" "}
                      </Text>
                      {moment(item.LAST_UPDATE).format(
                        "dddd, MMMM Do YYYY, h:mm:ss a"
                      )}
                    </Text>
                  </View>
                </View>
              )}
              // keyExtractor ={({id}, index) => id}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </DrawerLayout>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  header: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#bdbdbd',
    borderBottomWidth: 1,
    flexDirection: 'row'
  },
  drawerMenuContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingVertical: 10
  },
  drawerMenuContainerActive: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10
  },
  drawerIconContainer: {
    width: 30,
    marginRight: 20
  },
  drawerText: {
    fontSize: 16
  },
  drawerTextActive: {
    fontSize: 16,
    color: "#FF5722"
  },
  gridView: {
    marginTop: 20,
    flex: 1,
  },
});
export default App;