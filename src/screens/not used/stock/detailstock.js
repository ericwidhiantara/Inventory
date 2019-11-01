import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Text,
  Button,
  Icon,
  Footer,
  FooterTab,
  Left,
  Right,
  Body,
  Fab,
  IconNB,
  View,
  List,
  ListItem,
  Thumbnail,
  Card,
  CardItem,
  Item,
  Label,
  ActionSheet
} from "native-base";
import { Image, Alert } from "react-native";
import styles from "./styles";
var BUTTONS = [
  { text: "Update", icon: "md-add", iconColor: "#25de5b" },
  { text: "Delete", icon: "trash", iconColor: "#fa213b" },
  { text: "Cancel", icon: "close", iconColor: "#25de5b" }
];
var DESTRUCTIVE_INDEX = 1;
var CANCEL_INDEX = 2;
class DetailStock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      data: [],
      MATERIAL_ID: ""
    };
  }
  componentDidMount() {
    this.setState(
      {
        ActivityIndicator_Loading: true,
        MATERIAL_ID: this.props.navigation.state.params.MATERIAL_ID
      },
      () => {
        fetch(
          "https://ericwidhiantara.000webhostapp.com/stock/getDetailStock.php",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              MATERIAL_ID: this.state.MATERIAL_ID
            })
          }
        )
          .then(response => response.json())
          .then(responseJson => {
            console.log("Data didapat", responseJson);
            this.setState({
              data: responseJson,
              error: responseJson.error || null,
              loading: false,
              refreshing: false,
              ActivityIndicator_Loading: false
            });
          })
          .catch(error => {
            console.error(error);
            this.setState({
              ActivityIndicator_Loading: false
            });
          });
      }
    );
  }
  update = (nim) => {
    this.props.navigation.navigate("UpdateStock", {
      nim: nim
    });
  };
  render() {
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>Stock Details</Title>
          </Body>
          <Right />
        </Header>

        <View style={{ flex: 1 }}>
          <Content padder>
            <List
              dataArray={this.state.data}
              renderRow={item => (
                <ListItem>
                  <Body>
                    <View
                      style={{
                        flex: 1,
                        marginBottom: 25,
                        marginTop: 25,
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <View
                        style={{
                          borderRadius: 5,
                          width: 150,
                          height: 150,
                          borderColor: "#000",
                          borderWidth: 1,
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <Image
                          source={{
                            uri:
                              "https://ericwidhiantara.000webhostapp.com/stock/img/" +
                              (item.foto ? item.foto : "no_image.png")
                          }}
                          style={{
                            borderRadius: 5,
                            width: 150,
                            height: 150,
                            borderColor: "#000",
                            borderWidth: 1,
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        />
                      </View>
                    </View>
                  </Body>
                </ListItem>
              )}
            />
            <List
              dataArray={this.state.data}
              renderRow={item => (
                <ListItem>
                  <Body>
                    <Card>
                      <CardItem header bordered>
                        <Text>Stock Details</Text>
                      </CardItem>
                      <CardItem header bordered>
                        <Body>
                          <Text>Item ID</Text>
                        </Body>
                        <Right>
                          <Text>{item.MATERIAL_ID}</Text>
                        </Right>
                      </CardItem>
                      <CardItem header bordered>
                        <Body>
                          <Text>SKU</Text>
                        </Body>
                        <Right>
                          <Text>{item.SKU}</Text>
                        </Right>
                      </CardItem>
                      <CardItem header bordered>
                        <Body>
                          <Text>Barcode</Text>
                        </Body>
                        <Right>
                          <Text>{item.BARCODE}</Text>
                        </Right>
                      </CardItem>
                      <CardItem header bordered>
                        <Body>
                          <Text>Item Name</Text>
                        </Body>
                        <Right>
                          <Text>{item.NAME}</Text>
                        </Right>
                      </CardItem>
                      <CardItem header bordered>
                        <Body>
                          <Text>Merk</Text>
                        </Body>
                        <Right>
                          <Text>{item.MERK_ID}</Text>
                        </Right>
                      </CardItem>
                      <CardItem header bordered>
                        <Body>
                          <Text>Category</Text>
                        </Body>
                        <Right>
                          <Text>{item.CATEGORY_ID}</Text>
                        </Right>
                      </CardItem>
                    </Card>
                  </Body>
                </ListItem>
              )}
            />
            <Body>
              <Button
                onPress={() =>
                  ActionSheet.show(
                    {
                      options: BUTTONS,
                      cancelButtonIndex: CANCEL_INDEX,
                      destructiveButtonIndex: DESTRUCTIVE_INDEX,
                      title: "Select an Options"
                    },
                    buttonIndex => {
                      if (buttonIndex === 0) {
                        this.props.navigation.navigate("UpdateStock", {
                          MATERIAL_ID: this.state.data[0].MATERIAL_ID,
                          SKU: this.state.data[0].SKU,
                          BARCODE: this.state.data[0].BARCODE,
                          NAME: this.state.data[0].NAME,
                          MERK_ID: this.state.data[0].MERK_ID,
                          CATEGORY_ID: this.state.data[0].CATEGORY_ID,
                        });
                      } else if (buttonIndex === 1) {
                        Alert.alert(
                          "Delete Items",
                          "Are you sure to delete " +
                            this.state.data[0].NAME +
                            " ?",
                          [
                            {
                              text: "Cancel",
                              onPress: () => console.log("Cancel pressed"),
                              style: "cancel"
                            },
                            {
                              text: "OK",
                              onPress: () =>
                                this.setState({ Loading: true }, () => {
                                  fetch(
                                    "https://ericwidhiantara.000webhostapp.com/stock/deleteStock.php",
                                    {
                                      method: "POST",
                                      headers: {
                                        Accept: "application/json",
                                        "Content-Type": "application/json"
                                      },
                                      body: JSON.stringify({
                                        MATERIAL_ID: this.state.data[0].MATERIAL_ID
                                      })
                                    }
                                  )
                                    .then(response => response.json())
                                    .then(responseJsonFromServer => {
                                      Alert.alert(responseJsonFromServer);
                                      this.props.navigation.navigate(
                                        "Stock"
                                      );
                                    })
                                    .catch(error => {
                                      console.error(error);
                                      this.setState({ Loading: false });
                                    });
                                })
                            }
                          ],
                          { cancelable: true }
                        );
                      }
                    }
                  )
                }
              >
                <Text>Options</Text>
              </Button>
            </Body>
          </Content>
      </View>
      </Container>
    );
  }
}

export default DetailStock;
