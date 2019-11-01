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

let shoppingTransaction;

const drawerMenu = [
  { menu: "Home", icon: 'md-home', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Home' },
  
  { menu: "Help", icon: 'md-help-circle', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Help' },
  { menu: "Settings", icon: 'md-settings', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Settings' },
  { menu: "About", icon: 'md-people', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'About' },
  { menu: "Log Out", icon: 'md-power', iconColor: '#f44336', iconBackground: '#FFFFFF', route: 'LogOut' },
]

const extractKey = ({ newRow }) => newRow;

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
    AsyncStorage.getItem('shoppingTransaction', (err, result) => {
      if (!err && result != null) {
        shoppingTransaction = JSON.parse(result);
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

  _keyExtractor = (item, index) => item.transactionId;

  renderItem = ({ item }) => {
    let allItems = [];
    if (item.items) {
      allItems = item.items.map(row => {
        return <View style={styles.row}>
          <Text style={{ color: '#616161' }}>ID : {row.material_id}, 
          
          Price : {row.price}, 
          
          Quantity: {row.quantity}</Text>
        </View>
      })
    }

    return (
      <View style={{ borderWidth:1, borderColor: '#03A9F4', borderRadius: 3, padding: 10 }}>
        <View style={styles.row}>
          <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Transaction Date : </Text> {item.transactionDate}</Text>
          <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Transaction ID : </Text> {item.transactionId}</Text>
          <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Customer Id : </Text> {item.customerId}</Text>          
          <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Total : </Text> {item.total}</Text>          
        </View>
        <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Shopping List :</Text> </Text>
        {allItems}
        <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Sync : </Text> {item.sync ? "Synchronized ✔" : "Not Yet Synchronized"}</Text>          
      </View>
    )
  }


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

        <Text style={{textAlign: "center", marginTop: 10, fontSize: 22, fontWeight: 'bold'}}>TRANSACTION HISTORY</Text>

          <FlatGrid
            keyExtractor={this._keyExtractor}
            itemDimension={300}
            items={shoppingTransaction}
            style={styles.gridView}
            renderItem={this.renderItem}
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