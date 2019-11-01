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
      selectedItem: undefined,
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
  componentDidMount() {
    this.setState({
      MATERIAL_ID: this.props.navigation.state.params.MATERIAL_ID,
      SKU: this.props.navigation.state.params.SKU,
      BARCODE: this.props.navigation.state.params.BARCODE,
      NAME: this.props.navigation.state.params.NAME,
      MERK_ID: this.props.navigation.state.params.MERK_ID,
      CATEGORY_ID: this.props.navigation.state.params.CATEGORY_ID
    });
  }
  submitData = () => {
    this.uploadPicture();
    this.setState({ loading_process: true }, () => {
      fetch(
        "https://ericwidhiantara.000webhostapp.com/stock/updateStock.php",
        {
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
        }
      )
        .then(response => response.json())
        .then(responseJsonFromServer => {
          Alert.alert(responseJsonFromServer);

          this.props.navigation.navigate("DetailStock");
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
      "https://ericwidhiantara.000webhostapp.com/sitalas/uploadFoto.php";
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
            <Title>Update Item</Title>
          </Body>
          <Right />
        </Header>

        <Content>
          <Form>
            <Item floatingLabel>
              <Label>Items ID</Label>
              <Input disabled value={this.state.MATERIAL_ID} />
            </Item>
            <Item floatingLabel>
              <Label>SKU</Label>
              <Input
                value={this.state.SKU}
                onChangeText={SKU => this.setState({ SKU })}
              />
            </Item>
            <Item>
              <Label>Barcode</Label>
              <Input
                value={this.state.BARCODE}
                onChangeText={BARCODE => this.setState({ BARCODE })}
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
              <Input
                value={this.state.NAME}
                onChangeText={NAME => this.setState({ NAME })}
              />
            </Item>
            <Item floatingLabel>
              <Label>Merk</Label>
              <Input
                value={this.state.MERK_ID}
                onChangeText={MERK_ID => this.setState({ MERK_ID })}
              />
            </Item>
            <Item floatingLabel>
              <Label>Category</Label>
              <Input
                value={this.state.CATEGORY_ID}
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
