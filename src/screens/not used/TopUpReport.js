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

var topUpTransaction = []

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
        AsyncStorage.getItem('topUpTransaction', (err, result) => {
            if (!err && result != null) {
                topUpTransaction = JSON.parse(result);
                this.setState({});
            }
        });
    }

    countTotalTopUp = () => {
        let total = 0;
        for (let i = 0; i < Object.keys(topUpTransaction).length; i++) {
            total += parseInt(topUpTransaction[i].topUpAmount, 10);
        }
        return total;
    }

    countAverageTopUp = () => {
        let total = 0;
        for (let i = 0; i < Object.keys(topUpTransaction).length; i++) {
            total += parseInt(topUpTransaction[i].topUpAmount, 10);
        }

        return (total / Object.keys(topUpTransaction).length);
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

                    <Text style={{ textAlign: "center", marginTop: 10, fontSize: 22, fontWeight: 'bold' }}>TOP UP REPORT</Text>
                    <Text style={{ marginLeft: 40, marginTop: 30, fontSize: 18 }}><Text style={{ fontWeight: 'bold' }}>Top Up Count : </Text>{Object.keys(topUpTransaction).length}</Text>
                    <Text style={{ marginLeft: 40, marginTop: 20, fontSize: 18 }}><Text style={{ fontWeight: 'bold' }}>Total Top Up : </Text>{
                        
                        
                        MaskService.toMask('money', parseInt(this.countTotalTopUp()), {
                        unit: 'Rp. ',
                        separator: ',',
                        delimiter: '.',
                        precision: 0,
                      })
                    
                    }</Text>
                    <Text style={{ marginLeft: 40, marginTop: 20, fontSize: 18 }}><Text style={{ fontWeight: 'bold' }}>Average Top Up : </Text>
                    
                    {

                        MaskService.toMask('money', parseInt(this.countAverageTopUp()), {
                        unit: 'Rp. ',
                        separator: ',',
                        delimiter: '.',
                        precision: 0,
                      })
                    
                    }
                    
                    </Text>
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