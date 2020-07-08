import i18n from 'i18next';import k from "./../i18n/keys";import React, { Component } from "react";
import { Colors, Modal, Portal } from "react-native-paper";
import { Spinner, Subtitle } from "@shoutem/ui";
import { View, TouchableWithoutFeedback } from 'react-native';
import { sizeHeight, sizeWidth, sizeFont } from './../util/Size';

export class Loader extends Component {

  render() {
    return (
      this.props.isShow ? <Portal>
          <View style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignContent: 'center',
          alignSelf: 'center',
          alignItems: 'center' }}>
          

            <View style={{ flex: 0.4 }}></View>
            <View
          style={{
            flex: 0.2,
            alignSelf: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            backgroundColor: "white",
            width: '40%',
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center" }}>

            
              <Spinner
            size="large"
            style={{
              margin: 8 }}

            color={'#3daccf'} />
            
              <Subtitle
            style={{
              fontSize: 20,
              fontWeight: "200",
              paddingTop: 8 }}>

              {`${i18n.t(k._47)}`}</Subtitle>
            </View>
            <View style={{ flex: 0.4 }}></View>
          </View>
      </Portal> : null
      // <Portal>
      //   <Modal
      //     onDismiss={this.props.isShow}
      //     dismissable={false}
      //     visible={this.props.isShow}
      //   >
      //     <View
      //       style={{
      //         borderRadius: 8,
      //         backgroundColor: "white",
      //         padding: 24,
      //         alignSelf: "center",
      //         alignItems: "center",
      //         justifyContent: "center"
      //       }}
      //     >
      // <Spinner
      //   size="large"
      //   style={{
      //     margin: 8
      //   }}
      //   color={'#3daccf'}
      // />
      // <Subtitle
      //   style={{
      //     fontSize: 20,
      //     fontWeight: "200"
      //   }}
      // >{`אנא המתן...`}</Subtitle>
      //     </View>
      //   </Modal>
      // </Portal>
    );
  }}