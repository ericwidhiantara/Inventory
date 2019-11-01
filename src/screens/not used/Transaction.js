import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  ToastAndroid
} from "react-native";
import { FlatGrid } from "react-native-super-grid";
import Icon from "react-native-vector-icons/Ionicons";
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import Display from 'react-native-display';
import NfcManager, { NdefParser, NfcTech, Ndef } from 'react-native-nfc-manager';
import AsyncStorage from '@react-native-community/async-storage';
import Modal from "react-native-modal";
import { MaskService } from 'react-native-masked-text';
import { bold } from "ansi-colors";
import Toast, { DURATION } from 'react-native-easy-toast'
let pdaUniqueCode = 'AD'; // ini di dapat dari server disimpan di asyncstorage
let actionCode = 'TR';
let lastTransactionId = 1; 
let balance = 0;
let food = [];

let insufficientBalance = 'Insufficient Balance! Please Top Up';


let foodBackup = [
  { material_id: 1, name: 'Pizza', barcode: '123', sku: '123', price: '150000.00', quantity: 0, addtoCart: false, image: require("../../src/images/beerIcon.jpg") },
  { material_id: 2, name: 'Hamburger', barcode: '123', sku: '123', price: '250000.00', quantity: 0, addtoCart: false, image: require("../../src/images/beer2Icon.jpg") },
  { material_id: 3, name: 'Steak', barcode: '123', sku: '123', price: '350000.00', quantity: 0, addtoCart: false, image: require("../../src/images/cocacolaIcon.png") },
  { material_id: 4, name: 'Sushi', barcode: '123', sku: '123', price: '100000.00', quantity: 0, addtoCart: false, image: require("../../src/images/cocacolaIcon.png") },
  { material_id: 5, name: 'Caramel', barcode: '123', sku: '123', price: '150000.00', quantity: 0, addtoCart: false, image: require("../../src/images/beerIcon.jpg") },
  { material_id: 6, name: 'Ice Cream Strawberry', barcode: '123', sku: '123', price: '120000.00', quantity: 0, addtoCart: false, image: require("../../src/images/beerIcon.jpg") },
  { material_id: 5, name: 'Chocolate', barcode: '123', sku: '123', price: '150000.00', quantity: 0, addtoCart: false, image: require("../../src/images/beerIcon.jpg") },
  { material_id: 6, name: 'Ice Cream Chocolate', barcode: '123', sku: '123', price: '120000.00', quantity: 0, addtoCart: false, image: require("../../src/images/beerIcon.jpg") },
  { material_id: 5, name: 'Chocolate Cream', barcode: '123', sku: '123', price: '150000.00', quantity: 0, addtoCart: false, image: require("../../src/images/beerIcon.jpg") },
  { material_id: 6, name: 'Gellato', barcode: '123', sku: '123', price: '120000.00', quantity: 0, addtoCart: false, image: require("../../src/images/beerIcon.jpg") },
];

const drawerMenu = [
  { menu: "Home", icon: 'md-home', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Home' },
  
  { menu: "Help", icon: 'md-help-circle', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Help' },
  { menu: "Settings", icon: 'md-settings', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Settings' },
  { menu: "About", icon: 'md-people', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'About' },
  { menu: "Log Out", icon: 'md-power', iconColor: '#f44336', iconBackground: '#FFFFFF', route: 'LogOut' },
]

var shoppingTransaction = [];

let cart = [];
let finalAmount = 0;
var totalPrice = 0;
type Props = {};
export default class App extends Component<Props> {
  static navigationOptions = {
    header: null
  };

  componentDidMount() {
    NfcManager.isSupported()
      .then(supported => {
        this.setState({ supported });
        if (supported) {
          this._startNfc();
        }
      })

    cart = [];

    itemCount = 0;
    totalPrice = 0;

    this.foodMenuCheck();

    this.pdaUniqueCodeCheck();
    this.lastTransactionIdCheck();
    this.checkTransaction();
    this.startReadTag();

    this.setState({});
  }

  componentWillUnmount() {
    if (this._stateChangedSubscription) {
      this._stateChangedSubscription.remove();
    }
    
  }

  foodMenuCheck = async () => {
    AsyncStorage.getItem('foodMenuNew', (err, result) => {
      if (!err && result != null) {
        food = JSON.parse(result);
        this.setState({});
      }
    });
  }

  lastTransactionIdCheck = async () => {
    AsyncStorage.getItem('lastTransactionId', (err, result) => {
      if (!err && result != null) {
        lastTransactionId = parseInt(result, 10);
        this.setState({});
      }
    });
  }

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

  constructor(props) {
    super(props);

    this.state = { enable: false, 
      isTestRunning: false,
      name: 'Scan Customer',
      companyCode: '',
      eventCode: '',
      validUntil: '',
      publicKey: '',
      balance: '',
      tagDeposit: '',
      id: '',
      

      data: '',

      isWriting: false,
      startTagPressed: true,
      itemDetailVisible: false,
      displayCart: false,
      displayPayProcess: false,

      writeSucess: false,
      writeFail: false,

      itemDetailName: '',
      itemDetailQuantity: 0,
      itemCount: 0,
      totalPrice: 0,

      isWritingToTag: false,
      isWritingToTagSucess: false,
      isWrittingFailed: false,
      isReadTag: false,
     };
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

  // editQuantity = (item, param) =>
  // {
  //   let itemCount = this.state.itemCount;
  //   let totalPrice = this.state.totalPrice;

  //   if (param == '+') {
  //       item.quantity++;
  //       itemCount++;
  //       totalPrice += parseInt(item.price, 10);
  //   }

  //   if (param == '-') {
  //     if (item.quantity > 0) {
  //       item.quantity--;
  //       itemCount--;
  //       totalPrice -= parseInt(item.price, 10);
  //     }
  //   }


  //   this.setState({ itemCount: itemCount, totalPrice: totalPrice })
  // }

  editQuantity = (item, param) => {
    let itemCount = parseInt(this.state.itemCount, 10);
    let totalPrice = parseInt(this.state.totalPrice, 10);
    
    if (param == '+') {

      if (totalPrice + parseInt(item.price) <= parseInt(this.state.balance, 10)- parseInt(this.state.tagDeposit,10))
      {
        item.quantity++;
        itemCount++;
        totalPrice += parseInt(item.price, 10);
        this.setState({ itemCount: String(itemCount), totalPrice: String(totalPrice) })
        if (cart.length > 0) {
          for (var i = 0; i < cart.length; i++) {
            if (cart[i].material_id === item.material_id) {
              cart.splice(i, 1);
              cart.push(item);
              return;
            }
          }
        }

        cart.push(item);

      }

      else{
        this.refs.toast.show(insufficientBalance, 700);
      }
    }

      if (param == '-') {
        if (item.quantity > 0) {
          item.quantity--;
          itemCount--;
          totalPrice -= parseInt(item.price, 10);

          this.setState({ itemCount: String(itemCount), totalPrice: String(totalPrice) })
          if (cart.length > 0) {
            for (var i = 0; i < cart.length; i++) {
              if (cart[i].material_id === item.material_id) {
                cart.splice(i, 1);
                if (item.quantity > 0) {
                  cart.push(item);
                }
                return;
              }
              if (cart[i].quantity == 0)
              {
                cart.splice(i, 1);
              }
          }
        }

        cart.push(item);
      }
    }
    this.setState({})
  }

  changeQuantity = (item, quantity) => {
    item.quantity = quantity
  }

  addToCart = (item) => {
    this.pushIfNew(item); 
  }

  removeFromCart = (item) => {
    let index = items.id.indexOf(item.id);
    if (index > -1) {
      cart.splice(index, 1);
    }
  }

  pushIfNew(item) {
    item.quantity++;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === item.id) { 
        cart.splice(i, 1);
        return;
      }
    }
    
    cart.push(item);
    this.setState({});
  }

  countTotalPrice = () => {
    totalPrice = 0;
    for (var i = 0; i < cart.length; i++) {
        totalPrice += cart[i].price * cart[i].quantity ;
    }
    this.setState({});
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

  cancelTransaction = () => {
    cart.length = 0; 
    for (let i = 0; i < items.length; i++) {
      items[i].quantity = 0;
    }
  }

  saveTransaction = () => {

    let transaction;

    lastTransactionId++;
    transactionId = String(pdaUniqueCode) + String(actionCode) + String(lastTransactionId);

    let currentdate = new Date();
    let datetime = currentdate.getDate() + "/"
      + (currentdate.getMonth() + 1) + "/"
      + currentdate.getFullYear() + " "
      + currentdate.getHours() + ":"
      + currentdate.getMinutes() + ":"
      + currentdate.getSeconds();

    // transaction = {
    //   transactionId: transactionId, customerId: this.state.id, transactionDate: datetime,
    //   items: cart, total: totalPrice
    // }

    shoppingTransaction.push({
      transactionId: transactionId, customerId: this.state.id, transactionDate: datetime,
      items: cart, total: this.state.totalPrice, sync: false
    });
    AsyncStorage.setItem('shoppingTransaction', JSON.stringify(shoppingTransaction));
    AsyncStorage.setItem('lastTransactionId', String(lastTransactionId));
  }


  checkTransaction = async () => {
    AsyncStorage.getItem('shoppingTransaction', (err, result) => {
      if (!err && result != null) {
        shoppingTransaction = JSON.parse(result);
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

  lastRefundIdCheck = async () => {
    AsyncStorage.getItem('lastTransactionId', (err, result) => {
      if (!err && result != null) {
        lastTransactionId = parseInt(result, 10);
        this.setState({});
      }
    });
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

  _cancelNdefWrite = () => {
    this.setState({ isWriting: false });
    NfcManager.cancelNdefWrite()
      .then(() => console.log('write cancelled'))
      .catch(err => console.warn(err))
  }

  transactionHandler = () => {
    this.balanceHandler();
  }

  balanceHandler = () => {
    balance = parseInt(this.state.balance, 10);
    balance = balance - parseInt(totalPrice, 10);
    this.setState({ balance: String(balance) }, this._requestNdefWrite);
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

    let balance = this.state.balance
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


  _requestNdefWrite = () => {
    let { isWriting } = this.state;
    if (isWriting) {
      return;
    }

    this.convertData();

    let bytes = Ndef.encodeMessage([
      Ndef.textRecord(this.state.id),
      Ndef.textRecord(data),
    ]);

    this.setState({ isWriting: true });

    NfcManager.requestNdefWrite(bytes)
      .then(() => {
      cart.length = 0;
        totalPrice = 0;
        this.saveTransaction();
      }
        )
      .catch(err => console.warn(err))
      .then(() => this.setState({ isWriting: false }));
    
    
  }

  viewItemDetail = (item) => {
    this.setState({
      itemDetailVisible: true,
      itemDetailName: item.name,
      itemDetailQuantity: item.quantity,
    });
  }

  cartHandler = () => {
    this.setState({ itemDetailVisible: false });
  }

  displayCart = () => {
    this.setState({ displayCart: true});
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
          console.log(JSON.stringify(tag));
        })
        .then(() => NfcManager.getNdefMessage())
        .then(tag => {
          this.parseText(tag);
        })
      )
      .then(() => this.setState({ isReadTag: false,  itemCount: 0, totalPrice: 0}))
      .then(() => { itemCount = 0; totalPrice = 0; cart = [];})
      .then(() => {
          food.forEach(item => {
            item.quantity = 0;
          });
          this.setState({});
      })
      .catch(err => {
        console.warn(err);
        this.setState({ isReadTag: false })
      });
  }

  parseText = (tag) => {
    if (tag.ndefMessage) {
      this.setState({
        id: NdefParser.parseText(tag.ndefMessage[0]),
        data: NdefParser.parseText(tag.ndefMessage[1]),
      }, this._parseData
      )
    }
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
          displayCart: false
        }, this.saveTransaction))
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

  transactionManagement = () => {
    finalAmount = 0;
    finalAmount = (parseInt(this.state.balance,10) - parseInt(this.state.tagDeposit, 10)) - parseInt(this.state.totalPrice, 10);

    finalAmount = String(finalAmount);
    this.setState({ balance: finalAmount }, this.writeToTag)
  }

  render() {
    let { isWriting } = this.state;
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

          <View style={{ flexDirection: 'row', backgroundColor: '#eeeeee', paddingVertical: 5}}>
            <View style={{flex: 0.5, alignItems: "center"}}>
              <Text>Item</Text>
              <Text style={{ fontSize: 20, color: '#00bcd4'}}>{this.state.itemCount}</Text>
            </View>

            <View style={{ flex: 1, alignItems: "center" }}>
              <Text>Total</Text>
              <Text style={{ fontSize: 20, color: '#00bcd4' }}> {
                  MaskService.toMask('money', parseInt(this.state.totalPrice), {
                    unit: 'Rp. ',
                    separator: ',',
                    delimiter: '.',
                    precision: 0,
                  })
                } 
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: "center"}}>
              <Text>Balance</Text>
              <Text style={{ fontSize: 20, color: '#00bcd4' }}>{
                MaskService.toMask('money', (parseInt(this.state.balance, 10) - parseInt(this.state.tagDeposit, 10)), {
                  unit: 'Rp. ',
                  separator: ',',
                  delimiter: '.',
                  precision: 0,
                })
              } </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', backgroundColor: '#212121', paddingVertical: 3 }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, color: '#fafafa'}}>FOOD</Text>
            </View>

            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 18, color: '#fafafa' }}>BEVERAGES</Text>
            </View>
          </View>

          <FlatGrid
            style={{ flex: 1 }}
            itemDimension={150}
            items={food}
            renderItem={({ item }) => (
              <View style={{ height: 100, backgroundColor: '#00bcd4', borderRadius: 3}} 
              onPress={() => this.viewItemDetail(item)} >
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row' }} onPress={() => this.editQuantity(item, '+')}>
                  <View style={{ flex: 0.5, alignItems: "center", backgroundColor: '#FFFFFF', justifyContent: 'center', borderTopWidth:1, borderLeftWidth:1, borderBottomWidth: 1, borderColor: '#00bcd4', borderTopLeftRadius: 3}}>
                    <Text style={{ color: '#00bcd4', fontSize: 28, }}>{item.quantity}</Text>
                  </View>  
                  <View style={{ flex: 1, alignItems: "center", justifyContent: 'center', }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 20, textAlign: 'center' }}>{item.name}</Text>
                  </View>  
                
                </TouchableOpacity>

                <View style={{ borderTopWidth: 1, paddingLeft: 5,  borderTopColor: '#FFFFFF', padding:3, flexDirection: "row"}}>
                  <View style={{ alignItems: "flex-start", flex: 1 }}>  
                    <Text style={{ color: '#FFFFFF' }}>  
                      {
                        MaskService.toMask('money', parseInt(item.price), {
                          unit: 'Rp. ',
                          separator: ',',
                          delimiter: '.',
                          precision: 0,
                        })
                      }
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", flex: 0.8, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center"}}>  
                    <TouchableOpacity style={{ marginHorizontal: 7, backgroundColor: '#FFFFFF', width: 20, borderRadius: 3, justifyContent: 'center', alignItems: "center", flex: 1}}
                      onPress={()=>this.editQuantity(item, '-')}
                    >
                      <Text>-</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
              </View>
            )
            }
          />

          <Modal isVisible={this.state.displayCart}>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
              <Text style={{textAlign: 'center', fontSize: 22, marginVertical: 10, fontWeight: 'bold'}}>Shopping Cart</Text>

              <View style={{flex: 1,}}>
                <FlatGrid
                  style={{ flex: 1 }}
                  itemDimension={300}
                  items={cart}
                  spacing={4}
                  renderItem={({ item }) => (
                    <View style={{ height: 70, backgroundColor: '#00bcd4', borderRadius: 3, flexDirection: "row"}}>
                      <View style={{ flex: 1, flexDirection: 'row'}}>
                        <View style={{ flex: 0.5, alignItems: "center", backgroundColor: '#FFFFFF', justifyContent: 'center', borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#00bcd4', borderTopLeftRadius: 3 }}>
                          <Text style={{ color: '#00bcd4', fontSize: 18 }}>{item.quantity}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: "center", justifyContent: 'center', }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 18, textAlign: 'center' }}>{item.name}</Text>
                        </View>
                      </View>

                      <View style={{ flex: 1, bpaddingLeft: 5, padding: 3, flexDirection: "row" }}>
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                          <Text style={{ color: '#FFFFFF', fontSize: 20}}>
                          { 
                            MaskService.toMask('money', parseInt(item.price) * parseInt(item.quantity), {
                              unit: 'Rp. ',
                              separator: ',',
                              delimiter: '.',
                              precision: 0,
                            })
                          }
                          </Text>
                        </View>
                      </View>

                    </View>
                  )
                  }
                />

                <Text style={{textAlign: "center", fontSize:22, fontWeight: 'bold', marginBottom: 20}}>TOTAL : {
                  MaskService.toMask('money', this.state.totalPrice, {
                    unit: 'Rp. ',
                    separator: ',',
                    delimiter: '.',
                    precision: 0,
                  })
                }</Text>
              </View>

              <View style={{ flexDirection: "row", marginVertical: 10, justifyContent: 'flex-end' }}>
                <TouchableOpacity style={{ padding: 10, borderWidth: 2, borderRadius: 30, width: 80, borderColor: '#f44336', marginHorizontal: 10 }}
                  onPress={() => { this.setState({ displayCart: false }) }}
                >
                  <Text style={{ textAlign: "center", color: '#f44336' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 10, borderWidth: 2, borderRadius: 30, width: 80, borderColor: '#4caf50', marginHorizontal: 10 }}
                  onPress={() => this.transactionManagement()}
                >
                  <Text style={{ textAlign: "center", color: '#4caf50' }}>Pay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
            <View style={{ flex:1, backgroundColor: '#FFFFFF' }}>
              <View style={{ backgroundColor: '#4caf50', height: 50, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Sucess</Text>
              </View>

              <Icon name='md-checkmark' style={{ textAlign: "center", marginVertical: 10 }} size={70} color='#4caf50' />

              <FlatGrid
                style={{ flex: 1 }}
                itemDimension={300}
                items={cart}
                spacing={4}
                renderItem={({ item }) => (
                  <View style={{ height: 70, backgroundColor: '#00bcd4', borderRadius: 3, flexDirection: "row" }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                      <View style={{ flex: 0.5, alignItems: "center", backgroundColor: '#FFFFFF', justifyContent: 'center', borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#00bcd4', borderTopLeftRadius: 3 }}>
                        <Text style={{ color: '#00bcd4', fontSize: 18 }}>{item.quantity}</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: "center", justifyContent: 'center', }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 18, textAlign: 'center' }}>{item.name}</Text>
                      </View>
                    </View>

                    <View style={{ flex: 1, bpaddingLeft: 5, padding: 3, flexDirection: "row" }}>
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 20 }}>
                          {
                            MaskService.toMask('money', parseInt(item.price) * parseInt(item.quantity), {
                              unit: 'Rp. ',
                              separator: ',',
                              delimiter: '.',
                              precision: 0,
                            })
                          }
                        </Text>
                      </View>
                    </View>

                  </View>
                )
                }
              />

              <Text style={{ textAlign: "center", fontSize: 20 }}>Balance</Text>
              <Text style={{ textAlign: "center", fontSize: 22, fontWeight: 'bold' }}>{
                MaskService.toMask('money', parseInt(finalAmount), {
                  unit: 'Rp. ',
                  separator: ',',
                  delimiter: '.',
                  precision: 0,
                })
              } </Text>

              <TouchableOpacity
                style={{ backgroundColor: '#4caf50', margin: 5, padding: 10, marginTop: 10 }}
                onPress={() => { this.setState({ isWritingToTagSucess: false }, this.startReadTag) }}>
                <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Transaction Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#2196f3', margin: 5, padding: 10, }}
                onPress={() => { this.setState({ isWritingToTagSucess: false }, this.props.navigation.pop) }}>
                <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>Back</Text>
              </TouchableOpacity>

            </View>
          </Modal>

          <Modal isVisible={this.state.isReadTag} style={{ justifyContent: "center", }}>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
              <View style={{ backgroundColor: '#212121', height: 50, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Read Tag</Text>
              </View>

              <View style={{ flex: 1, justifyContent: "center" }}>
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

          <Toast ref="toast" style={{ backgroundColor: '#fdd835' }} textStyle={{ color: '#424242' }} />


          

          <View style={{flexDirection: "row", marginVertical: 10, justifyContent: 'flex-end'}}>
            <TouchableOpacity style={{ padding: 10, borderWidth: 2, borderRadius: 30, width: 100, borderColor: '#4caf50', marginHorizontal: 10 }}
              onPress={()=>this.displayCart()}
            >
              <Text style={{ textAlign: "center", color: '#4caf50' }}>Pay</Text>
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
  box1: {
    flex: 1,
    borderWidth: 1,
    marginHorizontal: 10
  },
  box2: {
    flex: 1,
    //borderWidth: 1,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10
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
    marginTop: 10,
    borderWidth: 1
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
    backgroundColor: "#fff"
  },
  buttonText: {
    fontSize: 22,
    color: "#000",
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
    fontSize: 18,
    marginLeft: 20,
    color: "#FFFFFF"
  },
  gridView: {
    marginVertical: 20,
    paddingVertical: 25,
    flex: 1
  }
});
