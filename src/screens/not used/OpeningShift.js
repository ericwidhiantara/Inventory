import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground, TextInput, Image, Dimensions, StatusBar} from 'react-native';
import GridView from 'react-native-super-grid';
import { FlatGrid } from 'react-native-super-grid';
import Icon from 'react-native-vector-icons/Ionicons';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';



type Props = {};
export default class App extends Component<Props> {
  static navigationOptions = {
      header: null
  }

  renderDrawer = () => {
    return (
      <View style={styles.drawerContainer}>

        <TouchableOpacity style={[styles.drawerMenuContainer, {marginTop: 10}]}
          onPress={() => this.drawerMenuNavigation('Home')}
        >
          <View style={styles.drawerIconContainer} >
            <Icon name='md-home' size={25} color='#616161' />
          </View>
          <Text style={styles.drawerText}>Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerMenuContainer}
          onPress={() => this.drawerMenuNavigation('Settings')}
        >
          <View style={styles.drawerIconContainer}>
            <Icon name='md-settings' size={25} color='#616161' />
          </View>
          <Text style={styles.drawerText}>Pengaturan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerMenuContainer}
          onPress={() => this.drawerMenuNavigation('About')}
        >
          <View style={styles.drawerIconContainer}>
            <Icon name='md-information-circle' size={25} color='#616161'/>
          </View>
          <Text style={styles.drawerText}>Tentang</Text>
        </TouchableOpacity>

      </View>
    );
  };

  drawerMenuNavigation = (route) => {
    this.drawer.closeDrawer();
    this.props.navigation.navigate(route);
  }

  render() {
    const items = [
      { menu: '#30', image: require('../../src/images/beerIcon.jpg')},
      { menu: '#35', image: require('../../src/images/beer2Icon.jpg')},
      { menu: '#40', image: require('../../src/images/cocacolaIcon.png')},
      { menu: '#45', image: require('../../src/images/beerIcon.jpg')},
      { menu: '#50', image: require('../../src/images/beer2Icon.jpg')},
    ];
    return (

      <View style={styles.container}>
        <DrawerLayout
          ref={drawer => {
            this.drawer = drawer;
          }}
          drawerWidth={250}
          drawerPosition={DrawerLayout.positions.Right}
          drawerType='front'
          drawerBackgroundColor="#FFF"
          renderNavigationView={this.renderDrawer}>

          <StatusBar
             backgroundColor="#EEEEEE"
             barStyle="dark-content"
           />

          <View style={styles.header}>
           <TouchableOpacity style={{height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 15}}
           >
              <Icon name='md-arrow-back' size={25} color='#616161'/>
           </TouchableOpacity>
           <View style={{flex: 1, alignItems: 'center'}}>
              <Image source={require('../../src/images/FINNS.jpeg')} style={{width: 100, height: 100}} resizeMode='contain'/>
           </View>
           <TouchableOpacity style={{height: 25, width: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15}} onPress={()=>this.drawer.openDrawer()}>
             <Icon name='md-menu' size={25} color='#FF5722' />
           </TouchableOpacity>
         </View>

         <Text style={{fontSize: 32, textAlign: 'center', marginVertical: 10, color: '#f44336'}}>Opening Shift</Text>


          <View style={styles.container}>

          <FlatGrid
            itemDimension={300}
            items={items}
            style={styles.gridView}


            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cardContainer}>
                <View style={{height: 70, width: 70, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center'}}>
                  <Image source={item.image} style={{width: 50, height: 50}} resizeMode='contain'/>
                </View>

                <View style={{flex: 1}}>
                    <Text style={styles.cardText}>{item.menu}</Text>
                </View>

                <TouchableOpacity style={{height: 50, width: 130, borderWidth: 1, borderRadius: 3, marginRight: 10,borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{fontSize: 18, color: '#FFFFFF'}}>Order Stock</Text>
                </TouchableOpacity>

              </TouchableOpacity>
            )}
          />
                  <View style={{backgroundColor: '#616161', marginHorizontal: 20, marginTop: 10, paddingBottom: 10, borderRadius: 3}}>
                    <TouchableOpacity style={styles.loginButton}>
                      <View style={styles.loginImage}>
                        <Icon name='md-person' size={40} color='#FFFFFF'/>
                      </View>
                      <View style={styles.buttonLoginTextContainer}>
                        <TextInput
                           style={{height: 40, width: 220, backgroundColor: '#FFFFFF', textAlign: 'center'}}
                           placeholder='Supervisor ID'
                        />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton}>
                      <View style={styles.loginImage}>
                        <Icon name='md-key' size={40} color='#FFFFFF'/>
                      </View>
                      <View style={styles.buttonLoginTextContainer}>
                        <TextInput
                           style={{height: 40, width: 220, backgroundColor: '#FFFFFF', textAlign: 'center'}}
                           placeholder='Password'
                        />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={[styles.button, {marginHorizontal: 20, marginBottom: 10}]}
              onPress={() => this.props.navigation.pop()}
                  >
                    <View style={styles.buttonImage}>
                      <Image source={require('../../src/images/shiftIcon.png')} style={{width: 50, height: 50}} resizeMode='contain'/>
                    </View>
                    <View style={styles.buttonTextContainer}>
                      <Text style={styles.buttonText}> Open Shift </Text>
                    </View>
                  </TouchableOpacity>

          </View>
        </DrawerLayout>
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
    marginHorizontal: 10,
    flexDirection: 'row',
    marginTop: 10
  },
  loginButton: {
    height: 50,
    borderRadius: 3,
    marginHorizontal: 10,
    flexDirection: 'row',
    marginTop: 10
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
    backgroundColor: '#FFC107'
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  drawerMenuContainerActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  drawerIconContainer: {
    width: 30,
    marginRight: 20
  },
  drawerText: {
    fontSize: 16,
  },
  drawerTextActive: {
    fontSize: 16,
    color: '#FF5722',
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
