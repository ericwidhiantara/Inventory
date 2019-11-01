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
import Icon from 'react-native-vector-icons/Ionicons';
import { MaskService } from 'react-native-masked-text';
import { FlatGrid } from 'react-native-super-grid';
import AsyncStorage from '@react-native-community/async-storage';
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";

var registeredUser = []

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
    AsyncStorage.getItem('registeredUser', (err, result) => {
      if (!err && result != null) {
        registeredUser = JSON.parse(result);
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

        <Text style={{textAlign: "center", marginTop: 10, fontSize: 22, fontWeight: 'bold'}}>REGISTRATION HISTORY</Text>

          <FlatGrid
            itemDimension={300}
            items={registeredUser}
            style={styles.gridView}
            renderItem={({ item }) => (
              <View style={{ borderColor : '#03A9F4', borderWidth: 1, borderRadius: 3, padding: 10}}>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Date Time : </Text> {item.registrationTime}</Text>
                <Text style={{ color: '#616161' }}><Text style={{fontWeight: 'bold'}}>ID : </Text> {item.id}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Name :</Text> {item.name}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Company Code :</Text> {item.companyCode}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Event Code :</Text> {item.eventCode}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Valid Until :</Text> {item.validUntil}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Balance : </Text> 
                  {
                    MaskService.toMask('money', parseInt(item.balance), {
                      unit: 'Rp. ',
                      separator: ',',
                      delimiter: '.',
                      precision: 0,
                    })
                  } 
                </Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Tag Deposit :</Text> {item.tagDeposit}</Text>
                <Text style={{ color: '#616161' }}><Text style={{ fontWeight: 'bold' }}>Sync :</Text> {item.sync ? "Synchronized ✔" : "Not Yet Synchronized"}</Text>
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