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
import Modal from "react-native-modal";

topUpAmount = [
  { name: '1K', amount: 1000 },
  { name: '2K', amount: 2000 },
  { name: '5K', amount: 5000 },
  { name: '10K', amount: 10000 },
  { name: '20K', amount: 20000 },
  { name: '50K', amount: 50000 },
  { name: '100K', amount: 100000 },
  { name: '200K', amount: 200000 },
  { name: '500K', amount: 500000 },
]

const drawerMenu = [
  { menu: "Home", icon: 'md-home', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Home' },
  
  { menu: "Help", icon: 'md-help-circle', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Help' },
  { menu: "Settings", icon: 'md-settings', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Settings' },
  { menu: "About", icon: 'md-people', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'About' },
  { menu: "Log Out", icon: 'md-power', iconColor: '#f44336', iconBackground: '#FFFFFF', route: 'LogOut' },
]

let pdaUniqueCode = 'AD'; // ini di dapat dari server disimpan di asyncstorage
let actionCode = 'TU';
let lastTopUpID = 1; // ini disimpan di asyncstorage

var topUpTransaction = []



function strToBytes(str) {
  let result = [];
  for (let i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i));
  }
  return result;
}

function buildTextPayload(valueToWrite) {
  const textBytes = strToBytes(valueToWrite);
  // in this example. we always use `en`
  const headerBytes = [0xD1, 0x01, (textBytes.length + 3), 0x54, 0x02, 0x65, 0x6e];
  return [...headerBytes, ...textBytes];
}

class App extends Component {
  static navigationOptions = {
    header: null
  }

  topUpManagement = (amount, action) => {
    let finalAmount = 0;
    
    if (isNaN(parseInt(this.state.topUpAmount, 10))) {
      finalAmount = 0;
    }
    else {
      finalAmount = parseInt(this.state.topUpAmount, 10);
    }

    if (action == '+') {
      finalAmount = finalAmount + amount;
    }
    else {
      finalAmount = finalAmount - amount;
    }

    finalAmount = Math.max(0, finalAmount) || 0;

    finalAmount = String(finalAmount);
    this.setState({ topUpAmount: finalAmount })
  }

  constructor(props) {
    super(props);
    this.state = {
      supported: false,
      enabled: false,
      isTestRunning: false,
      text: 'hi, nfc!',
      parsedText: null,
      tag: null,

      id: '',
      name: '',
      companyCode: '',
      eventCode: '',
      validUntil: '',
      publicKey: '',
      lastTopUp: '',
      balance: '0',
      topUpMethod: 'CASH',
      tagDeposit: '0',
      eventCode: '',

      totalBalance: '0',

      topUpAmount: '0',

      data: '',

      minBalanceChecker: false,
      minTransactionChecker: false,
      isTopUp: false,

      minimumBalance: 60000,
      availableBalance: '',

      checked: false,
      topUpView: false,
      topUpMethodView: false,
      topUpAction: '+',
      isWriting: false,

      isReadTag: false,
      isWritingToTag: false,
      isWritingToTagSucess: false,
      isWrittingFailed: false,
      tagId: 'HELLO',
    }
  }

  componentDidMount() {
    NfcManager.isSupported()
      .then(supported => {
        this.setState({ supported });
        if (supported) {
          this._startNfc();
        }
      })
    
    this.pdaUniqueCodeCheck();
    this.lastTopUpIdCheck();
    this.checkTransaction();
    this.setState({});
    this.startReadTag();
  }

  startReadTag() {
    let tag = null;
    NfcManager.start()
      .then(() => NfcManager.isEnabled())
      .then(() => NfcManager.closeTechnology())
      .then(() => NfcManager.unregisterTagEvent())
      .then(() => NfcManager.registerTagEvent(tag)
        .then(() => this.setState({ isReadTag: true }))
        .then(() => NfcManager.requestTechnology(NfcTech.Ndef))
        .then(() => NfcManager.getTag())
        .then(tag => {
          console.warn(JSON.stringify(tag));
        })
        .then(() => NfcManager.getNdefMessage())
        .then(tag => {
          this.parseText(tag);
        })
      )
      .then(() => this.setState({ isReadTag: false }))
      .catch(err => {
        console.warn(err);
        this.setState({ isReadTag: false })
      });
  }

    parseText = (tag) => {
      if (tag.ndefMessage) {
        // console.warn(String(JSON.stringify(tag.id)))
        this.setState({
          id: NdefParser.parseText(tag.ndefMessage[0]),
          data: NdefParser.parseText(tag.ndefMessage[1]),
        }, this._parseData
        )
      }
    }

  

  componentWillUnmount() {
    if (this._stateChangedSubscription) {
      this._stateChangedSubscription.remove();
    }
  }

  checkTransaction = async () => {
    AsyncStorage.getItem('topUpTransaction', (err, result) => {
      if (!err && result != null) {
        topUpTransaction = JSON.parse(result);
        this.setState({});
      }
    });
  }

  pdaUniqueCodeCheck = async () => {
    AsyncStorage.getItem('pdaUniqueCode', (err, result) => {
      if (!err && result != null) {
        pdaUniqueCode = result;
        this.setState({});
      }
    });
  }

  lastTopUpIdCheck = async () => {
    AsyncStorage.getItem('lastTopUpID', (err, result) => {
      if (!err && result != null) {
        lastTopUpID = parseInt(result, 10);
        this.setState({});
      }
    });
  }

  saveTopUpData = () => {
    let topUpId = 0;
    lastTopUpID++;
    topUpId = String(pdaUniqueCode) + actionCode + String(lastTopUpID);

    let id = this.state.id;
    let topUpAmount = this.state.topUpAmount;
    let topUpMethod = this.state.topUpMethod;

    let currentdate = new Date();
    let datetime = currentdate.getDate() + "/"
      + (currentdate.getMonth() + 1) + "/"
      + currentdate.getFullYear() + " "
      + currentdate.getHours() + ":"
      + currentdate.getMinutes() + ":"
      + currentdate.getSeconds();

    let topUpTime = datetime;

    let sync = false;

    topUpTransaction.push({ topUpId: topUpId, id: id, topUpAmount: topUpAmount, topUpMethod: topUpMethod, topUpTime: topUpTime, sync: sync });

    AsyncStorage.setItem('topUpTransaction', JSON.stringify(topUpTransaction));
    AsyncStorage.setItem('lastTopUpID', String(lastTopUpID));
    this.setState({});
  }

  writeToTag = () => {

    this.convertData();

    let bytes = Ndef.encodeMessage([
      Ndef.textRecord(this.state.id),
      Ndef.textRecord(data),
    ]);

    NfcManager.start()
      .then(() => NfcManager.isEnabled())
      .then(() => NfcManager.closeTechnology())
      .then(() => NfcManager.unregisterTagEvent())
      .then(() => NfcManager.registerTagEvent())
      .then(() => this.setState({ isWritingToTag: true, isWrittingFailed: false }))
      .then(() => NfcManager.requestNdefWrite(bytes)
        .then(() => this.setState({
          isWritingToTag: false,
          isWritingToTagSucess: true,
          topUpView: false,
          isWrittingFailed: false,
          topUpAmount: '0'
        }, this.saveRegistrationData))
        .catch(err => {
          console.warn(err);
          this.setState({ isWritingToTag: false, isWrittingFailed: true })
        })
      )
      .catch(err => {
        console.warn(err);
        this.setState({ isWritingToTag: false, topUpView: false, isWrittingFailed: true })
      });
  }

  cancelWriteToTag = () => {
    NfcManager.start()
      .then(() => NfcManager.isEnabled())
      .then(() => NfcManager.cancelNdefWrite())
      .then(() => NfcManager.closeTechnology())
      .then(() => NfcManager.unregisterTagEvent())
      .catch(err => {
        console.warn(err);
        this.setState({ isWritingToTag: false, isWrittingFailed: false })
      });
  }

  renderTopUpMethod = (item) => {
    if (item.name == this.state.topUpMethod) {
      return (
        <TouchableOpacity style={{ backgroundColor: '#2196f3', marginHorizontal: 10, paddingVertical: 10, borderRadius: 3, alignItems: 'center' }}
          onPress={() => this.setState({ topUpMethod: item.name, topUpMethodView: false })}
        >
          <Text style={{ color: '#FFFFFF' }}>{item.name}</Text>
        </TouchableOpacity>
      );
    }

    else {
      return (
        <TouchableOpacity style={{ borderWidth: 1, borderColor: '#2196f3', marginHorizontal: 10, paddingVertical: 10, borderRadius: 3, alignItems: 'center' }}
          onPress={() => this.setState({ topUpMethod: item.name, topUpMethodView: false })}
        >
          <Text style={{ color: '#424242' }}>{item.name}</Text>
        </TouchableOpacity>
      );
    }
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

  cancelReadTag() {
    NfcManager.start()
      .then(() => NfcManager.isEnabled())
      .then(() => NfcManager.closeTechnology())
      .then(() => NfcManager.unregisterTagEvent())
      .then(() => NfcManager.registerTagEvent())
      .then(() => this.setState({ isReadTag: false }, this.props.navigation.pop))
      .catch(err => {
        console.warn(err);
        this.setState({ isReadTag: false })
      })
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

        <View style={{ paddingHorizontal: 20, flex: 1 }}>
            <Text style={{ textAlign: "center", fontSize: 18, marginTop: 5}}>{this.state.name}</Text>
            <Text style={{ textAlign: "center", fontSize: 18 }}>Total Balance</Text>
            <Text style={{ textAlign: "center", fontSize: 32, color: '#424242', fontWeight: 'bold' }}>
            {
                MaskService.toMask('money', parseInt(parseInt(this.state.balance, 10) - parseInt(this.state.tagDeposit, 10)), {
                    unit: 'Rp. ',
                    separator: ',',
                    delimiter: '.',
                    precision: 0,
                  })
            } 
            </Text>
            
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center', marginTop: 20 }}>
                <TextInput
                  style={{ height: 40, width: 220, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10, marginHorizontal: 10 }}
                  onChangeText={(text) => this.setState({ topUpAmount: text.replace(/[^0-9]/g, '') })}
                  value={this.state.topUpAmount}
                  keyboardType={'numeric'}
                  maxLength={8}
                />
                <TouchableOpacity style={{ backgroundColor: '#f44336', padding: 10, height: 40, borderRadius: 3 }} onPress={() => { this.setState({ topUpAmount: String(0) }) }}>
                  <Text style={{ color: '#FFFFFF' }}>Clear</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 180, marginTop: 10 }}>

                <FlatGrid
                  itemDimension={70}
                  items={topUpAmount}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={{ borderWidth: 1, borderColor: '#2196f3', marginHorizontal: 10, paddingVertical: 10, borderRadius: 3, alignItems: 'center' }}
                      onPress={() => this.topUpManagement(item.amount, this.state.topUpAction)}
                    >
                      <Text style={{ color: '#424242' }}>{item.name}</Text>
                    </TouchableOpacity>
                  )
                  }
                />

              </View>

              <View style={{ height: 70, marginTop: 10 }}>
                <FlatGrid
                  itemDimension={65}
                  items={topUpMethod}
                  renderItem={({ item }) => (
                    this.renderTopUpMethod(item)
                  )
                  }
                />
              </View>

              <TouchableOpacity style={{ marginTop: 20, marginBottom: 20, backgroundColor: '#4caf50', paddingVertical: 10, marginHorizontal: 30, borderRadius: 3, alignItems: 'center' }}
                onPress={() => this._topUp()}
              >
                <Text style={{ color: '#424242', color: '#FFFFFF' }}>Top Up</Text>
              </TouchableOpacity>
            </View>
        </View>

          <Modal isVisible={this.state.isWritingToTag} style={{ justifyContent: "center", alignItems: 'center' }}>
            <View style={{ width: 250, height: 250, backgroundColor: '#FFFFFF' }}>
              <View style={{ backgroundColor: '#212121', height: 50, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Write on NFC Tag</Text>
              </View>

              <Icon name='md-phone-portrait' style={{ textAlign: "center", marginVertical: 10 }} size={70} color='#212121' />

              <Text style={{ textAlign: "center", fontSize: 20 }}>Approach an NFC Tag</Text>

              <TouchableOpacity
                style={{ backgroundColor: '#f44336', margin: 5, padding: 10, marginTop: 20 }}
                onPress={() => { this.cancelWriteToTag() }}>
                <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Cancel</Text>
              </TouchableOpacity>

            </View>

          </Modal>

          <Modal isVisible={this.state.isWritingToTagSucess} style={{ justifyContent: "center", alignItems: 'center' }}>
            <View style={{ width: 250, height: 320, backgroundColor: '#FFFFFF' }}>
              <View style={{ backgroundColor: '#4caf50', height: 50, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Sucess</Text>
              </View>

              <Icon name='md-checkmark' style={{ textAlign: "center", marginVertical: 10 }} size={70} color='#4caf50' />

              <Text style={{ textAlign: "center", fontSize: 20 }}>New Balance</Text>
              <Text style={{ textAlign: "center", fontSize: 22, fontWeight: 'bold' }}>
                {
                  MaskService.toMask('money', parseInt(this.state.totalBalance), {
                    unit: 'Rp. ',
                    separator: ',',
                    delimiter: '.',
                    precision: 0,
                  })
                } 
              </Text>

              <TouchableOpacity
                style={{ backgroundColor: '#4caf50', margin: 5, padding: 10, marginTop: 10 }}
                onPress={() => { this.setState({ isWritingToTagSucess: false }, this.startReadTag) }}>
                <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Top Up Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#2196f3', margin: 5, padding: 10,}}
                onPress={() => { this.setState({ isWritingToTagSucess: false }, this.props.navigation.pop) }}>
                <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Back</Text>
              </TouchableOpacity>

            </View>
          </Modal>

          <Modal isVisible={this.state.isReadTag} style={{ justifyContent: "center", }}>
            <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
              <View style={{ backgroundColor: '#212121', height: 50, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Read Tag</Text>
              </View>

              <View style={{flex: 1, justifyContent: "center"}}>
                <Icon name='md-phone-portrait' style={{ textAlign: "center", marginVertical: 10 }} size={70} color='#212121' />

                <Text style={{ textAlign: "center", fontSize: 20 }}>Approach an NFC Tag</Text>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: '#f44336', margin: 5, padding: 10, marginTop: 20 }}
                onPress={() => { this.cancelReadTag() }}>
                <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          

          <Modal isVisible={this.state.isWrittingFailed} style={{ justifyContent: "center", alignItems: 'center' }}>
            <View style={{ width: 250, height: 300, backgroundColor: '#FFFFFF' }}>
              <View style={{ backgroundColor: '#f44336', height: 50, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Failed</Text>
              </View>

              <Icon name='md-close' style={{ textAlign: "center", marginVertical: 10 }} size={70} color='#f44336' />
              <Text style={{ textAlign: "center", fontSize: 18 }}>Please Remove Tag from Phone</Text>

              <TouchableOpacity
                style={{ backgroundColor: '#4caf50', margin: 5, padding: 10, marginTop: 10 }}
                onPress={() => { this.writeToTag() }}>
                <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#f44336', margin: 5, padding: 10, marginTop: 5 }}
                onPress={() => { this.setState({ isWrittingFailed: false }) }}>
                <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Cancel</Text>
              </TouchableOpacity>

            </View>

          </Modal>


        </DrawerLayout>

      </View>
    )
  }

  _parseData = () => {
    let name = '',
      companyCode = '',
      eventCode = '',
      validUntil = '',
      publicKey = '',
      balance = '',
      tagDeposit = '';

    for (let i = 0; i < 8; i++) {
      name += this.state.data[i];
    }

    name = name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    for (let i = 8; i < 14; i++) {
      companyCode += this.state.data[i];
    }

    companyCode = companyCode.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    // companyCode = companyCode.replace(/^*+/i, '');

    for (let i = 14; i < 16; i++) {
      eventCode += this.state.data[i];
    }

    eventCode = eventCode.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    // eventCode = eventCode.replace(/^*+/i, '');

    for (let i = 16; i < 26; i++) {
      validUntil += this.state.data[i];
    }

    validUntil = validUntil.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    // validUntil = validUntil.replace(/^*+/i, '');

    for (let i = 26; i < 34; i++) {
      publicKey += this.state.data[i];
    }

    publicKey = publicKey.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    // publicKey = publicKey.replace(/^*+/i, '');

    for (let i = 34; i < 42; i++) {
      balance += this.state.data[i];
    }

    balance = balance.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    // balance = balance.replace(/^*+/i, '');

    for (let i = 42; i < 47; i++) {
      tagDeposit += this.state.data[i];
    }

    tagDeposit = tagDeposit.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    // tagDeposit = tagDeposit.replace(/^*+/i, '');

    this.setState({
      name: name,
      companyCode: companyCode,
      eventCode: eventCode,
      validUntil: validUntil,
      publicKey: publicKey,
      balance: balance,
      tagDeposit: tagDeposit,
    });
    this._checkBalance();
  }

  _concatAllData = () => {
    
  }



  _requestNdefWrite = () => {
    if (this.state.isWriting) {
      return;
    }

    this.convertData();

    let bytes = Ndef.encodeMessage([
      Ndef.textRecord(this.state.id),
      Ndef.textRecord(data),
    ]);

    this.setState({ isWriting: true });

    NfcManager.requestNdefWrite(bytes)
      .then(() => console.log('write completed'))
      .catch(err => console.warn(err))
      .then(() => this.setState({ isWriting: false }));
    if (this.state.checked) {
      this._increment();
    }
  }

  _cancelNdefWrite = () => {
    this.setState({ isWriting: false });
    NfcManager.cancelNdefWrite()
      .then(() => console.log('write cancelled'))
      .catch(err => console.warn(err))
  }

  _startNfc() {
    NfcManager.start({
      onSessionClosedIOS: () => {
        console.log('ios session closed');
      }
    })
      .then(result => {
        console.log('start OK', result);
      })
      .catch(error => {
        console.warn('start fail', error);
        this.setState({ supported: false });
      })

    if (Platform.OS === 'android') {
      NfcManager.getLaunchTagEvent()
        .then(tag => {
          console.log('launch tag', tag);
          if (tag) {
            this.setState({ tag });
          }
        })
        .catch(err => {
          console.log(err);
        })
      NfcManager.isEnabled()
        .then(enabled => {
          this.setState({ enabled });
        })
        .catch(err => {
          console.log(err);
        })
      NfcManager.onStateChanged(
        event => {
          if (event.state === 'on') {
            this.setState({ enabled: true });
          } else if (event.state === 'off') {
            this.setState({ enabled: false });
          } else if (event.state === 'turning_on') {
            // do whatever you want
          } else if (event.state === 'turning_off') {
            // do whatever you want
          }
        }
      )
        .then(sub => {
          this._stateChangedSubscription = sub;
          // remember to call this._stateChangedSubscription.remove()
          // when you don't want to listen to this anymore
        })
        .catch(err => {
          console.warn(err);
        })
    }
  }

  convertData = () => {
    let id = this.state.id;

    let name = this.state.name;
    if (name.length < 8) {
      for (let i = name.length; i < 8; i++) {
        name += '*'
      }
    }

    let companyCode = this.state.companyCode
    if (companyCode.length < 6) {
      for (let i = companyCode.length; i < 6; i++) {
        companyCode += '*'
      }
    }

    let eventCode = this.state.eventCode
    if (eventCode.length < 2) {
      for (let i = eventCode.length; i < 2; i++) {
        eventCode += '*'
      }
    }

    let validUntil = this.state.validUntil
    if (validUntil.length < 10) {
      for (let i = validUntil.length; i < 10; i++) {
        validUntil += '*'
      }
    }

    let publicKey = this.state.publicKey
    if (publicKey.length < 8) {
      for (let i = publicKey.length; i < 8; i++) {
        publicKey += '*'
      }
    }

    let balance = String(Math.max(0, parseInt(this.state.totalBalance,10)) || 0);
    if (balance.length < 8) {
      for (let i = balance.length; i < 8; i++) {
        balance += '*'
      }
    }

    let tagDeposit = this.state.tagDeposit
    if (tagDeposit.length < 5) {
      for (let i = tagDeposit.length; i < 5; i++) {
        tagDeposit += '*'
      }
    }

    data = name + companyCode + eventCode + validUntil + publicKey + balance + tagDeposit;

    this.setState({ data: data, id: id });
  }

  _onTagDiscovered = tag => {
    console.log('Tag Discovered', tag);
    this.setState({ tag });

    let parsed = null;
    if (tag.ndefMessage && tag.ndefMessage.length > 0) {
      // ndefMessage is actually an array of NdefRecords, 
      // and we can iterate through each NdefRecord, decode its payload 
      // according to its TNF & type
      const ndefRecords = tag.ndefMessage;

      function decodeNdefRecord(record) {
        if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
          return ['text', Ndef.text.decodePayload(record.payload)];
        } else if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
          return ['uri', Ndef.uri.decodePayload(record.payload)];
        }

        return ['unknown', '---']
      }

      parsed = ndefRecords.map(decodeNdefRecord);
    }

    this.setState({ parsed });
  }

  _startDetection = () => {
    this.setState({ startTagPressed: false });
    NfcManager.registerTagEvent(this._onTagDiscovered)
      .then(result => {
        console.log('registerTagEvent OK', result)
      })
      .catch(error => {
        console.warn('registerTagEvent fail', error)
      })
  }

  _stopDetection = () => {
    this.setState({ startTagPressed: true });
    NfcManager.unregisterTagEvent()
      .then(result => {
        console.log('unregisterTagEvent OK', result)
      })
      .catch(error => {
        console.warn('unregisterTagEvent fail', error)
      })
  }

  _clearMessages = () => {
    this.setState({ tag: null, parsed: null });
  }

  _checkBalance = () => {
    total = this.state.balance - this.state.tagDeposit
    minBalance = this.state.minimumBalance
    if (total > minBalance) {
      this.setState({ minBalanceChecker: true, minTransactionChecker: false });
      this.setState({});
    }
    else if (total < minBalance) {

      this.setState({ minBalanceChecker: false, minTransactionChecker: true });
      this.setState({});

    }

  }

  _runTest = textToWrite => {
    const cleanUp = () => {
      this.setState({ isTestRunning: false });
      NfcManager.closeTechnology()
      NfcManager.unregisterTagEvent();
    }

    const parseText = (tag) => {
      if (tag.ndefMessage) {
        this.setState({
          id: NdefParser.parseText(tag.ndefMessage[0]),
          data: NdefParser.parseText(tag.ndefMessage[1]),
        }, this._parseData
        )
        return NdefParser.parseText(tag.ndefMessage[0]);
      }
      return null;
    }


    this.setState({ isTestRunning: true });
    NfcManager.registerTagEvent(tag => console.log(tag))
      .then(() => NfcManager.requestTechnology(NfcTech.Ndef))
      .then(() => NfcManager.getTag())
      .then(tag => {
        console.log(JSON.stringify(tag));
      })
      .then(() => NfcManager.getNdefMessage())
      .then(tag => {
        let parsedText = parseText(tag);
        this.setState({ tag, parsedText })
      })
      .then(cleanUp)
      .catch(err => {
        console.warn(err);
        cleanUp();
      })
  }

  _cancelTest = () => {
    NfcManager.cancelTechnologyRequest()
      .catch(err => console.warn(err));
  }

  _startNfc = () => {
    NfcManager.start()
      .then(() => NfcManager.isEnabled())
      .then(enabled => this.setState({ enabled }))
      .catch(err => {
        console.warn(err);
        this.setState({ enabled: false })
      })
  }

  _clearMessages = () => {
    this.setState({
      id: '',
      name: '',
      companyCode: '',
      eventCode: '',
      regDateTime: '',
      publicKey: '',
      lastTopUp: '',
      balance: '',
      topUpMethod: '',
      tagDeposit: ''
    });
  }

  _topUp = () => {
    let balance = (parseInt(this.state.balance, 10) + parseInt(this.state.topUpAmount, 10));
    balance = String(balance);
    console.warn(balance);
    this.setState({
      totalBalance: balance,
    }, this.writeToTag
    )
    this.saveTopUpData();
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
});
export default App;