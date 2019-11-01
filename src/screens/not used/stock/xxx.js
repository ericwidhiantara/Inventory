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
  Thumbnail
} from "native-base";

import styles from "./styles";

class Stock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      data: []
    };
  }
  componentDidMount() {
    this.setState({ ActivityIndicator_Loading: true }, () => {
      this.setState({ refreshing: true });
      const url =
        "https://ericwidhiantara.000webhostapp.com/stock/getDataStock.php";
      //this.setState({ loading: true });
      fetch(url)
        .then(response => response.json())
        .then(responseJson => {
          console.log("comp");
          console.log(responseJson);
          this.setState({
            data: responseJson,
            error: responseJson.error || null,
            loading: false,
            refreshing: false,
            ActivityIndicator_Loading: false
          });
        });
    });
    /*this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.componentDidMount.bind(this);
      }
    );*/
  }
  detail = (MATERIAL_ID) => {
    this.props.navigation.navigate("DetailStock", {
      MATERIAL_ID: MATERIAL_ID
    });
  };
  render() {
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button
              transparent
              onPress={() => this.props.navigation.openDrawer()}
            >
              <Icon name="ios-menu" />
            </Button>
          </Left>
          <Body>
            <Title>Stock Management</Title>
          </Body>
          <Right />
        </Header>

        <View style={{ flex: 1 }}>
          <Content padder>
            <List
              dataArray={this.state.data}
              renderRow={item => (
                <ListItem
                  thumbnail
                  onPress={this.detail.bind(this, item.MATERIAL_ID)}
                >
                  <Left>
                    <Thumbnail
                      square
                      source={{
                        uri:
                          "https://ericwidhiantara.000webhostapp.com/stock/img/" +
                          (item.foto ? item.foto : "no_image.png")
                      }}
                    />
                  </Left>
                  <Body>
                    <Text>{item.BARCODE}</Text>
                    <Text numberOfLines={1} note>
                      {item.NAME}
                    </Text>
                  </Body>
                  <Right>
                    <Button transparent>
                      <Text>View</Text>
                    </Button>
                  </Right>
                </ListItem>
              )}
            />
          </Content>
          <Fab
            active={this.state.active}
            direction="up"
            containerStyle={{}}
            style={{ backgroundColor: "#5067FF" }}
            position="bottomRight"
            onPress={() => this.props.navigation.navigate("AddStock")}
          >
            <IconNB name="md-add" />
          </Fab>
        </View>
      </Container>
    );
  }
}

export default Stock;
