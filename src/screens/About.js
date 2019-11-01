import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  BackHandler
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import { FlatGrid } from 'react-native-super-grid';

const drawerMenu = [
  { menu: "Home", icon: 'md-home', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Home' },
  { menu: "About", icon: 'md-people', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'About' },
  { menu: "Log Out", icon: 'md-power', iconColor: '#f44336', iconBackground: '#FFFFFF', route: 'LogOut' },
]

let moduleEnable = [];

type Props = {};
export default class Home extends Component<Props> {
  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    // this.getModuleEnableData();
    // this.setState({});
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    this.backHandler.remove()
  }

  handleBackPress  = () => {
    Alert.alert(
      'Exit App',
      'Exiting the application?', [{
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel'
      }, {
        text: 'OK',
        onPress: () => BackHandler.exitApp()
      },], {
        cancelable: false
      }
    )
    return true;
  } 


  renderDrawer = () => {
    return (
      <View style={{flex: 1}}>
        <FlatGrid
          style={{flex: 1}}
          itemDimension={300}
          items={drawerMenu}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.drawerMenuContainer, { marginTop: 5, marginLeft: 10, backgroundColor: item.iconBackground }]}
              onPress={() => this.drawerMenuNavigation(item.route)}
            >
              <View style={styles.drawerIconContainer}>
                <Icon name={item.icon} size={25} color={item.iconColor} />
              </View>
              <Text style={[styles.drawerText, { color: item.iconColor}]}>{item.menu}</Text>
            </TouchableOpacity>
          )
          }
        />
      </View>
    );
  };

  drawerMenuNavigation = route => {
    this.drawer.closeDrawer();
    this.props.navigation.navigate(route);
  };


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
            <TouchableOpacity style={{ height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 15 }}
              onPress={() => this.props.navigation.pop()}
            >
              <Icon name='md-arrow-back' size={25} color='#616161' />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Image source={require('../../src/images/FINNS.jpeg')} style={{ width: 130, height: 130 }} resizeMode='contain' />
            </View>
            <TouchableOpacity style={{ height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 }} onPress={() => this.drawer.openDrawer()}>
              <Icon name='md-menu' size={25} color='#00bcd4' />
            </TouchableOpacity>
          </View>
          <Text>Still Under Construction^</Text>
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
    borderColor: '#dddddd'
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
    alignItems: "center",
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
