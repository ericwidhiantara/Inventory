import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Image,
  Dimensions,
  StatusBar, 
  FlatList
} from "react-native";
import GridView from "react-native-super-grid";
import { FlatGrid } from "react-native-super-grid";
import Icon from "react-native-vector-icons/Ionicons";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";

items = [
  {
    restaurantName: 'Restaurant 1',
    cashierList: [
      {name: 'Cashier 1', activeStatus: false},
      {name: 'Cashier 2', activeStatus: false},
      {name: 'Cashier 3', activeStatus: false},
      {name: 'Cashier 4', activeStatus: false},
      {name: 'Cashier 5', activeStatus: false},
    ]
  },
  {
    restaurantName: 'Restaurant 2',
    cashierList: [
      { name: 'Cashier 1', activeStatus: false },
      { name: 'Cashier 2', activeStatus: false },
      { name: 'Cashier 3', activeStatus: false },
      { name: 'Cashier 4', activeStatus: false },
      { name: 'Cashier 5', activeStatus: false },
    ]
  },
]

type Props = {};
export default class App extends Component<Props> {
  static navigationOptions = {
    header: null
  };

  renderDrawer = () => {
    return (
      <View style={styles.drawerContainer}>
        <TouchableOpacity
          style={[styles.drawerMenuContainerActive, { marginTop: 10 }]}
          onPress={() => this.drawerMenuNavigation("Home")}
        >
          <View style={styles.drawerIconContainer}>
            <Icon name="md-home" size={25} color="#FF5722" />
          </View>
          <Text style={styles.drawerTextActive}>Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerMenuContainer}>
          <View style={styles.drawerIconContainer}>
            <Icon name="logo-usd" size={25} color="#616161" />
          </View>
          <Text style={styles.drawerText}>Balance Checker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerMenuContainer}>
          <View style={styles.drawerIconContainer}>
            <Icon name="ios-list-box" size={25} color="#616161" />
          </View>
          <Text style={styles.drawerText}>Stock Management</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerMenuContainer}>
          <View style={styles.drawerIconContainer}>
            <Icon name="ios-help-circle" size={25} color="#616161" />
          </View>
          <Text style={styles.drawerText}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerMenuContainer}>
          <View style={styles.drawerIconContainer}>
            <Icon name="md-settings" size={25} color="#616161" />
          </View>
          <Text style={styles.drawerText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerMenuContainer}>
          <View style={styles.drawerIconContainer}>
            <Icon name="md-information-circle" size={25} color="#616161" />
          </View>
          <Text style={styles.drawerText}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerMenuContainer}
          onPress={() => this.drawerMenuNavigation("Login")}
        >
          <View style={styles.drawerIconContainer}>
            <Icon name="ios-exit" size={25} color="#616161" />
          </View>
          <Text style={styles.drawerText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  drawerMenuNavigation = route => {
    this.drawer.closeDrawer();
    this.props.navigation.navigate(route);
  };
  _keyExtractor = (item, index) => String(index);

  renderCashier = (item) =>{
    for(let i = 0; i < item.cashierList.length; i++)
    {
      return (
        <View>
          <Text>Hello</Text>
        </View>
      );
    }
  }
  render() {
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
            >
              <Icon name="md-home" size={25} color="#616161" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Image
                source={require("../../src/images/prochain.jpg")}
                style={{ width: 100, height: 100 }}
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
              <Icon name="md-menu" size={25} color="#FF5722" />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 32,
              textAlign: "center",
              marginVertical: 10,
              color: "#f44336"
            }}
          >
            Shift
          </Text>
          
          <View style={styles.container}>
            <FlatList
              data={items}
              keyExtractor={this._keyExtractor}
              renderItem={({ item }) => 
                <View
                  style={{
                    height: 40,
                    width: 200,
                    borderWidth: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: 20,
                    backgroundColor: "#f2dfae"
                  }}
                >
                  <Text style={{ color: '#000' }}>{item.restaurantName}</Text>
                  
                </View>
                
                  

                }
            />
        
            
           

            
            

            <TouchableOpacity
              style={[
                styles.button,
                { marginHorizontal: 20, marginBottom: 10 }
              ]}
              onPress={() => this.props.navigation.navigate("Home")}
            >
              <View style={styles.buttonImage}>
                <Image
                  source={require("../../src/images/shiftIcon.png")}
                  style={{ width: 50, height: 50 }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}> Home </Text>
              </View>
            </TouchableOpacity>
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
    height: 50,
    borderRadius: 3,
    marginHorizontal: 10,
    flexDirection: "row",
    marginTop: 10
  },
  loginButton: {
    height: 50,
    borderRadius: 3,
    marginHorizontal: 10,
    flexDirection: "row",
    marginTop: 10
  },
  loginImage: {
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonImage: {
    height: 50,
    width: 50,
    backgroundColor: "#212121",
    justifyContent: "center",
    alignItems: "center"
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC107"
  },
  buttonLoginTextContainer: {
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
    paddingHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  drawerMenuContainerActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 20,
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
    paddingVertical: 25,
    flex: 1
  }
});
