import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  FlatList,
  PermissionsAndroid,
  Platform
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import { MapView } from "react-native-amap3d";

export default class Pin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: 40.004849717881946,
      longitude: 116.49468560112847,
      address: undefined,
      modalVisible: false,
      pois: []
    };
    this.location = false;
    this.getAddressInfo = this.getAddressInfo.bind(this);
    this.postLocation = this.postLocation.bind(this);
  }

  async componentWillMount() {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("location permission checked");
          this.location = true;
        } else {
          console.log("location permission denied");
          this.location = false;
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log("Native GEO GOOD", position);
          this.location = true;
        },
        err => {
          console.log("Native GEO BADD", err);
          this.location = false;
        }
      );
    }
  }

  postLocation(
    longitude = this.state.longitude,
    latitude = this.state.latitude
  ) {
    if (!this.location) {
      Alert.alert("请先去设置中，打开获取定位权限");
    } else {
      longitude = parseFloat(longitude);
      latitude = parseFloat(latitude);
      // Util.post(config.api.signrecords, { longitude, latitude }, function() {
      //   Alert.alert("签到成功");
      // });
    }
  }

  getAddressInfo(longitude, latitude) {
    const that = this;
    axios
      .get(
        "https://restapi.amap.com/v3/geocode/regeo?output=json&extensions=all&batch=false&homeorcorp=2&poitype=商务写字楼|综合医院&radius=1000&key=" +
          "fd17ac88ded50551c95ddb8d13e78aaf&location=" +
          longitude +
          "," +
          latitude
      )
      .then(function(response) {
        const { regeocode } = response.data;
        console.log(regeocode);
        that.setState({
          address: regeocode.formatted_address,
          longitude,
          latitude,
          pois: regeocode.pois
        });
      });
  }

  _onDragEvent = ({ nativeEvent }) =>
    Alert.alert(`${nativeEvent.latitude}, ${nativeEvent.longitude}`);

  showAddressList = () => {
    this.setState({ modalVisible: true });
  };

  render() {
    const that = this;
    return (
      <View style={{ flex: 1, margin: 0 }}>
        <MapView
          style={{ flex: 1 }}
          showsCompass={false}
          showsIndoorMap={false}
          showsLocationButton={true}
          showsScale={true}
          showsZoomControls={true}
          locationEnabled
          zoomLevel={14}
          coordinate={{
            latitude: that.state.latitude,
            longitude: that.state.longitude
          }}
          onLocation={({ nativeEvent }) => {
            console.log(nativeEvent);
            that.setState({
              latitude: nativeEvent.latitude,
              longitude: nativeEvent.longitude
            });
            this.getAddressInfo(nativeEvent.longitude, nativeEvent.latitude);
          }}
        >
          {/* <MapView.Marker
            active
            draggable
            title="一个可拖拽的标记"
            description={this.state.time.toLocaleTimeString()}
            onDragEnd={this._onDragEvent}
            onInfoWindowPress={this._onInfoWindowPress}
            coordinate={this._coordinates[0]}
          /> */}
          {/* <MapView.Marker color="green" coordinate={this._coordinates[1]} >
            <TouchableOpacity activeOpacity={0.9} onPress={this._onInfoWindowPress}>
              <View style={styles.customInfoWindow}>
                <Text>自定义信息窗口</Text>
                <Text>{this.state.time.toLocaleTimeString()}</Text>
              </View>
            </TouchableOpacity>
          </MapView.Marker> */}
          {/* <MapView.Marker
            image="flag"
            title="自定义图片"
            onPress={this._onMarkerPress}
            coordinate={this._coordinates[2]}
          /> */}
          {/* <MapView.Marker
            title="自定义 View"
            icon={() => (
              <View style={styles.customMarker}>
                <Text style={styles.markerText}>{this.state.time.toLocaleTimeString()}</Text>
              </View>
            )}
            coordinate={this._coordinates[3]}
          /> */}
        </MapView>
        <View style={styles.panel}>
          <View style={styles.formLine}>
            {/* <Icon name="ios-compass" color="#999" 
              style={{ fontSize: relateWidth(70), 
                height:relateWidth(70), 
                marginRight: relateWidth(20),
                width: relateWidth(60) }}/> */}
            <TouchableOpacity
              style={{ flexBasis: 1, flexGrow: 1 }}
              onPress={this.showAddressList.bind(this)}
            >
              <Text style={styles.selectLabel}>{this.state.address}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                borderColor: "#999",
                borderWidth: 1,
                height: 31,
                justifyContent: "center",
                width: 46
              }}
              onPress={() => this.postLocation()}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  color: "#666"
                }}
              >
                签到
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          animationType="none"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({ modalVisible: false });
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.container}
            onPress={() => {
              this.setState({ modalVisible: false });
            }}
          >
            <View
              style={{
                backgroundColor: "#0F90C5",
                paddingHorizontal: 15,
                paddingVertical: 8
              }}
            >
              <Text style={styles.optionTitle}>点选附近地点打卡</Text>
            </View>
            <FlatList
              data={this.state.pois}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <View style={styles.addressOption}>
                  <Text style={styles.addressOptionTxt}>无匹配地点</Text>
                </View>
              }
              style={{ backgroundColor: "#fff" }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    const [long, lat, _] = item.location.split(",");
                    this.postLocation(long, lat);
                  }}
                  style={styles.addressOption}
                >
                  <Icon
                    name="ios-pin"
                    color="#999"
                    style={{
                      fontSize: 25,
                      height: 25,
                      width: 25
                    }}
                  />
                  <Text style={styles.addressOptionTxt}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  customIcon: {
    width: 40,
    height: 40
  },
  customInfoWindow: {
    backgroundColor: "#8bc34a",
    padding: 10,
    borderRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#689F38",
    marginBottom: 5
  },
  customMarker: {
    backgroundColor: "#009688",
    alignItems: "center",
    borderRadius: 5,
    padding: 5
  },
  markerText: {
    color: "#fff"
  },
  panel: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    // height: relateWidth(108),
    justifyContent: "center"
  },
  formLine: {
    margin: 15,
    flexDirection: "row",
    alignItems: "center"
  },
  selectLabel: {
    color: "#333",
    fontSize: 14
  },
  optionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600"
  },
  addressOption: {
    alignItems: "flex-end",
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 8
  },
  addressOptionTxt: {
    fontSize: 14,
    color: "#333",
    textAlign: "left"
  },
  container: {
    alignItems: "stretch",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 100
  }
});
