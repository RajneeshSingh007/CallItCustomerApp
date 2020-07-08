import i18n from 'i18next';import k from "./../i18n/keys";import React, { Component } from "react";
import { Image, Subtitle, View, Caption, Title, Heading } from "@shoutem/ui";
import { sizeHeight, sizeWidth, sizeFont } from './../util/Size';

export class EmptyMessage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      this.props.message !== "" ?
      <View
      styleName="vertical wrap sm-gutter"
      style={{
        flexDirection: 'column',
        flex: 0.9,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: 'wrap' }}>

        
          {/* <Image 
            styleName="small"
            source={this.props.name}
            tintColor={'#292929'}
            style={{padding:4,width:48, height:48}}
           /> */}

          <Caption
        style={{
          fontFamily: 'Rubik',
          fontSize: 15,
          marginVertical: sizeHeight(1.5),
          fontWeight: "400",
          alignSelf: 'center' }}>

          
            {this.props.message}
          </Caption>
        </View> :
      null);

  }}