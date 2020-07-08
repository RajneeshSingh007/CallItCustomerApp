import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  StyleSheet,
} from 'react-native';
import {
  Card,
} from 'react-native-paper';
import {
  View,
  Image,
  Row,
  Subtitle,
  Title,
  TouchableOpacity,
} from '@shoutem/ui';
import * as Pref from './../util/Pref';
import * as Lodash from 'lodash';
import {sizeHeight, sizeWidth} from '../util/Size';


const AccordItem = props => {
  const {index, eachTabData, clickedItem = () => {},priceStyle} = props;

  onPressItem = () => {
    clickedItem(eachTabData, index);
  };

  return (
    <View>
      {index === 0 ? <View style={styles.listserviceItemDivider} /> : null}
      <TouchableOpacity styleName="flexible" onPress={onPressItem}>
        <Row styleName="vertical">
          <Card elevation={4} style={styles.serviceImageCard}>
            <Image
              source={{
                uri: `${Pref.BASEURL}${eachTabData.imageUrl}`,
              }}
              style={styles.serviceImage}
            />
          </Card>
          <View styleName="vertical">
            <View styleName="horizontal space-between">
              <Title styleName="bold" style={styles.servicetitle}>
                {Lodash.capitalize(eachTabData.name)}
              </Title>
              <Title
                styleName="bold"
                style={priceStyle}>
                {eachTabData.available === 1
                  ? `${i18n.t(k._6)}${eachTabData.price}`
                  : i18n.t(k._63)}
              </Title>
            </View>
            <View styleName="horizontal space-between">
              <Subtitle styleName="multiline" style={styles.servicedesc}>
                {Lodash.capitalize(eachTabData.description)}
              </Subtitle>
            </View>
          </View>
        </Row>
      </TouchableOpacity>
    </View>
  );
};

export default AccordItem;



const styles = StyleSheet.create({
  servicedesc: {
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  servicetitle: {
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  serviceImage: {
    width: 65,
    height: 65,
    borderTopEndRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopStartRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomStartRadius: 8,
    borderBottomEndRadius: 8,
    borderBottomLeftRadius: 8,
  },
  serviceImageCard: {
    marginEnd: sizeWidth(4),
    width: 65,
    height: 65,
    borderTopRightRadius: 8,
    borderTopStartRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomStartRadius: 8,
    borderBottomEndRadius: 8,
    borderBottomLeftRadius: 8,
  },
  listserviceItemDivider: {
    backgroundColor: '#d9d9d9',
    height: 1,
  },
  listserviceacc: {paddingVertical: sizeHeight(1.5)},
  listservicedivider: {
    height: 1,
    backgroundColor: '#dedede',
  },
  listService: {
    fontFamily: i18n.t(k.RUBIK),
    fontSize: 16,
    fontWeight: i18n.t(k._31),
    lineHeight: 20,
    marginStart: sizeWidth(3),
  },
  triangleCorner: {
    position: i18n.t(k.ABSOLUTE),
    right: 0,
    height: sizeHeight(10),
    borderStyle: 'solid',
    borderRightWidth: sizeWidth(16),
    borderBottomWidth: sizeHeight(10),
    borderRightColor: 'red',
    borderBottomColor: 'transparent',
    borderTopEndRadius: 8,
  },

  inputStyle: {
    borderRadius: 2,
    borderColor: i18n.t(k.DEDEDE1),
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: i18n.t(k.FFFFFF),
    color: i18n.t(k._57),
    fontFamily: i18n.t(k.RUBIK),
    fontSize: 24,
    height: 56,
    marginBottom: sizeHeight(2),
    marginHorizontal: sizeWidth(8),
    fontWeight: i18n.t(k._58),
  },

  buttonStyle: {
    //position:'absolute',
    //flex:1,
    width: i18n.t(k._5),
    height: 48,
    alignItems: i18n.t(k.CENTER),
    backgroundColor: i18n.t(k.DACCF),
    borderRadius: 0,
    alignSelf: i18n.t(k.CENTER),
    justifyContent: i18n.t(k.CENTER),
  },
});
