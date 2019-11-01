import React, { Component } from "react";
import { ImageBackground, View, StatusBar } from "react-native";
import { Container, Button, H3, Text, Header, Content,Left,Right,Body, Icon, Title } from "native-base";

import styles from "./styles";

class Home extends Component {
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
            <Title>Welcome</Title>
          </Body>
          <Right />
        </Header>

        <Content padder>
          <Text>Welcome</Text>
        </Content>
      </Container>
    );
  }
}

export default Home;
