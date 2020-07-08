import i18n from 'i18next';import k from "./../i18n/keys";import React, { Component } from "react";
import { TouchableWithoutFeedback, View, Platform } from 'react-native';
import { Colors, Modal, Portal } from "react-native-paper";
import { Spinner, Subtitle, Title, Button } from "@shoutem/ui";
import { sizeHeight, sizeWidth } from './Size';

export class CustomToast extends Component {
  // constructor(props) {
  //     super(props);
  //     this.state = {
  //         isShow: false,
  //     }
  // }

  // componentDidMount() {
  //     const { isShow } = this.props;
  //     this.setState({ isShow: isShow });
  // }

  onDismiss = () => {
    this.props.callbacks();
  };

  render() {
    const { title, content, callbacks, isShow } = this.props;
    return (
      isShow ? <Portal>
                <TouchableWithoutFeedback onPress={this.onDismiss}>
                    <View style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            flex: 10,
            flexDirection: 'column' }}>
            

                        <View style={{ flex: 8.1 }}></View>
                        <View
            style={{
              //flex: 1,
              width: '100%',
              height: 56,
              backgroundColor: '#3DACCF',
              flexDirection: 'row',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderColor: '#dedede',
              borderTopColor: '#dedede',
              borderWidth: 0.5 }}>

              
                            <Subtitle
              style={{
                fontSize: 16,
                fontWeight: "400",
                paddingHorizontal: 8,
                marginHorizontal: 8,
                color: 'white' }}>

                
                                {content}
                            </Subtitle>

                            <TouchableWithoutFeedback onPress={this.onDismiss}>
                                <Subtitle
                style={{
                  fontSize: 16,
                  fontWeight: "400",
                  color: '#292929',
                  paddingHorizontal: 8,
                  marginHorizontal: 8 }}>

                  
                                    {i18n.t(k._119)}
                                </Subtitle>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ flex: 0.9 }}></View>
                    </View>
                </TouchableWithoutFeedback>
            </Portal> : null);

  }}