import React, { Component } from "react";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Item,
  Label,
  Input,
  Body,
  Left,
  Right,
  Icon,
  Form,
  Text,
  View,
  Thumbnail, 
  Picker
} from "native-base";
import { Image, Alert, Modal } from "react-native";
import styles from "./styles";
import ImagePicker from "react-native-image-picker";
import QRCodeScanner from "react-native-qrcode-scanner";

class FloatingLabel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      MATERIAL_ID: "",
      SKU: "",
      BARCODE: "",
      NAME: "",
      MERK_ID: "",
      CATEGORY_ID: "",
      image: "",
      srcImg: "",
      uri: "",
      fileName: "",
      hidePassword: true,
      ModalVisibleStatus: false
    };
  }
  ShowModalFunction(visible) {
    this.setState({ ModalVisibleStatus: visible });
  }
  onSuccess(e) {
    this.setState({
      BARCODE: e.data
    });
    this.ShowModalFunction(!this.state.ModalVisibleStatus);
  }
  submitData = () => {
    this.uploadPicture();
    this.setState({ loading_process: true }, () => {
      fetch("https://ericwidhiantara.000webhostapp.com/stock/addStock.php", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          MATERIAL_ID: this.state.MATERIAL_ID,
          SKU: this.state.SKU,
          BARCODE: this.state.BARCODE,
          NAME: this.state.NAME,
          MERK_ID: this.state.MERK_ID,
          CATEGORY_ID: this.state.CATEGORY_ID
        })
      })
        .then(response => response.json())
        .then(responseJsonFromServer => {
          Alert.alert("SUCESS", responseJsonFromServer);

          this.props.navigation.navigate("Stock");
        })
        .catch(error => {
          console.error(error);

          this.setState({ loading_process: false });
        });
    });
  };
  submitAllData = () => {
    this.submitData();
  };

  choosePicture = () => {
    console.log("upload");
    var ImagePicker = require("react-native-image-picker");
    var options = {
      title: "Pilih Gambar",
      storageOptions: {
        skipBackup: true,
        path: "images"
      }
    };

    ImagePicker.showImagePicker(options, response => {
      console.log("Response = ", response);
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        let source = { uri: response.uri };
        console.log(source);
        console.log(response.fileName);
        this.setState({
          srcImg: source,
          uri: response.uri,
          fileName: response.fileName,
          image: response.fileName
        });
      }
    });
  };

  uploadPicture = () => {
    console.log("mulai upload");
    this.setState({ loading: true });

    const data = new FormData();
    //data.append('name', 'Fotoku'); // you can append anyone.
    data.append("fileToUpload", {
      uri: this.state.uri,
      type: "image/jpeg", // or photo.type
      name: this.state.fileName
    });
    const url =
      "https://ericwidhiantara.000webhostapp.com/stock/uploadFoto.php";
    fetch(url, {
      method: "post",
      body: data
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        this.setState({
          loading: false
        });
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
            <Title>Add Item</Title>
          </Body>
          <Right />
        </Header>

        <Content>
          <Body>
            <Item>
              <Label>Image</Label>
            </Item>
            <View
              style={{
                flex: 1,
                marginBottom: 35,
                marginTop: 45,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Button
                large
                transparent
                onPress={this.choosePicture.bind(this)}
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
                  {this.state.srcImg === null ? (
                    <Icon name="camera" />
                  ) : (
                    <Image
                      source={this.state.srcImg}
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
                  )}
                </View>
              </Button>
            </View>
          </Body>
          <Form>
            <Item floatingLabel>
              <Label>Items ID</Label>
              <Input
                onChangeText={MATERIAL_ID => this.setState({ MATERIAL_ID })}
              />
            </Item>
            <Item floatingLabel>
              <Label>SKU</Label>
              <Input onChangeText={SKU => this.setState({ SKU })} />
            </Item>
            <Item>
              <Label>Barcode </Label>
              <Input
                onChangeText={BARCODE => this.setState({ BARCODE })}
                value={this.state.BARCODE}
              />
              <Button
                onPress={() => {
                  this.ShowModalFunction(true);
                }}
              >
                <Icon active name="md-qr-scanner" />
              </Button>
              <Modal
                transparent={false}
                animationType={"slide"}
                visible={this.state.ModalVisibleStatus}
                onRequestClose={() => {
                  this.ShowModalFunction(!this.state.ModalVisibleStatus);
                }}
              >
                <View
                  style={{
                    flex: 0,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <View style={styles.ModalInsideView}>
                    <QRCodeScanner
                      onRead={this.onSuccess.bind(this)}
                      reactivate={true}
                      showMarker={true}
                    />
                    <Button
                      title="Click Here To Hide Modal"
                      onPress={() => {
                        this.ShowModalFunction(
                          !this.state.ModalVisibleStatus
                        );
                      }}
                    />
                  </View>
                </View>
              </Modal>
            </Item>
            <Item floatingLabel>
              <Label>Name</Label>
              <Input onChangeText={NAME => this.setState({ NAME })} />
            </Item>
            <Item floatingLabel>
              <Label>Merk</Label>
              <Input onChangeText={MERK_ID => this.setState({ MERK_ID })} />
            </Item>
            <Item floatingLabel>
              <Label>Category </Label>
              <Input
                onChangeText={CATEGORY_ID => this.setState({ CATEGORY_ID })}
              />
            </Item>
          </Form>
          <Button
            block
            style={{ margin: 15, marginTop: 50 }}
            onPress={this.submitAllData}
          >
            <Text>Submit</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

export default FloatingLabel;
