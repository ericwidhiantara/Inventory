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
const axios = require("axios");
import Icon from "react-native-vector-icons/Ionicons";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import { FlatGrid } from "react-native-super-grid";
import Modal from "react-native-modal";

import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Item,
  Label,
  Input,
  Body,
  Left,
  Right,
  Form,
  Text,
  View,
  Thumbnail,
  Picker
} from "native-base";
import ImagePicker from "react-native-image-picker";
import QRCodeScanner from "react-native-qrcode-scanner";
import AsyncStorage from "@react-native-community/async-storage";
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

let serverAddress = "";
let serverPort = "";
let serverFullAddress = "";

let SKU = "";
let currentdate = new Date();
let datetime =
  currentdate.getFullYear() +
  "0" +
  (currentdate.getMonth() + 1) +
  "" +
  currentdate.getDate() +
  "" +
  currentdate.getSeconds();
let MATERIAL_ID = datetime;
let updatetime =
  currentdate.getFullYear() +
  "-" +
  "0" +
  (currentdate.getMonth() + 1) +
  "-" +
  currentdate.getDate() +
  " " +
  currentdate.getHours() +
  ":" +
  currentdate.getMinutes() +
  ":" +
  currentdate.getSeconds();
let LAST_UPDATE = updatetime;
type Props = {};
export default class AddInventory extends Component<Props> {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      data: [],
      isLoading: true,
      isError: false,
      refreshing: false,
      SKU: "",
      BARCODE: "",
      NAME: "",
      CATEGORY_ID: "",
      DEFAULT_PRICE: "",
      MATERIAL_ID: MATERIAL_ID,
      LAST_UPDATE: LAST_UPDATE,
      hidePassword: true,
      ModalVisibleStatus: false,
      serverAddress: this.props.navigation.state.params.serverAddress,
      serverPort: this.props.navigation.state.params.serverPort,
      serverFullAddress: this.props.navigation.state.params.serverFullAddress
    };
  }
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
  componentDidMount() {
    this.getServerAddress();
    console.warn(this.state.MATERIAL_ID + 1);
    this.getCategory();
    this.getSubCategory();
  }

  getCategory = () => {
    axios
      .get(this.state.serverAddress + "/apiv2/pos-category")
      .then(response => {
        console.log(response.data);
        this.setState({
          categorydata: response.data.values,
          refreshing: false
        });
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  };
  getSubCategory = () => {
    axios
      .get(this.state.serverAddress + "/apiv2/pos-sub-category")
      .then(response => {
        console.log(response.data);
        this.setState({
          subcategorydata: response.data.values,
          refreshing: false,
          isLoading: false
        });
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  };

  ShowModalFunction(visible) {
    this.setState({
      ModalVisibleStatus: visible
    });
  }
  onSuccess(e) {
    this.setState({
      BARCODE: e.data
    });
    this.ShowModalFunction(!this.state.ModalVisibleStatus);
  }
  submitData = () => {
    this.setState({ loading_process: true }, () => {
      fetch(this.state.serverAddress + "/apiv2/pos-material/store", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          MATERIAL_ID: this.state.MATERIAL_ID,
          SKU: this.state.SKU,
          BARCODE: this.state.BARCODE,
          NAME: this.state.NAME,
          CATEGORY_ID: this.state.CATEGORY_ID,
          SUB_CATEGORY_ID: this.state.SUB_CATEGORY_ID,
          DEFAULT_PRICE: this.state.DEFAULT_PRICE,
          LAST_UPDATE: this.state.LAST_UPDATE
        })
      })
        .then(response => response.json())
        .then(responseJsonFromServer => {
          console.warn(responseJsonFromServer);
          Alert.alert(responseJsonFromServer.message);
          this.props.navigation.navigate("Inventory");
        })
        .catch(error => {
          console.error(error);

          this.setState({
            loading_process: false
          });
        });
    });
  };
  submitAllData = () => {
    this.submitData();
  };

  onValueChange(value: string) {
    this.setState({
      CATEGORY_ID: value
    });
  }
  onValueChange2(value: string) {
    this.setState({
      SUB_CATEGORY_ID: value
    });
  }
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

          <Content>
            <Body />
            <Form>
              <Item>
                <Label>Barcode </Label>
                <Input
                  keyboardType="numeric"
                  onChangeText={BARCODE => this.setState({ BARCODE })}
                  value={this.state.BARCODE}
                />
                <TouchableOpacity
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: "#00bcd4",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 5
                  }}
                  onPress={() => {
                    this.ShowModalFunction(true);
                  }}
                >
                  <Icon active name="md-qr-scanner" size={35} />
                </TouchableOpacity>
                <Modal
                  transparent={false}
                  animationType={"slide"}
                  visible={this.state.ModalVisibleStatus}
                  onRequestClose={() => {
                    this.ShowModalFunction(!this.state.ModalVisibleStatus);
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <View style={styles.ModalInsideView}>
                      <QRCodeScanner
                        onRead={this.onSuccess.bind(this)}
                        reactivate={true}
                        showMarker={true}
                      />
                      <Button
                        title="Click Here To Hide Modal"
                        onPress={() => {
                          this.ShowModalFunction(
                            !this.state.ModalVisibleStatus
                          );
                        }}
                      />
                    </View>
                  </View>
                </Modal>
              </Item>
              <Item floatingLabel>
                <Label>Name</Label>
                <Input onChangeText={NAME => this.setState({ NAME })} />
              </Item>
              <Item>
                <Label>Category</Label>
                <Picker
                  note
                  mode="dropdown"
                  style={{ width: 270 }}
                  selectedValue={this.state.CATEGORY_ID}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({ CATEGORY_ID: itemValue })
                  }
                >
                  {this.state.categorydata.map((item, key) => (
                    <Item
                      label={item.NAME}
                      value={item.CATEGORY_ID}
                      key={key}
                    />
                  ))}
                </Picker>
              </Item>
              <Item>
                <Label>Sub Category</Label>
                <Picker
                  note
                  mode="dropdown"
                  style={{ width: 270 }}
                  selectedValue={this.state.SUB_CATEGORY_ID}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({ SUB_CATEGORY_ID: itemValue })
                  }
                >
                  {this.state.subcategorydata.map((item, key) => (
                    <Item
                      label={item.NAME}
                      value={item.SUB_CATEGORY_ID}
                      key={key}
                    />
                  ))}
                </Picker>
              </Item>
              <Item floatingLabel>
                <Label>Price</Label>
                <Input
                  keyboardType="numeric"
                  onChangeText={DEFAULT_PRICE =>
                    this.setState({ DEFAULT_PRICE })
                  }
                />
              </Item>
            </Form>
            <Button
              block
              style={{
                margin: 15,
                marginTop: 50
              }}
              onPress={this.submitAllData}
            >
              <Text>Submit</Text>
            </Button>
          </Content>
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
