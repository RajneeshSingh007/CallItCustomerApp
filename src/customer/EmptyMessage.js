import i18n from 'i18next';
import k from './../i18n/keys';
import React, {Component} from 'react';
import {View} from 'react-native';
import {Image, Subtitle, Caption, Title, Heading} from '@shoutem/ui';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';

export class EmptyMessage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.props.message !== '' ? (
      <View
        style={{
          flexDirection: 'column',
          //flex: 1,
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

          <View style={{flex:0.7}}></View>
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
            fontWeight: '400',
            alignSelf: 'center',
            justifyContent: 'center',
          }}>
          {this.props.message}
        </Caption>
      </View>
    ) : null;
  }
}
