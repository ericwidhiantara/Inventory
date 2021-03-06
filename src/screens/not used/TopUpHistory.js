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

const drawerMenu = [
  { menu: "Home", icon: 'md-home', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Home' },
  
  { menu: "Help", icon: 'md-help-circle', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Help' },
  { menu: "Settings", icon: 'md-settings', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Settings' },
  { menu: "About", icon: 'md-people', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'About' },
  { menu: "Log Out", icon: 'md-power', iconColor: '#f44336', iconBackground: '#FFFFFF', route: 'LogOut' },
]

var topUpTransaction = [
] // ini disimpan di asyncstorage

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
    AsyncStorage.getItem('topUpTransaction', (err, result) => {
      if (!err && result != null) {
        topUpTransaction = JSON.parse(result);
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
            <Image source={require('../../src/images/FINNS.jpeg')} style={{ width: 130, height: 130 }} resizeMode='contain' />
          </View>
          <TouchableOpacity style={{ height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 }} onPress={() => this.drawer.openDrawer()}>
              <Icon name='md-menu' size={25} color='#00bcd4' />
          </TouchableOpacity>
        </View>

        <Text style={{textAlign: "center", marginTop: 10, fontSize: 22, fontWeight: 'bold'}}>TOP UP HISTORY</Text>

          <FlatGrid
            itemDimension={300}
            items={topUpTransaction}
            style={styles.gridView}
            renderItem={({ item }) => (
              <View style={{ borderColor: '#03A9F4', borderWidth: 1, borderRadius: 3, padding: 10}}>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Date Time : </Text>{item.topUpTime}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Top Up Id : </Text>{item.topUpId}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Customer ID : </Text>{item.id}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Top Up Amount : </Text>{item.topUpAmount}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Top Up Method : </Text>{item.topUpMethod}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Sync : </Text>{item.sync ? "Synchronized ✔" : "Not Yet Synchronized"} </Text>
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