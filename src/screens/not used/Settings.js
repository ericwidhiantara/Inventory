import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
  StatusBar,
  CheckBox,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator
} from "react-native";
import GridView from "react-native-super-grid";
import { FlatGrid } from "react-native-super-grid";
import Icon from "react-native-vector-icons/Ionicons";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import Display from 'react-native-display';
import AsyncStorage from '@react-native-community/async-storage';
import { bold } from "ansi-colors";
var moment = require('moment');
import * as RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import Modal from "react-native-modal";
import DeviceInfo from 'react-native-device-info';

const drawerMenu = [
  { menu: "Home", icon: 'md-home', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Home' },
  
  { menu: "Help", icon: 'md-help-circle', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Help' },
  { menu: "Settings", icon: 'md-settings', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Settings' },
  { menu: "About", icon: 'md-people', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'About' },
  { menu: "Log Out", icon: 'md-power', iconColor: '#f44336', iconBackground: '#FFFFFF', route: 'LogOut' },
]

let registrationData = []
let transactionData = []
let topUpData = []
let refundData = []

type Props = {};
export default class App extends Component<Props> {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      viewAccountDetails: false,
      
      viewRegistrationSettings: false,
      viewTopUpSettings: false,
      viewTransactionSettings: false,
      viewRefundSettings: false,
      viewServerConfiguration: false,

      viewSaveRegistrationDataToServer: false,
      viewSaveTopUpDataToServer: false,
      viewSaveTransactionDataToServer: false,
      viewSaveRefundDataToServer: false,

      saveDataToServerState: 'Contacting Server',
      isSaveDataToServerSuccess: false,

      macAddress: '',
      deviceinfo: {},

      saveRegistrationDataState: 'Contacting Server',
      saveRegistrationDataLoading: false,
      registrationDataSaved: false,
      registrationData: [
        { id: 0, message: 'hello 0', status: false },
        { id: 1, message: 'hello 1', status: false },
        { id: 2, message: 'hello 2', status: true },
        { id: 4, message: 'hello 3', status: false },
        { id: 5, message: 'hello 3', status: true },
        { id: 6, message: 'hello 3', status: false },
        { id: 7, message: 'hello 3', status: false },
        { id: 8, message: 'hello 3', status: false },
        { id: 9, message: 'hello 3', status: false },
      ],
      saveRegistrationDataFailed: false,

      saveTransactionDataState: 'Contacting Server',
      saveTransactionDataLoading: false,
      transactionDataSaved: false,
      transactionData: [],
      saveTransactionDataFailed: false,

      saveTopUpDataState: 'Contacting Server',
      saveTopUpDataLoading: false,
      topUpDataSaved: false,
      topUpData: [],
      saveTopUpDataFailed: false,

      saveRefundDataState: 'Contacting Server',
      saveRefundDataLoading: false,
      refundDataSaved: false,
      refundData: [],
      saveRefundDataFailed: false,

      saveDataState: 'Please Wait',
      
    }
    this.sendRegistrationDataToServer = this.sendRegistrationDataToServer.bind(this);
  }

  async componentWillMount() {
    let deviceJSON = {};
    const ios = Platform.OS === 'ios';
    try {
      deviceJSON.IPAddress = await DeviceInfo.getIPAddress();
      deviceJSON.MACAddress = await DeviceInfo.getMACAddress(); // needs android.permission.ACCESS_WIFI_STATE ?
    } catch (e) {
      console.log('Trouble getting device info ', e);
    }
    DeviceInfo.isPinOrFingerprintSet()(this.keyguardCallback);

    console.log('loaded info');

    deviceJSON.MACAddress = (JSON.stringify(deviceJSON.MACAddress, null, '\t')).replace(/['"]+/g, '');
    deviceJSON.IPAddress = (JSON.stringify(deviceJSON.IPAddress, null, '\t')).replace(/['"]+/g, '');
    this.setState({ deviceinfo: deviceJSON });
    this.forceUpdate();
    console.log( this.state.deviceinfo);
  }

  keyguardCallback = (pinSet) => {
    console.log('callback called with value: ' + pinSet);
    let deviceJSON = this.state.deviceinfo;
    deviceJSON.isPinOrFingerprintSet = pinSet;
    this.setState({ deviceinfo: deviceJSON });
    this.forceUpdate();
  };

  componentDidMount() {
    this.checkRegistration();
    this.checkTransaction();
    this.checkRefund();
    this.checkTopUp();

    this.autoIncrement();
    this.setState({});
  }

  checkRegistration = async () => {
    AsyncStorage.getItem('registeredUser', (err, result) => {
      if (!err && result != null) {
        registrationData = JSON.parse(result);
        this.setState({});
      }
    });
  }

  checkTransaction = async () => {
    AsyncStorage.getItem('shoppingTransaction', (err, result) => {
      if (!err && result != null) {
        transactionData = JSON.parse(result);
        this.setState({});
      }
    });
  }

  checkRefund = async () => {
    AsyncStorage.getItem('refundTransaction', (err, result) => {
      if (!err && result != null) {
        refundData = JSON.parse(result);
        this.setState({});
      }
    });
  }

  checkTopUp = async () => {
    AsyncStorage.getItem('topUpTransaction', (err, result) => {
      if (!err && result != null) {
        topUpData = JSON.parse(result);
        this.setState({});
      }
    });
  }

  exportRegistrationXLSX = (registrationData) => {
    let complete = '';
    let DateNow = String(moment().format("DD-MM-YY--HH-mm-ss"));
    complete = String('/Registration' + ' ' + DateNow + '.xlsx');

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(registrationData);
    XLSX.utils.book_append_sheet(wb, ws, "No Header");
    const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

    var path = RNFS.ExternalDirectoryPath + (complete);

    // write the file
    RNFS.writeFile(path, wbout, 'ascii')
      .then((r) => {/* :) */ }).catch((e) => {/* :( */ })
      .then((success) => {
        Alert.alert(
          'Success',
          path,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
        console.warn('FILE WRITTEN!');
        console.warn(path);
      })
      .catch((err) => {
        console.warn(err.message);
      });
  }

  exportTransactionXLSX = (transactionData) => {
    let complete = '';
    let DateNow = String(moment().format("DD-MM-YY--HH-mm-ss"));
    complete = String('/Transaction' + ' ' + DateNow + '.xlsx');

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(wb, ws, "No Header");
    const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

    var path = RNFS.ExternalDirectoryPath + (complete);

    // write the file
    RNFS.writeFile(path, wbout, 'ascii')
      .then((r) => {/* :) */ }).catch((e) => {/* :( */ })
      .then((success) => {
        Alert.alert(
          'Success',
          path,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
        console.warn('FILE WRITTEN!');
        console.warn(path);
      })
      .catch((err) => {
        console.warn(err.message);
      });
  }

  exportTopUpXLSX = (topUpData) => {
    let complete = '';
    let DateNow = String(moment().format("DD-MM-YY--HH-mm-ss"));
    complete = String('/TopUp' + ' ' + DateNow + '.xlsx');

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(topUpData);
    XLSX.utils.book_append_sheet(wb, ws, "No Header");
    const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

    var path = RNFS.ExternalDirectoryPath + (complete);

    // write the file
    RNFS.writeFile(path, wbout, 'ascii')
      .then((r) => {/* :) */ }).catch((e) => {/* :( */ })
      .then((success) => {
        Alert.alert(
          'Success',
          path,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
        console.warn('FILE WRITTEN!');
        console.warn(path);
      })
      .catch((err) => {
        console.warn(err.message);
      });
  }

  exportRefundXLSX = (refundData) => {
    let complete = '';
    let DateNow = String(moment().format("DD-MM-YY--HH-mm-ss"));
    complete = String('/Refund' + ' ' + DateNow + '.xlsx');

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(refundData);
    XLSX.utils.book_append_sheet(wb, ws, "No Header");
    const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

    var path = RNFS.ExternalDirectoryPath + (complete);

    // write the file
    RNFS.writeFile(path, wbout, 'ascii')
      .then((r) => {/* :) */ }).catch((e) => {/* :( */ })
      .then((success) => {
        Alert.alert(
          'Success',
          path,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
        console.warn('FILE WRITTEN!');
        console.warn(path);
      })
      .catch((err) => {
        console.warn(err.message);
      });
  }

  getDataFromAsyncStorage = () => {

  }

  autoIncrement = async () => {
    AsyncStorage.getItem('autoIncrement', (err, result) => {
      if (!err && result != null) {
        autoIncrement = result;
        this.setState({checked: result});
      }
    });
  }

  setAutoIncrement = async () => {
    AsyncStorage.setItem('autoIncrement', autoIncrement);
  }

  writeRegistrationJson = (json) => {
    let complete = '';
    let DateNow = String(moment().format("DD-MM-YY--HH-mm-ss"));
    complete = String('/Registration' + ' ' + DateNow + '.json');
    // console.warn(complete)

    //write path to external directory

    //make file name
    var path = RNFS.ExternalDirectoryPath + (complete);

    // write the file
    RNFS.writeFile(path, JSON.stringify(json), 'utf8')
      .then((success) => {
        Alert.alert(
          'Success',
           path,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
      })
      .catch((err) => {
        console.warn(err.message);
      });
  }

  writeTransactionJson = (json) => {
    let complete = '';
    let DateNow = String(moment().format("DD-MM-YY--HH-mm-ss"));
    complete = String('/Transaction' + ' ' + DateNow + '.json');
    // console.warn(complete)

    //write path to external directory

    //make file name
    var path = RNFS.ExternalDirectoryPath + (complete);

    // write the file
    RNFS.writeFile(path, JSON.stringify(json), 'utf8')
      .then((success) => {
        Alert.alert(
          'Success',
          path,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
      })
      .catch((err) => {
        console.warn(err.message);
      });
  }

  writeTopUpJson = (json) => {
    let complete = '';
    let DateNow = String(moment().format("DD-MM-YY--HH-mm-ss"));
    complete = String('/TopUp' + ' ' + DateNow + '.json');
    // console.warn(complete)

    //write path to external directory

    //make file name
    var path = RNFS.ExternalDirectoryPath + (complete);

    // write the file
    RNFS.writeFile(path, JSON.stringify(json), 'utf8')
      .then((success) => {
        Alert.alert(
          'Success',
          path,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
      })
      .catch((err) => {
        console.warn(err.message);
      });
  }

  writeRefundJson = (json) => {
    let complete = '';
    let DateNow = String(moment().format("DD-MM-YY--HH-mm-ss"));
    complete = String('/Refund' + ' ' + DateNow + '.json');
    // console.warn(complete)

    //write path to external directory

    //make file name
    var path = RNFS.ExternalDirectoryPath + (complete);

    // write the file
    RNFS.writeFile(path, JSON.stringify(json), 'utf8')
      .then((success) => {
        Alert.alert(
          'Success',
          path,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
      })
      .catch((err) => {
        console.warn(err.message);
      });
  }

  alertResetData = () => {
    Alert.alert(
      'Are You Sure Reset All Data?',
      'warning this is not reversible',
      [
        {
          text: 'Cancel',
          onPress: () => console.warn('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => this.resetData() },
      ],
      { cancelable: false },
    );
  }

  resetData = () => {
    //reset data method goes here

    Alert.alert(
      'Success',
      'All Data Resetted',
      [
        //isiin route ke event, trus room
        { text: 'OK', onPress: () => console.warn('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

  contactServerState = () => {
    let state1 = 'Contacting Server';
    let state2 = 'Syncing Data';
    let state3 = 'Done';
  }

  sendRegistrationDataToServer = async (data, max = 10) => {
    //inisialisasi persiapan connect dan lagi loading
    this.setState({ 
      viewSaveRegistrationDataToServer: true,
      saveRegistrationDataLoading: true,
      registrationDataSaved: false,
      saveRegistrationDataState: 'Contacting Server',
      saveDataState: 'Please Wait',
      saveRegistrationDataFailed: false,
    });
    //persiapan api ke server

    //inisialisasi persiapan connect dan lagi loading

    let promiseArray = [];

    // let max = 10
    let all = Object.keys(data).length

    let arrayIndex = [];

    if (max > all) {
      max = all;
    }

    this.setState({
      saveRegistrationDataState: 'Saving Data Please Wait',
    });

    console.warn('datalenght ' + Object.keys(data).length)

    for (let i = 0; i < max; i++) {
      if (data[i].status) {
        if (Object.keys(data).length > max) {
          max += 1
        }
      }
      else {
        arrayIndex.push(i);
        promiseArray.push(fetch('http://www.mocky.io/v2/5d00b0303200008400f9d6be', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: data[i].id,
            message: data[i].message,
          })
        }
        ))
      }
    }

    const values = await Promise.all(promiseArray)
    .then(values => {
      console.log(values);
      //kasi timeout aja, kalau udah timeout kasi tau error bilang mungkin urlnya salah atau server lagi penuh coba lagi 5 menit lagi
      console.warn(Object.keys(values).length);

      for (let i = 0; i < arrayIndex.length; i++) {
        if (values[i].status == "200") {
          data[arrayIndex[i]].status = true
        }
        else {
          data[arrayIndex[i]].status = false
        }
      }
      this.setState({
        viewSaveRegistrationDataToServer: true,
        saveRegistrationDataLoading: false,
        registrationDataSaved: true,
        saveRegistrationDataState: 'Done',
        dataPost: data,
        saveDataState: 'Success',
        saveRegistrationDataFailed: false,
      })
    })
    .catch(error => {
      console.warn(error);
      this.setState({
        viewSaveRegistrationDataToServer: true,
        saveRegistrationDataLoading: false,
        registrationDataSaved: false,
        saveRegistrationDataState: 'Please Check Connection / Server Address',
        saveDataState: 'Failed',
        saveRegistrationDataFailed: true,
      })
    });


    
    // .catch((err)=> {
    //   this.setState({
    //     viewSaveRegistrationDataToServer: true,
    //     saveRegistrationDataLoading: false,
    //     registrationDataSaved: false,
    //     saveRegistrationDataState: 'Done', 
    //     saveDataState: 'Failed',
    //     saveRegistrationDataFailed: true,
    //   })
    // })
    // console.log(values);
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
    const items = [
      { menu: "#30", image: require("../../src/images/beerIcon.jpg") },
      { menu: "#35", image: require("../../src/images/beer2Icon.jpg") },
      { menu: "#40", image: require("../../src/images/cocacolaIcon.png") },
      { menu: "#45", image: require("../../src/images/beerIcon.jpg") },
      { menu: "#50", image: require("../../src/images/beer2Icon.jpg") }
    ];
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

          <ScrollView style={{flex: 1}}>
            <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", justifyContent: 'center' }}>
              <Image source={require('../../src/images/FINNS.jpeg')} style={{ width: 230, height: 230 }} resizeMode='contain' />
            </TouchableOpacity>

            <View style={{marginTop: 20}}>
              <Text style={{marginHorizontal: 20, marginBottom:10, fontWeight: 'bold'}}>GENERAL</Text>
              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5}}
                onPress={() => { this.setState({ viewAccountDetails: true }) }}
              >
                  <View style={{width: 50}}>
                    <Icon name='md-person' size={25} color='#00bcd4' style={{marginRight: 20}} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>Account Details</Text>
                  </View>
                  <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
                <View
                  style={{
                    borderBottomColor: '#bdbdbd',
                    borderBottomWidth: 1,
                    marginHorizontal: 20,
                    marginVertical: 10
                  }}
                />
            </View>

            <Modal isVisible={this.state.viewAccountDetails} >
              <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 3 }}>
                <View style={{flex: 1}}>
                  <View style={{ backgroundColor: '#00bcd4', height: 50, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Account Details</Text>
                  </View>
                  <Icon name='md-person' style={{ textAlign: "center", marginVertical: 20 }} size={100} color='#00bcd4' />

                  <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", }}>Name</Text>
                  <Text style={{ textAlign: "center",}}>John Titor</Text>

                  <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", marginTop: 10}}>PDA ID</Text>
                  <Text style={{ textAlign: "center",}}>1</Text>

                  <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", marginTop: 10 }}>IP Address</Text>
                  <Text style={{ textAlign: "center", }}>{this.state.deviceinfo.IPAddress}</Text>

                  <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", marginTop: 10 }}>Mac Address</Text>
                  <Text style={{ textAlign: "center", }}>{this.state.deviceinfo.MACAddress}</Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: '#00bcd4', margin: 5, padding: 10, marginTop: 30 }}
                  onPress={() => { this.setState({ viewAccountDetails: false }) }}>
                  <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>OK</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            <View style={{ marginTop: 20 }}>
              <Text style={{ marginHorizontal: 20, marginBottom: 10, fontWeight: 'bold' }}>HISTORY</Text>
              
              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                  onPress={()=>this.props.navigation.navigate('RegistrationHistory')}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-person' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Registration</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", justifyContent: 'center', marginVertical: 5 }}
                onPress={() => this.props.navigation.navigate('TransactionHistory')}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-cart' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Transaction</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => this.props.navigation.navigate('TopUpHistory')}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-arrow-up' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Top Up</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => this.props.navigation.navigate('RefundHistory')}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-cash' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Refund</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <View style={{ marginTop: 20 }}>
                <Text style={{ marginHorizontal: 20, marginBottom: 10, fontWeight: 'bold' }}>Save Data to Server</Text>

                <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                  onPress={() => this.sendRegistrationDataToServer(this.state.registrationData)}
                >
                  <View style={{ width: 50 }}>
                    <Icon name='md-sync' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Save Registration Data</Text>
                  </View>
                  <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
                </TouchableOpacity>
                <View
                  style={{
                    borderBottomColor: '#bdbdbd',
                    borderBottomWidth: 1,
                    marginHorizontal: 20,
                    marginVertical: 10
                  }}
                />

                <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                  onPress={() => this.setState({ viewSaveRegistrationDataToServer: true})}
                >
                  <View style={{ width: 50 }}>
                    <Icon name='md-sync' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Save Transaction Data</Text>
                  </View>
                  <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
                </TouchableOpacity>
                <View
                  style={{
                    borderBottomColor: '#bdbdbd',
                    borderBottomWidth: 1,
                    marginHorizontal: 20,
                    marginVertical: 10
                  }}
                />

                <Modal isVisible={this.state.viewSaveRegistrationDataToServer} >
                  <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 3 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ backgroundColor: '#00bcd4', height: 50, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Save Registration Data</Text>
                      </View>
                      <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
                        <Display enable={this.state.registrationDataSaved}>
                          <Icon name='md-checkmark' style={{ textAlign: "center", marginVertical: 10 }} size={70} color='#4caf50' />
                        </Display>
                        <Display enable={this.state.saveRegistrationDataFailed}>
                          <Icon name='md-close-circle' style={{ textAlign: "center", marginVertical: 10 }} size={70} color='#f44336' />
                        </Display>
                        <ActivityIndicator size="large" color="#00bcd4" animating={this.state.saveRegistrationDataLoading}/>

                        <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", }}>{this.state.saveDataState}</Text>
                        <Text style={{ textAlign: "center", }}>{this.state.saveRegistrationDataState}</Text>
                      </View>
                    </View>
                    <Display enable={this.state.registrationDataSaved}>
                      <TouchableOpacity
                        style={{ backgroundColor: '#00bcd4', margin: 5, padding: 10, marginTop: 30 }}
                        onPress={() => this.setState({ viewSaveRegistrationDataToServer: false })}
                        >
                        <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>OK</Text>
                      </TouchableOpacity>
                    </Display>
                    <Display enable={this.state.saveRegistrationDataFailed}>
                      <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity
                          style={{ backgroundColor: '#00bcd4', margin: 10, padding: 10, marginTop: 30, flex:1 }}
                          onPress={() => this.sendRegistrationDataToServer(this.state.registrationData)}
                          >
                          <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Try Again</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ backgroundColor: '#00bcd4', margin: 10, padding: 10, marginTop: 30, flex: 1 }}
                          onPress={() => this.setState({ viewSaveRegistrationDataToServer: false })}
                        >
                          <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </Display>

                    
                  </View>
                </Modal>

                <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                >
                  <View style={{ width: 50 }}>
                    <Icon name='md-sync' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Save Top Up Data</Text>
                  </View>
                  <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
                </TouchableOpacity>
                <View
                  style={{
                    borderBottomColor: '#bdbdbd',
                    borderBottomWidth: 1,
                    marginHorizontal: 20,
                    marginVertical: 10
                  }}
                />

                <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                >
                  <View style={{ width: 50 }}>
                    <Icon name='md-sync' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Save Refund Data</Text>
                  </View>
                  <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
                </TouchableOpacity>
                <View
                  style={{
                    borderBottomColor: '#bdbdbd',
                    borderBottomWidth: 1,
                    marginHorizontal: 20,
                    marginVertical: 10
                  }}
                />
              </View>
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={{ marginHorizontal: 20, marginBottom: 10, fontWeight: 'bold' }}>Report</Text>
              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => this.props.navigation.navigate('RegistrationReport')}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Registration</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />
              
            </View>

            <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", justifyContent: 'center', marginVertical: 5 }}
              onPress={() => this.props.navigation.navigate('TransactionReport')}
            >
              <View style={{ width: 50 }}>
                <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Transaction</Text>
              </View>
              <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
            </TouchableOpacity>
            <View
              style={{
                borderBottomColor: '#bdbdbd',
                borderBottomWidth: 1,
                marginHorizontal: 20,
                marginVertical: 10
              }}
            />

            <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }} 
              onPress={() => this.props.navigation.navigate('TopUpReport')}
            >
              <View style={{ width: 50 }}>
                <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Top Up</Text>
              </View>
              <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
            </TouchableOpacity>
            <View
              style={{
                borderBottomColor: '#bdbdbd',
                borderBottomWidth: 1,
                marginHorizontal: 20,
                marginVertical: 10
              }}
            />

            <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
              onPress={() => this.props.navigation.navigate('RefundReport')}
            >
              <View style={{ width: 50 }}>
                <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Refund</Text>
              </View>
              <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
            </TouchableOpacity>
            <View
              style={{
                borderBottomColor: '#bdbdbd',
                borderBottomWidth: 1,
                marginHorizontal: 20,
                marginVertical: 10
              }}
            />

            <View style={{ marginTop: 20 }}>
              <Text style={{ marginHorizontal: 20, marginBottom: 10, fontWeight: 'bold' }}>Backup Data (Local Storage)</Text>
            <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => this.writeRegistrationJson(registrationData)}
            >
              <View style={{ width: 50 }}>
                <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Registration</Text>
              </View>
              <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
            </TouchableOpacity>
            <View
              style={{
                borderBottomColor: '#bdbdbd',
                borderBottomWidth: 1,
                marginHorizontal: 20,
                marginVertical: 10
              }}
            />

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", justifyContent: 'center', marginVertical: 5 }}
                onPress={() => this.writeTransactionJson(transactionData)}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Transaction</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => this.writeTopUpJson(topUpData)}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Top Up</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => this.writeRefundJson(refundData)}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Refund</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />
              
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={{ marginHorizontal: 20, marginBottom: 10, fontWeight: 'bold' }}>Export Data as XLSX (Local Storage)</Text>
              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => this.exportRegistrationXLSX(registrationData)}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Registration</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", justifyContent: 'center', marginVertical: 5 }}
                onPress={() => this.exportTransactionXLSX(transactionData)}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Transaction</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => this.exportTopUpXLSX(topUpData)}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Top Up</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => this.exportRefundXLSX(refundData)}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-list-box' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Refund</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={{ marginHorizontal: 20, marginBottom: 10, fontWeight: 'bold' }}>Dev Settings</Text>
              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => { this.setState({ viewServerConfiguration: true }) }}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-settings' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Server Configuration</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <Modal isVisible={this.state.viewServerConfiguration} >
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 3 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: '#00bcd4', height: 50, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Server Configuration</Text>
                    </View>
                    <Icon name='md-settings' style={{ textAlign: "center", marginVertical: 20 }} size={100} color='#00bcd4' />

                    <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", }}>Lorem Ipsum</Text>
                    <Text style={{ textAlign: "center", }}>Lorem Ipsum</Text>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: '#00bcd4', margin: 5, padding: 10, marginTop: 30 }}
                    onPress={() => { this.setState({ viewServerConfiguration: false }) }}>
                    <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>OK</Text>
                  </TouchableOpacity>
                </View>
              </Modal>

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => { this.setState({ viewRegistrationSettings: true }) }}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-settings' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Registration</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <Modal isVisible={this.state.viewRegistrationSettings} >
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 3 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: '#00bcd4', height: 50, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Registration Settings</Text>
                    </View>
                    <Icon name='md-settings' style={{ textAlign: "center", marginVertical: 20 }} size={100} color='#00bcd4' />

                    <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", }}>Lorem Ipsum</Text>
                    <Text style={{ textAlign: "center", }}>Lorem Ipsum</Text>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: '#00bcd4', margin: 5, padding: 10, marginTop: 30 }}
                    onPress={() => { this.setState({ viewRegistrationSettings: false }) }}>
                    <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>OK</Text>
                  </TouchableOpacity>
                </View>
              </Modal>

              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => { this.setState({ viewTopUpSettings: true }) }}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-settings' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Top Up</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <Modal isVisible={this.state.viewTopUpSettings} >
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 3 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: '#00bcd4', height: 50, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Top Up Settings</Text>
                    </View>
                    <Icon name='md-settings' style={{ textAlign: "center", marginVertical: 20 }} size={100} color='#00bcd4' />

                    <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", }}>Lorem Ipsum</Text>
                    <Text style={{ textAlign: "center", }}>Lorem Ipsum</Text>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: '#00bcd4', margin: 5, padding: 10, marginTop: 30 }}
                    onPress={() => { this.setState({ viewTopUpSettings: false }) }}>
                    <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>OK</Text>
                  </TouchableOpacity>
                </View>
              </Modal>


              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => { this.setState({ viewTransactionSettings: true }) }}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-settings' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Transaction</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />

              <Modal isVisible={this.state.viewTransactionSettings} >
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 3 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: '#00bcd4', height: 50, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Transaction Settings</Text>
                    </View>
                    <Icon name='md-settings' style={{ textAlign: "center", marginVertical: 20 }} size={100} color='#00bcd4' />

                    <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", }}>Lorem Ipsum</Text>
                    <Text style={{ textAlign: "center", }}>Lorem Ipsum</Text>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: '#00bcd4', margin: 5, padding: 10, marginTop: 30 }}
                    onPress={() => { this.setState({ viewTransactionSettings: false }) }}>
                    <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>OK</Text>
                  </TouchableOpacity>
                </View>
              </Modal>


              <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
                onPress={() => { this.setState({ viewRefundSettings: true }) }}
              >
                <View style={{ width: 50 }}>
                  <Icon name='md-settings' size={25} color='#00bcd4' style={{ marginRight: 20 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Refund</Text>
                </View>
                <Icon name='ios-arrow-forward' size={25} color='#bdbdbd' />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomColor: '#bdbdbd',
                  borderBottomWidth: 1,
                  marginHorizontal: 20,
                  marginVertical: 10
                }}
              />
            </View>

            <Modal isVisible={this.state.viewRefundSettings} >
              <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 3 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ backgroundColor: '#00bcd4', height: 50, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Refund Settings</Text>
                  </View>
                  <Icon name='md-settings' style={{ textAlign: "center", marginVertical: 20 }} size={100} color='#00bcd4' />

                  <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: "center", }}>Lorem Ipsum</Text>
                  <Text style={{ textAlign: "center", }}>Lorem Ipsum</Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: '#00bcd4', margin: 5, padding: 10, marginTop: 30 }}
                  onPress={() => { this.setState({ viewRefundSettings: false }) }}>
                  <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>OK</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            <TouchableOpacity style={{ flexDirection: "row", marginHorizontal: 20, alignItems: "center", marginVertical: 5 }}
              onPress={() => { this.alertResetData()}}
            >
              <View style={{ width: 50 }}>
                <Icon name='md-close-circle' size={25} color='#f44336' style={{ marginRight: 20 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#f44336' }}>Reset All Data</Text>
              </View>
            </TouchableOpacity>
            <View
              style={{
                borderBottomColor: '#bdbdbd',
                borderBottomWidth: 1,
                marginHorizontal: 20,
                marginVertical: 10
              }}
            />


              
          
          </ScrollView>

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
    height: 70,
    borderRadius: 3,
    marginHorizontal: 10,
    flexDirection: "row",
    marginTop: 10
  },
  buttonImage: {
    height: 70,
    width: 70,
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
