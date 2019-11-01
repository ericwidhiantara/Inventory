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
  RefreshControl,
  FlatList
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import { FlatGrid } from "react-native-super-grid";
import Modal from "react-native-modal";
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
  Input
} from "native-base";

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
type Props = {};
export default class Inventory extends Component<Props> {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      active: false,
      data: [],
      isLoading: true,
      refreshing: false,
      serverAddress: this.props.navigation.state.params.serverAddress,
      serverPort: this.props.navigation.state.params.serverPort,
      serverFullAddress: this.props.navigation.state.params.serverFullAddress
    };
        this.arrayholder = [];
        this.componentDidMount();
  }

    _onRefresh = () => {
    this.setState({refreshing: true, search: ''});
    this.componentDidMount().then(() => {
      this.setState({refreshing: false});
    });
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
    //this.setState({ refreshing: true });
    this.getServerAddress();
    console.warn("ini servernya", this.state.serverAddress);
    this.getData();
  }
  getData = () => {
    this.setState({ isLoading: true, }, () => {
            this.setState({ refreshing: true });
      const url = this.state.serverAddress + "/apiv2/pos-material";
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
          },function(){
            this.arrayholder = responseJson.values;
          });
        });
    });
  };

  renderHeader =() => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Input
          style={{
            height: 40,
            width: 300,
            backgroundColor: "#FFFFFF",
            color: "#424242",
            marginTop: 10,
            paddingLeft: 10,
            elevation: 1,
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3
          }}
          onChangeText={text => this.SearchFilterFunction(text)}
          placeholder="Search"
          value={this.state.search}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#388e3c",
            height: 40,
            width: 40,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10,
            borderTopRightRadius: 3,
            borderBottomRightRadius: 3
          }}
        >
          <Icon name="md-search" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }
renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",  
          backgroundColor: "#CED0CE",  
        }}
      />
    );
  }


  search = text => {
    console.log(text);
  }
  clear = () => {
    this.search.clear();
  }

  SearchFilterFunction(text){
    const newData = this.arrayholder.filter(function(item){
      const itemData = item.NAME ? item.NAME.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    this.setState({
      data: newData,
      search: text,
    });
  };

  detail = MATERIAL_ID => {
    this.props.navigation.navigate("DetailInventory", {
      MATERIAL_ID: MATERIAL_ID,
      serverAddress: this.state.serverAddress,
      serverPort: this.state.serverPort,
      serverFullAddress: this.state.serverFullAddress
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
    this.props.navigation.navigate(route, {serverAddress: this.state.serverAddress,
                      serverPort: this.state.serverPort,
                      serverFullAddress: this.state.serverFullAddress});
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

          <View
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
          >
            <Content padder>
              <FlatList
                data={this.state.data}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.componentDidMount.bind(this)}
                  />
                }
                renderItem={({ item }) => (
                  <ListItem
                    thumbnail
                    onPress={this.detail.bind(
                      this,
                      item.MATERIAL_ID,
                      this.state.serverAddress,
                      this.state.serverPort,
                      this.state.serverFullAddress
                    )}
                  >
                    <Left />
                    <Body>
                      <Text>{item.BARCODE}</Text>
                      <Text numberOfLines={1} note>
                        {item.NAME}
                      </Text>
                    </Body>
                    <Right>
                      <Text>Rp. {item.DEFAULT_PRICE}</Text>
                    </Right>
                  </ListItem>
                )}
                // keyExtractor ={({id}, index) => id}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={this.renderSeparator}
                ListHeaderComponent={this.renderHeader}
              />
            </Content>
            <Fab
              active={this.state.active}
              direction="up"
              containerStyle={{}}
              style={{
                backgroundColor: "#5067FF"
              }}
              position="bottomLeft"
              onPress={() =>
                this.props.navigation.navigate("AddInventory", {
                  serverAddress: this.state.serverAddress,
                  serverPort: this.state.serverPort,
                  serverFullAddress: this.state.serverFullAddress
                })
              }
            >
              <IconNB name="md-add" />
            </Fab>
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
