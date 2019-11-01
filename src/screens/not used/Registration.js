import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    StatusBar,
    Image,
    ToastAndroid
} from 'react-native';
import NfcManager, { Ndef } from 'react-native-nfc-manager';
import Icon from 'react-native-vector-icons/Ionicons';
import { FlatGrid } from 'react-native-super-grid';
import AsyncStorage from '@react-native-community/async-storage';
import Display from 'react-native-display';
import DrawerLayout from "react-native-gesture-handler/DrawerLayout";
import Modal from "react-native-modal";
import moment from "moment";
import { MaskService } from 'react-native-masked-text';

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

topUpMethod = [
    { name: 'CASH' },
    { name: 'CCARD' },
    { name: 'DCARD' },
    { name: 'TCARD' },
]

let pdaUniqueCode = 'AD'; // ini di dapat dari server disimpan di asyncstorage
let actionCode = 'R'; // R stands for registration
let lastRegistrationID = 1; //simpen last registration id untuk registration
var registeredUser = [];
let registrationId = '';
let data = '';

let chooseTopUpMethod = 'Please Select Top Up Method !'

const drawerMenu = [
    { menu: "Home", icon: 'md-home', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Home' },
    
    { menu: "Help", icon: 'md-help-circle', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Help' },
    { menu: "Settings", icon: 'md-settings', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'Settings' },
    { menu: "About", icon: 'md-people', iconColor: '#616161', iconBackground: '#FFFFFF', route: 'About' },
    { menu: "Log Out", icon: 'md-power', iconColor: '#f44336', iconBackground: '#FFFFFF', route: 'LogOut' },
]

let username = '';
let password = '';
let userId = '';
let fullName = '';
let eventCode = '';
let eventTitle = '';
let tagDeposit = '';
let companyCode = '';
let validUntil = '';

class Registration extends Component {
    static navigationOptions = {
        header: null
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

    constructor(props) {
        super(props);
        this.state = {
            supported: true,
            enabled: false,
            isWriting: false,
            tag: {},
            parsed: null,

            id: '0',
            name: '0',
            companyCode: 'FINNS',
            eventCode: 'FI',
            validUntil: '1904011203',
            publicKey: 'ABCDEFGH',
            balance: '0',
            tagDeposit: '0',
            eventTitle: '',
            topUpMethod: '',

            topUpAmount: '0',

            increment: '1',
            incrementStart: '0',
            totalBalance: '0',
            startTagPressed: true,

            data: '',

            otherTopUpAmount: false,

            checked: true,
            topUpView: false,
            topUpMethodView: false,
            topUpAction: '+',


            isWritingToTag: false,
            isWritingToTagSucess: false,
            isWrittingFailed: false,

            username: '',
            password: '',
            fullName: '',
            userId: '',
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

        let balance = this.state.totalBalance
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


    renderTopUpMethod = (item) => {
        if (item.name == this.state.topUpMethod) {
            return (
                <TouchableOpacity style={{ backgroundColor: '#00bcd4', marginHorizontal: 10, paddingVertical: 10, borderRadius: 3, alignItems: 'center' }}
                    onPress={() => this.setState({ topUpMethod: item.name, topUpMethodView: false })}
                >
                    <Text style={{ color: '#FFFFFF' }}>{item.name}</Text>
                </TouchableOpacity>
            );
        }

        else {
            return (
                <TouchableOpacity style={{ borderWidth: 1, borderColor: '#00bcd4', marginHorizontal: 10, paddingVertical: 10, borderRadius: 3, alignItems: 'center' }}
                    onPress={() => this.setState({ topUpMethod: item.name, topUpMethodView: false })}
                >
                    <Text style={{ color: '#424242' }}>{item.name}</Text>
                </TouchableOpacity>
            );
        }
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

    componentDidMount() {
        NfcManager.isSupported()
        .then(supported => {
            this.setState({ supported });
            if (supported) {
                this._startNfc();
            }
        })

        pdaUniqueCode = 'AD'; // ini di dapat dari server disimpan di asyncstorage
        actionCode = 'R'; // R stands for registration
        lastRegistrationID = 1; //simpen last registration id untuk registration
        registeredUser = [];
        registrationId = '';
        data = '';

        this.pdaUniqueCodeCheck();
        this.lastRegistrationIdCheck();
        this.checkRegistration();
        this.checkData();
        this.setState({});

    }

    checkData = async () => {
        AsyncStorage.getItem('username', (err, result) => {
            if (!err && result != null) {
                username = result;
                this.setState({username: username});
            }
        });

        AsyncStorage.getItem('password', (err, result) => {
            if (!err && result != null) {
                password = result;
                this.setState({password: password});
            }
        });

        AsyncStorage.getItem('userId', (err, result) => {
            if (!err && result != null) {
                userId = result;
                this.setState({userId: userId});
            }
        });

        AsyncStorage.getItem('fullName', (err, result) => {
            if (!err && result != null) {
                fullName = result;
                this.setState({fullName: fullName});
            }
        });

        AsyncStorage.getItem('eventCode', (err, result) => {
            if (!err && result != null) {
                eventCode = result;
                this.setState({eventCode: eventCode});
            }
        });

        AsyncStorage.getItem('eventTitle', (err, result) => {
            if (!err && result != null) {
                eventTitle = result;
                this.setState({eventTitle: eventTitle});
            }
        });

        AsyncStorage.getItem('validUntil', (err, result) => {
            if (!err && result != null) {
                validUntil = result;
                this.parseDateTime();
            }
        });

        AsyncStorage.getItem('tagDeposit', (err, result) => {
            if (!err && result != null) {
                tagDeposit = result;
                this.setState({tagDeposit: tagDeposit});
            }
        });

        AsyncStorage.getItem('companyCode', (err, result) => {
            if (!err && result != null) {
                companyCode = result;
                this.setState({companyCode: companyCode});
            }
        });
    }

    checkRegistration = async () => {
        AsyncStorage.getItem('registeredUser', (err, result) => {
            if (!err && result != null) {
                registeredUser = JSON.parse(result);
                this.setState({ });
            }
        });
    }

    pdaUniqueCodeCheck = async () => {
        AsyncStorage.getItem('pdaUniqueCode', (err, result) => {
            if (!err && result != null) {
                pdaUniqueCode = result;
                this.setState({ });
            }
        });
    }

    lastRegistrationIdCheck = async () => {
        AsyncStorage.getItem('lastRegistrationID', (err, result) => {
            if (!err && result != null) {
                lastRegistrationID = parseInt(result, 10);
            }
            this.getRegistrationID();
            this.setState({});
        });
    }

    getRegistrationID = () =>{
        registrationId = String(pdaUniqueCode) + String(actionCode) + String(lastRegistrationID);
        this.setState({id: registrationId, name: registrationId});
    }

    parseDateTime = () => {
        // var parts = validUntil.split('/');
        // endDate = parts[1] + '/' + parts[0] + '/' + parts[2];
        // console.warn(validUntil);
        // let myDate = moment(String(validUntil));
        // console.warn(myDate);

        if(validUntil == '0000-00-00 00:00:00')
        {
            validUntil = '2019-05-24 07:00:00'
        }

        let dateTime = moment(validUntil);
        dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");

        var month = moment(dateTime).format('MM');
        var day = moment(dateTime).format('DD');
        var year = moment(dateTime).format('YY');

        var hour = moment(dateTime).format('HH');
        var minutes = moment(dateTime).format('mm');
        
        // let myDate = new Date(validUntil);

        // let year = String(myDate.getFullYear());
        // let month = String(myDate.getMonth());
        // let date = String(myDate.getDate());

        // let hour = String(myDate.getHours());
        // let minutes = String(myDate.getMinutes());

        let validUntilString = year + month + day + hour + minutes;
        this.setState({validUntil: validUntilString});
        //1905240700
    }

    saveRegistrationData = () => {
        let id = registrationId;
        let name = this.state.name;
        let companyCode = this.state.companyCode;
        let eventCode = this.state.eventCode;
        let validUntil = this.state.validUntil;
        let publicKey = this.state.publicKey;
        let balance = this.state.totalBalance;
        let tagDeposit = this.state.tagDeposit;

        let currentdate = new Date();
        let datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        let registrationTime = datetime;

        let sync = false;
        lastRegistrationID++;
        registeredUser.push({ registrationTime: registrationTime, id: id, name: name, companyCode: companyCode, eventCode: eventCode, validUntil: validUntil, publicKey: publicKey, balance: balance, tagDeposit: tagDeposit, sync: sync });

        AsyncStorage.setItem('registeredUser', JSON.stringify(registeredUser));
        AsyncStorage.setItem('lastRegistrationID', String(lastRegistrationID));
        
        this.getRegistrationID();
        this.setState({});
    }

    componentWillUnmount() {
        if (this._stateChangedSubscription) {
            this._stateChangedSubscription.remove();
        }
    }

    writeToTag = () => {
        // let bytes = Ndef.encodeMessage([
        //     Ndef.textRecord('hello'),
        //     Ndef.textRecord('world'),
        // ]);

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
            .then(() => this.setState({ isWritingToTag: true, isWrittingFailed: false}))
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
                this.setState({ isWritingToTag: false, topUpView: false, isWrittingFailed: true  })
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

    render() {
        let { supported, enabled, tag, isWriting, parsed } = this.state;
        return (
            <View style={{ flex: 1 }}>
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

                    <StatusBar
                        backgroundColor="#EEEEEE"
                        barStyle="dark-content"
                    />

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
                            <Icon name='md-menu' size={25} color='#00bcd4' />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1 }}>

                        <Text style={{ marginVertical: 20, fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>REGISTRATION</Text>

                        <View style={{ marginHorizontal: 20, flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <View style={{ marginHorizontal: 10, flex: 1 }}>
                                <Text style={{ marginTop: 10, fontSize: 18, fontWeight: 'bold' }}>ID</Text>
                            </View>
                            <View style={{ marginHorizontal: 10, flex: 1 }}>
                                <Text style={{ marginTop: 10, fontSize: 18 }}>{this.state.id}</Text>
                            </View>
                            
                        </View>


                        <View style={{ marginHorizontal: 20, flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <View style={{ marginHorizontal: 10, flex: 1 }}>
                                <Text style={{ marginTop: 10, fontSize: 18, fontWeight: 'bold' }}>Name</Text>
                            </View>
                            <TextInput
                                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 10, flex: 1, paddingLeft: 10 }}
                                onChangeText={(text) => this.setState({ name: text })}
                                value={this.state.name}
                                maxLength={8}
                            />
                        </View>                        

                        <View style={{ marginHorizontal: 20, flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <View style={{ marginHorizontal: 10, flex: 1, marginVertical: 20 }}>
                                <Text style={{ marginTop: 10, fontSize: 18, fontWeight: 'bold' }}>Top Up</Text>
                            </View>

                            <TouchableOpacity style={{ backgroundColor: '#00bcd4', borderRadius: 3, padding: 10, marginTop: 10, marginRight: 10 }}
                                onPress={() => this.setState({ topUpView: !this.state.topUpView })}
                            >
                                <Text style={{color: '#FFFFFF'}}>Select Amount</Text>
                            </TouchableOpacity>

                        </View>

                        <Text style={{ textAlign: "center", marginTop: 10, color: '#4caf50', fontSize: 20}}>Please Select Top Up Amount</Text>

                        <Modal isVisible={this.state.isWritingToTag} style={{ justifyContent: "center", alignItems: 'center' }}>
                            <View style={{ width: 250, height: 250, backgroundColor: '#FFFFFF' }}>
                                <View style={{ backgroundColor: '#212121', height: 50, justifyContent: "center", alignItems: "center" }}>
                                    <Text style={{ color: '#FFFFFF', fontSize: 20 }}>Write on NFC Tag</Text>
                                </View>

                                <Icon name='md-phone-portrait' style={{ textAlign: "center", marginVertical: 10 }} size={70} color='#212121' />

                                <Text style={{ textAlign: "center", fontSize: 20 }}>Approach an NFC Tag</Text>

                                <TouchableOpacity
                                    onPress={() => this.cancelWriteToTag()}
                                    style={{ backgroundColor: '#f44336', margin: 5, padding: 10, marginTop: 20 }}>
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

                                <Text style={{ textAlign: "center", fontSize: 16 }}>Balance</Text>
                                <Text style={{ textAlign: "center", fontSize: 20 }}>{
                                    MaskService.toMask('money', this.state.totalBalance, {
                                        unit: 'Rp. ',
                                        separator: ',',
                                        delimiter: '.',
                                        precision: 0,
                                    })
                                }</Text>
                                <Text style={{ textAlign: "center", fontSize: 16, marginTop: 10 }}>Tag Warranty</Text>
                                <Text style={{ textAlign: "center" }}>{
                                    MaskService.toMask('money', this.state.tagDeposit, {
                                        unit: 'Rp. ',
                                        separator: ',',
                                        delimiter: '.',
                                        precision: 0,
                                    })
                                }</Text>

                                <TouchableOpacity
                                    style={{ backgroundColor: '#4caf50', margin: 5, padding: 10, marginTop: 20 }}
                                    onPress={() => { this.setState({ isWritingToTagSucess: false }) }}>
                                    <Text style={{ textAlign: "center", color: '#FFFFFF', fontSize: 18 }}>OK</Text>
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

                        <Modal isVisible={this.state.topUpView}
                        >
                            <View style={{ flex: 1, borderRadius: 3, backgroundColor: '#FFFFFF' }}>

                                <Text style={{ textAlign: "center", fontSize: 18, marginTop: 10}}> Top Up Amount </Text>

                                <View style={{flexDirection: "row", alignItems: "center", justifyContent: 'center', marginTop: 20}}>
                                    <TextInput
                                        style={{ height: 40, width: 220, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 10, marginHorizontal: 10 }}
                                        onChangeText={(text) => this.setState({ topUpAmount: text.replace(/[^0-9]/g, '') })}
                                        value={this.state.topUpAmount}
                                        keyboardType={'numeric'}
                                        maxLength={8}
                                    />
                                    <TouchableOpacity style={{ backgroundColor: '#00bcd4', padding: 10, height:40, borderRadius: 3}} onPress={() => { this.setState({ topUpAmount: String(0) }) }}>
                                        <Text style={{color: '#FFFFFF'}}>Clear</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={{ height: 250, marginTop: 10 }}>

                                    <FlatGrid
                                        itemDimension={70}
                                        items={topUpAmount}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity style={{ borderWidth: 1, borderColor: '#00bcd4', marginHorizontal: 10, paddingVertical: 10, borderRadius: 3, alignItems: 'center' }}
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

                                <TouchableOpacity style={{ marginTop: 20, marginBottom: 10, backgroundColor: '#00bcd4', paddingVertical: 10, marginHorizontal: 30, borderRadius: 3, alignItems: 'center' }}
                                    onPress={() => this._topUp()}
                                >
                                    <Text style={{ color: '#424242', color: '#FFFFFF' }}>Top Up</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ marginBottom: 20, backgroundColor: '#f44336', paddingVertical: 10, marginHorizontal: 30, borderRadius: 3, alignItems: 'center' }}
                                    onPress={() => this.setState({topUpView: false})}
                                >
                                    <Text style={{ color: '#424242', color: '#FFFFFF' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>

                    </ScrollView>
                </DrawerLayout>
            </View>
        )
    }

    topUpManagement = (amount, action) => {
        let finalAmount = 0;

        if (isNaN(parseInt(this.state.topUpAmount, 10)))
        {
            finalAmount = 0;
        }
        else{
            finalAmount = parseInt(this.state.topUpAmount, 10);
        }
        
        if (action == '+') {
            finalAmount = finalAmount + amount;
        }
        else {
            finalAmount = finalAmount - amount;
        }

        finalAmount = String(finalAmount);
        this.setState({ topUpAmount: finalAmount })
    }

    // balance 2x karena balance sama dengan last top up untuk pertama kali
    // name auto bernama guess + id

    _increment = () => {
        let increment = parseInt(this.state.increment);
        let incrementStart = parseInt(this.state.incrementStart);

        let id = parseInt(this.state.id) + parseInt(increment);
        let name = 'Guess ' + (parseInt(incrementStart) + parseInt(increment));

        incrementStart += increment;
        increment = String(increment);
        incrementStart = String(incrementStart);

        id = String(id);

        this.setState({
            id: id,
            incrementStart: incrementStart,
            name: name,
        })
    }

    _topUp = () => {
        if(this.state.topUpMethod != '')
        {
            let balance = (parseInt(this.state.balance, 10) + parseInt(this.state.topUpAmount, 10));
            balance = String(balance);
            console.warn(balance);
            this.setState({
                totalBalance: balance,
            }, this.writeToTag
            )
        }

        else {
            ToastAndroid.show(chooseTopUpMethod, ToastAndroid.SHORT);
        }
    }

    _write = () => {
        this._topUp();
    }

    _requestNdefWrite = () => {
        let { isWriting } = this.state;
        if (isWriting) {
            return;
        }

        // function pad2(n) { return n < 10 ? '0' + n : n }
        // var date = new Date();


        // dateNow = date.getFullYear().toString().substr(2, 2) + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes());
        // this.setState({
        //     regDateTime: date,
        // })

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
        this.saveRegistrationData();
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
});


export default Registration;
