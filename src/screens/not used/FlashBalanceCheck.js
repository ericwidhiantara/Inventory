import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import NfcManager, { NdefParser, NfcTech } from 'react-native-nfc-manager';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextMask } from 'react-native-masked-text'
import Display from 'react-native-display';
import { MaskService } from 'react-native-masked-text';

let id = ''
let name = ''
let companyCode =''
let eventCode = ''
let validUntil = ''
let publicKey = ''
let balance =''
let tagWarranty =''

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
      balance: '',
      topUpMethod: '',
      tagWarranty: '',
      eventCode: '',

      data: '',

      minBalanceChecker: false,
      minTransactionChecker: false,

      minimumBalance: 60000,
      availableBalance: '',
    }
  }

  componentDidMount() {
    NfcManager.isSupported()
      .then(supported => {
        this.setState({ supported });
        if (supported) {
          this._startNfc();
          // this._runTest();
        }
      })
  }

  componentWillUnmount() {
    // this._cancelTest();
  }

  render() {
    const { navigation } = this.props;

    id = navigation.getParam('id', '');
    name = navigation.getParam('name', '');
    companyCode = navigation.getParam('companyCode', '');
    eventCode = navigation.getParam('eventCode', '');
    validUntil = navigation.getParam('validUntil', '');
    publicKey = navigation.getParam('publicKey', '');
    balance = navigation.getParam('balance', '');
    tagWarranty = navigation.getParam('tagWarranty', '');

    let { supported, enabled, tag, text, parsedText, isTestRunning } = this.state;
    return (
      <View style={{flex: 1}}>
        <View style={styles.header}>
          <TouchableOpacity style={{ height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 15 }}
            onPress={() => {this.props.navigation.pop()}}
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

        <ScrollView style={{ marginHorizontal: 30, flex: 1 }}>
          <Text style={{ textAlign: "center", fontSize: 18, marginVertical: 20 }}>FLASH BALANCE CHECK</Text>

          <View style={{flexDirection: 'row'}}>
            <View style={{ flex: 0.8}}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>ID</Text>
            </View>
            <View style={{flex: 0.1, justifyContent: "center", alignItems: 'center'}}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>:</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'flex-start'}}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>{this.state.id}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 0.8 }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>Guess Name</Text>
            </View>
            <View style={{ flex: 0.1, justifyContent: "center", alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>:</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>{this.state.name}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 0.8 }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>Balance</Text>
            </View>
            <View style={{ flex: 0.1, justifyContent: "center", alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>:</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>
                {
                  MaskService.toMask('money', this.state.balance, {
                    unit: 'Rp. ',
                    separator: ',',
                    delimiter: '.',
                    precision: 0
                  })
                }
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 0.8 }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>Company Code</Text>
            </View>
            <View style={{ flex: 0.1, justifyContent: "center", alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>:</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>
                {this.state.companyCode
                }
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 0.8 }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>Event Code</Text>
            </View>
            <View style={{ flex: 0.1, justifyContent: "center", alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>:</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>
                {this.state.eventCode
                }
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 0.8 }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>Valid Until</Text>
            </View>
            <View style={{ flex: 0.1, justifyContent: "center", alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>:</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>
                {this.state.validUntil
                }
              </Text>
            </View>
          </View>

          


          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 0.8 }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>Tag Warranty</Text>
            </View>
            <View style={{ flex: 0.1, justifyContent: "center", alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>:</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>
                {
                  MaskService.toMask('money', this.state.tagWarranty, {
                    unit: 'Rp. ',
                    separator: ',',
                    delimiter: '.',
                    precision: 0
                  })
                }
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 0.8 }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>Available Balance</Text>
            </View>
            <View style={{ flex: 0.1, justifyContent: "center", alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>:</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, marginTop: 10 }}>
                {
                  MaskService.toMask('money', this.state.balance - this.state.tagWarranty, {
                    unit: 'Rp. ',
                    separator: ',',
                    delimiter: '.',
                    precision: 0
                  })
                }
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 30 }}>
            <View style={{ justifyContent: 'center', alignItems: "center", }}>
              <TouchableOpacity style={{ backgroundColor: '#4caf50', height: 50, width: 200, borderWidth: 1, borderRadius: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}
                onPress={isTestRunning ? this._cancelTest : this._runTest}
              >
                <Text style={{ fontSize: 16, color: '#FFFFFF', textAlign: "center" }}>{isTestRunning ? 'Cancel' : 'Check Balance'}</Text>
              </TouchableOpacity>
            </View>
          </View>
         

          <View style={{ justifyContent: 'center', alignItems: "center", }}>
            <TouchableOpacity style={{ backgroundColor: '#2196f3', height: 50, width: 200, borderWidth: 1, marginTop: 20, borderRadius: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => this.props.navigation.pop()}
            >
              <Text style={{ fontSize: 16, color: '#FFFFFF', textAlign: "center" }}>Back</Text>
            </TouchableOpacity>
          </View>

          <Display enable={this.state.minBalanceChecker}>
            <View style={{ justifyContent: 'center', alignItems: "center", }}>
              <TouchableOpacity style={{ backgroundColor: '#f44336', height: 50, width: 200, borderWidth: 1, marginTop: 20, borderRadius: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => this.props.navigation.navigate('')}
              >
                <Text style={{ fontSize: 16, color: '#FFFFFF', textAlign: "center" }}>Top Up</Text>
              </TouchableOpacity>
            </View>
          </Display>

          <Display enable={this.state.minTransactionChecker}>
            <View style={{ justifyContent: 'center', alignItems: "center", }}>
              <TouchableOpacity style={{ backgroundColor: '#ff5722', height: 50, width: 200, borderWidth: 1, marginTop: 20, borderRadius: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => this.props.navigation.navigate('')}
              >
                <Text style={{ fontSize: 16, color: '#FFFFFF', textAlign: "center" }}>Transaction</Text>
              </TouchableOpacity>
            </View>
          </Display>

        </ScrollView>

      </View>
    )
  }

  _parseData = () => {
    id=this.state.id;
    name = '',
    companyCode = '', 
    eventCode = '', 
    validUntil = '', 
    publicKey = '', 
    balance = '', 
    tagWarranty = '';

    for(let i=0; i< 8; i++)
    {
      name += this.state.data[i];
    }

    name = name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    for (let i=8; i < 14; i++) {
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
      tagWarranty += this.state.data[i];
    }

    tagWarranty = tagWarranty.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    // tagWarranty = tagWarranty.replace(/^*+/i, '');

    this.setState({
      name: name,
      companyCode: companyCode,
      eventCode: eventCode,
      validUntil: validUntil,
      publicKey: publicKey,
      balance: balance,
      tagWarranty: tagWarranty,
    });
    this._checkBalance();
    this._runTest();
  }

  _checkBalance=()=> {
    total = this.state.balance - this.state.tagWarranty
    minBalance = this.state.minimumBalance
    if (total > minBalance) {
      this.setState({ minBalanceChecker: true, minTransactionChecker: false });
      this.setState({  });
    }
    else if (total < minBalance) {
      
      this.setState({ minBalanceChecker: false, minTransactionChecker: true });
      this.setState({  });
      
    }
    this.setState({});
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
        this._runTest();
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
      tagWarranty: ''
    });
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
});
export default App;