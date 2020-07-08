import i18n from 'i18next';import k from "./../i18n/keys";import React, { Component } from "react";
import { TouchableWithoutFeedback, View } from 'react-native';
import { Colors, Modal, Portal } from "react-native-paper";
import { Spinner, Subtitle, Title, Button } from "@shoutem/ui";
import { sizeHeight, sizeWidth } from './Size';

export class AlertDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false };

  }

  componentDidMount() {
    const { isShow } = this.props;
    this.setState({ isShow: isShow });
  }

  onDismiss = () => {
    this.setState({ isShow: false });
    this.props.callbacks();
  };

  render() {
    const { title, content, callbacks, flexChanged = false } = this.props;
    return (
      // <Portal>
      //     <Modal
      //         onDismiss={this.onDismiss}
      //         dismissable={true}
      //         visible={this.state.isShow}
      //     >

      //     </Modal>
      // </Portal>
      this.state.isShow ? <Portal>
                <TouchableWithoutFeedback onPress={this.onDismiss}>
                    <View style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignContent: 'center',
            alignSelf: 'center',
            alignItems: 'center' }}>
            

                        <View style={{ flex: flexChanged ? 0.4 : 0.4 }}></View>
                        <View
            style={{
              flex: flexChanged ? 0.3 : 0.2,
              borderRadius: 8,
              width: '70%',
              backgroundColor: "white",
              flexDirection: 'column',
              paddingVertical: 16,
              alignSelf: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              marginHorizontal: sizeWidth(10) }}>

              

                            {title.trim().length > 0 ? <Title
              style={{
                fontSize: 18,
                fontWeight: "700",
                paddingVertical: 8,
                paddingHorizontal: 8,
                marginHorizontal: 8 }}>

                
                                {title}
                            </Title> : null}
                            
                            <Subtitle
              style={{
                fontSize: 16,
                fontWeight: "400",
                paddingHorizontal: 8,
                marginHorizontal: 8,
                marginVertical: 12 }}>

                
                                {content}
                            </Subtitle>

                            <TouchableWithoutFeedback onPress={this.onDismiss}>
                                <Subtitle
                style={{
                  fontSize: 16,
                  fontWeight: "400",
                  color: '#3DACCF',
                  paddingHorizontal: 8,
                  marginHorizontal: 8,
                  marginVertical: 8,
                  alignSelf: 'flex-end' }}>

                  
                                    {i18n.t(k._119)}
                                </Subtitle>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ flex: flexChanged ? 0.3 : 0.4 }}></View>
                    </View>
                </TouchableWithoutFeedback>
            </Portal> : null);

  }}