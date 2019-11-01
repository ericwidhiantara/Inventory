import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  Picker
} from 'react-native';
import NfcManager, { NdefParser, NfcTech,Ndef } from 'react-native-nfc-manager';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextMask } from 'react-native-masked-text'
import Display from 'react-native-display';
import { MaskService } from 'react-native-masked-text';
import { FlatGrid } from 'react-native-super-grid';
import AsyncStorage from '@react-native-community/async-storage';
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";

let pdaUniqueCode = 'AD'; // ini di dapat dari server disimpan di asyncstorage
let lastTopUpID = 1; // ini disimpan di asyncstorage

var refundTransaction = []

const drawerMenu = [
  { menu: "Home", icon: 'md-home', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Home' },
  
  { menu: "Help", icon: 'md-help-circle', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Help' },
  { menu: "Settings", icon: 'md-settings', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Settings' },
  { menu: "About", icon: 'md-people', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'About' },
  { menu: "Log Out", icon: 'md-power', iconColor: '#f44336', iconBackground: '#FFFFFF', route: 'LogOut' },
]

class App extends Component {
  static navigationOptions = {
    header: null
  }

  constructor(props) {
    super(props);
    this.state = {
      isWriting: false,
    }
  }

  componentDidMount() {
    this.checkTransaction();
    this.setState({});
  }

  checkTransaction = async () => {
    AsyncStorage.getItem('refundTransaction', (err, result) => {
      if (!err && result != null) {
        refundTransaction = JSON.parse(result);
        this.setState({});
      }
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
              style={[styles.drawerMenuContainer, { marginTop: 5, marginLeft: 10, backgroundColor: item.iconBackground }]}
              onPress={() => this.drawerMenuNavigation(item.route)}
            >
              <View style={styles.drawerIconContainer}>
                <Icon name={item.icon} size={25} color={item.iconColor} />
              </View>
              <Text style={[styles.drawerText, { color: item.iconColor }]}>{item.menu}</Text>
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
    let { supported, enabled, tag, text, parsedText, isTestRunning } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <DrawerLayout
          ref={drawer => {
            this.drawer = drawer;
          }}
          drawerWidth={250}
          drawerPosition={DrawerLayout.positions.Right}
          drawerType='front'
          drawerBackgroundColor="#FFF"
          renderNavigationView={this.renderDrawer}>

        <View style={styles.header}>
          <TouchableOpacity style={{ height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 15 }}
            onPress={() => this.props.navigation.pop()}
          >
            <Icon name='md-arrow-back' size={25} color='#616161' />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image source={require('../../src/images/FINNS.jpeg')} style={{ width: 100, height: 100 }} resizeMode='contain' />
          </View>
          <TouchableOpacity style={{ height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 }} onPress={() => this.drawer.openDrawer()}>
            <Icon name='md-menu' size={25} color='#FF5722' />
          </TouchableOpacity>
        </View>

        <Text style={{textAlign: "center", marginTop: 10, fontSize: 22, fontWeight: 'bold'}}>REFUND HISTORY</Text>

          <FlatGrid
            itemDimension={300}
            items={refundTransaction}
            style={styles.gridView}
            renderItem={({ item }) => (
              <View style={{ borderColor: '#03A9F4', borderWidth: 1, borderRadius: 3, padding: 10 }}>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Date Time : </Text>{item.RefundTime}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Refund Id : </Text>{item.RefundId}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Customer ID : </Text>{item.id}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Refund Amount : </Text>{item.refundAmount}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Sync : </Text>{item.sync ? "True" : "False"}</Text>
              </View>
              
              )}
          />

        </DrawerLayout>

      </View>
    )
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