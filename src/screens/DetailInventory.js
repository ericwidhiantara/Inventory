import React, { Component } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  BackHandler,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import { FlatGrid } from "react-native-super-grid";
import AsyncStorage from "@react-native-community/async-storage";

import {
  Container,
  Header,
  Title,
  Content,
  Text,
  Button,
  Footer,
  FooterTab,
  Left,
  Right,
  Body,
  Fab,
  IconNB,
  View,
  List,
  ListItem,
  Thumbnail,
  Card,
  CardItem,
  Item,
  Label,
  ActionSheet
} from "native-base";
import Modal from "react-native-modal";
const drawerMenu = [
  {
    menu: "Home",
    icon: "md-home",
    iconColor: "#616161",
    iconBackground: "#FFFFFF",
    route: "Home"
  },
  {
    menu: "About",
    icon: "md-people",
    iconColor: "#616161",
    iconBackground: "#FFFFFF",
    route: "About"
  },
  {
    menu: "Log Out",
    icon: "md-power",
    iconColor: "#f44336",
    iconBackground: "#FFFFFF",
    route: "Login"
  }
];

var BUTTONS = [
  { text: "Update", icon: "md-add", iconColor: "#25de5b" },
  { text: "Delete", icon: "trash", iconColor: "#fa213b" },
  { text: "Cancel", icon: "close", iconColor: "#25de5b" }
];
var DESTRUCTIVE_INDEX = 1;
var CANCEL_INDEX = 2;

let serverAddress = "";
let serverPort = "";
let serverFullAddress = "";

type Props = {};
export default class DetailInventory extends Component<Props> {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      data: [],
      MATERIAL_ID: this.props.navigation.state.params.MATERIAL_ID,
      isLoading: "",
      refreshing: false,
      serverAddress: this.props.navigation.state.params.serverAddress,
      serverPort: this.props.navigation.state.params.serverPort,
      serverFullAddress: this.props.navigation.state.params.serverFullAddress
    };
  }
  getServerAddress = () => {
    AsyncStorage.getItem("serverAddress", (err, result) => {
      if (!err && result != null) {
        serverAddress = String(result);
        this.setState({
          serverAddress: serverAddress
        });
      }
    });

    AsyncStorage.getItem("serverPort", (err, result) => {
      if (!err && result != null) {
        serverPort = String(result);
        this.setState({
          serverPort: serverPort
        });
      }
    });

    if (serverPort === "") {
      serverFullAddress = this.state.serverAddress;
    } else {
      // serverFullAddress = String(this.state.serverAddress) + ':' + String(this.state.serverPort);
      serverFullAddress = "A";
    }

    this.setState({
      serverFullAddress: serverFullAddress
    });
  };
  componentDidMount() {
    this.getServerAddress();
    console.log(this.state.MATERIAL_ID);
    this.getData();
  }
  getData = () => {
    this.setState({ isLoading: true }, () => {
      this.setState({ refreshing: true });
      const url =
        this.state.serverAddress +
        "/apiv2/pos-material/" +
        this.state.MATERIAL_ID;
      //this.setState({ loading: true });
      fetch(url)
        .then(response => response.json())
        .then(responseJson => {
          console.log("comp");
          console.log(responseJson);
          this.setState({
            data: responseJson.values,
            error: responseJson.error || null,
            isLoading: false,
            refreshing: false
          });
          console.warn(this.state.data[0].MATERIAL_ID);
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

  drawerMenuNavigation = route => {
    this.drawer.closeDrawer();
    this.props.navigation.navigate(route, {
      serverAddress: this.state.serverAddress,
      serverPort: this.state.serverPort,
      serverFullAddress: this.state.serverFullAddress
    });
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <Modal
            isVisible={true}
            style={{
              justifyContent: "center",
              alignItems: "center"
            }}
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
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 20
                  }}
                >
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
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16
                  }}
                >
                  Loading ... please wait!
                </Text>
              </View>
            </View>
          </Modal>
        </View>
      );
    }
    return (
      <View style={styles.container}>
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
          <StatusBar backgroundColor="#EEEEEE" barStyle="dark-content" />

          <View style={styles.header}>
            <TouchableOpacity
              style={{
                height: 25,
                width: 25,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 15
              }}
              onPress={() => this.props.navigation.pop()}
            >
              <Icon name="md-arrow-back" size={25} color="#616161" />
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                alignItems: "center"
              }}
            >
              <Image
                source={require("../../src/images/FINNS.jpeg")}
                style={{
                  width: 130,
                  height: 130
                }}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity
              style={{
                height: 25,
                width: 25,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 15
              }}
              onPress={() => this.drawer.openDrawer()}
            >
              <Icon name="md-menu" size={25} color="#00bcd4" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Content padder>
              <List
                dataArray={this.state.data}
                renderRow={item => (
                  <ListItem>
                    <Body>
                      <Card>
                        <CardItem header bordered>
                          <Text>Item Details</Text>
                        </CardItem>
                        <CardItem header bordered>
                          <Body>
                            <Text>Item ID</Text>
                          </Body>
                          <Right>
                            <Text>{item.MATERIAL_ID}</Text>
                          </Right>
                        </CardItem>
                        <CardItem header bordered>
                          <Body>
                            <Text>SKU</Text>
                          </Body>
                          <Right>
                            <Text>{item.SKU}</Text>
                          </Right>
                        </CardItem>
                        <CardItem header bordered>
                          <Body>
                            <Text>Barcode</Text>
                          </Body>
                          <Right>
                            <Text>{item.BARCODE}</Text>
                          </Right>
                        </CardItem>
                        <CardItem header bordered>
                          <Body>
                            <Text>Item Name</Text>
                          </Body>
                          <Right>
                            <Text>{item.NAME}</Text>
                          </Right>
                        </CardItem>
                        <CardItem header bordered>
                          <Body>
                            <Text>Category</Text>
                          </Body>
                          <Right>
                            <Text>{item.CATEGORY_ID}</Text>
                          </Right>
                        </CardItem>
                        <CardItem header bordered>
                          <Body>
                            <Text>Sub Category</Text>
                          </Body>
                          <Right>
                            <Text>{item.SUB_CATEGORY_ID}</Text>
                          </Right>
                        </CardItem>
                        <CardItem header bordered>
                          <Body>
                            <Text>Price</Text>
                          </Body>
                          <Right>
                            <Text>Rp. {item.DEFAULT_PRICE}</Text>
                          </Right>
                        </CardItem>
                      </Card>
                    </Body>
                  </ListItem>
                )}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.componentDidMount.bind(this)}
                  />
                }
              />
              <Body>
                <Button
                  onPress={() =>
                    ActionSheet.show(
                      {
                        options: BUTTONS,
                        cancelButtonIndex: CANCEL_INDEX,
                        destructiveButtonIndex: DESTRUCTIVE_INDEX,
                        title: "Select an Options"
                      },
                      buttonIndex => {
                        if (buttonIndex === 0) {
                          this.props.navigation.navigate("UpdateInventory", {
                            MATERIAL_ID: this.state.data[0].MATERIAL_ID,
                            SKU: this.state.data[0].SKU,
                            BARCODE: this.state.data[0].BARCODE,
                            NAME: this.state.data[0].NAME,
                            MERK_ID: this.state.data[0].MERK_ID,
                            CATEGORY_ID: this.state.data[0].CATEGORY_ID,
                            SUB_CATEGORY_ID: this.state.data[0].SUB_CATEGORY_ID,
                            DEFAULT_PRICE: this.state.data[0].DEFAULT_PRICE,
                            serverAddress: this.state.serverAddress,
                            serverPort: this.state.serverPort,
                            serverFullAddress: this.state.serverFullAddress
                          });
                        } else if (buttonIndex === 1) {
                          Alert.alert(
                            "Delete Items",
                            "Are you sure to delete " +
                              this.state.data[0].NAME +
                              " ?",
                            [
                              {
                                text: "Cancel",
                                onPress: () => console.log("Cancel pressed"),
                                style: "cancel"
                              },
                              {
                                text: "OK",
                                onPress: () =>
                                  this.setState(
                                    {
                                      Loading: true
                                    },
                                    () => {
                                      fetch(
                                        this.state.serverAddress +
                                          "/apiv2/pos-material/delete/" +
                                          this.state.MATERIAL_ID,
                                        {
                                          method: "POST",
                                          headers: {
                                            Accept: "application/json",
                                            "Content-Type": "application/json"
                                          }
                                        }
                                      )
                                        .then(response => response.json())
                                        .then(responseJsonFromServer => {
                                          Alert.alert(
                                            responseJsonFromServer.message
                                          );
                                          this.props.navigation.navigate(
                                            "Inventory"
                                          );
                                        })
                                        .catch(error => {
                                          console.error(error);
                                          this.setState({
                                            Loading: false
                                          });
                                        });
                                    }
                                  )
                              }
                            ],
                            { cancelable: true }
                          );
                        }
                      }
                    )
                  }
                >
                  <Text>Options</Text>
                </Button>
              </Body>
            </Content>
          </View>
        </DrawerLayout>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#bdbdbd",
    borderBottomWidth: 1,
    flexDirection: "row"
  },
  button: {
    height: 80,
    borderRadius: 3,
    marginHorizontal: 10,
    flexDirection: "row",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#dddddd"
  },
  buttonImage: {
    height: 75,
    width: 80,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonText: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "bold"
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
  cardContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 3,
    borderColor: "#ddd",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    height: 70,
    backgroundColor: "#f44336",
    justifyContent: "center",
    alignItems: "center"
  },
  cardText: {
    fontSize: 22,
    marginLeft: 20,
    color: "#FFFFFF"
  },
  gridView: {
    marginTop: 20,
    paddingVertical: 25,
    flex: 1
  }
});
