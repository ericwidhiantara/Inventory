import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView, TouchableOpacity, CheckBox, ImageBackground, TextInput, Image, Dimensions, StatusBar} from 'react-native';
import GridView from 'react-native-super-grid';
import { FlatGrid } from 'react-native-super-grid';
import Icon from 'react-native-vector-icons/Ionicons';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';
import AsyncStorage from '@react-native-community/async-storage';

type Props = {};

let serverAddress = '';
let severPort = '';
let adminId = '';
let adminPassword = '';

export default class App extends Component<Props> {
  static navigationOptions = {
      header: null
  }
  constructor(props) {
    super(props);
    this.state = { 
      serverAddress: 'http://api.dimatahanoman.com',
      serverPort: '',
      adminId: '',
      adminPassword: '',
    };
  }

  componentDidMount() {
    serverAddress = 'http://';
    severPort = '';
    adminId = '';
    adminPassword = '';
  }

  saveData = () => {
    AsyncStorage.setItem('serverAddress', String(this.state.serverAddress));
    AsyncStorage.setItem('serverPort', String(this.state.serverPort));
    AsyncStorage.setItem('adminId', String(this.state.adminId));
    AsyncStorage.setItem('adminPassword', String(this.state.adminPassword));
    this.navigate();
  }

  navigate = () => {
    this.props.navigation.navigate('Login')
  }

  render() {
    return (

      <View style={styles.container}>

          <StatusBar
             backgroundColor="#EEEEEE"
             barStyle="dark-content"
           />

          <View style={styles.header}>
           <TouchableOpacity style={{height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 15}}
           >
           </TouchableOpacity>
           <View style={{flex: 1, alignItems: 'center'}}>
              <Image source={require('../../src/images/FINNS.jpeg')} style={{width: 130, height: 130}} resizeMode='contain'/>
           </View>
          <View style={{height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15}}>
          </View>
         </View>

          <Text style={{ fontSize: 32, textAlign: 'center', marginVertical: 20, fontWeight: 'bold', color: '#00bcd4'}}>System Configuration</Text>

         <TextInput
            style={{height: 50, backgroundColor: '#FFFFFF', textAlign: 'left', borderWidth: 1, marginTop: 10, marginHorizontal: 20, paddingLeft: 10}}
            placeholder='Server IP/Domain with Port'
            autoCapitalize='none'
            onChangeText={(text) => this.setState({ serverAddress: text })}
            value={this.state.serverAddress}
         />
         <TextInput
            style={{height: 50, backgroundColor: '#FFFFFF', textAlign: 'left', borderWidth: 1, marginTop: 10, marginHorizontal: 20, paddingLeft: 10}}
            placeholder='Apps License Nr'
            autoCapitalize='none'
         />
        <TouchableOpacity style={styles.button} onPress={() => this.saveData()}>
           <View style={styles.buttonTextContainer}>
             <Text style={styles.buttonText}> Save & Connect </Text>
           </View>
         </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header:{
    height: 54,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#bdbdbd',
    borderBottomWidth: 1,
    flexDirection: 'row'
  },
  button: {
    height: 50,
    borderRadius: 3,
    marginHorizontal: 20,
    flexDirection: 'row',
    marginTop: 10,
    borderRadius: 3
  },
  loginButton: {
    height: 50,
    borderRadius: 3,
    marginHorizontal: 20,
    flexDirection: 'row',
    marginTop: 10,
    borderWidth: 1,
  },
  loginImage: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonImage: {
    height: 50,
    width: 50,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00bcd4',
    borderRadius: 3
  },
  buttonLoginTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold'
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
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    height:70,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardText: {
    fontSize: 22,
    marginLeft: 20,
    color: '#FFFFFF'
  },
  gridView: {
    paddingVertical: 25,
    flex: 1,
  },
});
