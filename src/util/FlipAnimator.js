import i18n from 'i18next';
import k from './../i18n/keys';
import React, {
  Component,
  PureComponent,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {Title, Subtitle} from '@shoutem/ui';

/***
 * Rajneesh singh
 * 17-06-2020
 */
const FlipAnimator = props => {
  const {showText, animatedValue, loadingImage, visibilty, center} = props;

  const interpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const rotateYImage = {
    transform: [{rotateY: interpolate}],
  };

  return (
    visibilty === false ? center :
    <View style={styles.MainContainer}>
      <View style={{flex: showText ? 0.3 : 0.35}} />
      <View style={{flex: showText ? 0.4 : 0.3}}>
        <View style={styles.imageStyleContainer}>
          <Animated.Image
            source={loadingImage}
            style={[rotateYImage, styles.imageStyle]}
          />
          {showText ? (
            <Subtitle styleName="bold" style={styles.gpsText}>{`${i18n.t(
              k.GPS1,
            )}`}</Subtitle>
          ) : null}
        </View>
      </View>
      <View style={{flex: showText ? 0.3 : 0.35}} />
    </View>
  );
};

export default FlipAnimator;

const styles = StyleSheet.create({
  gpsText: {
    color: '#3daccf',
    fontFamily: 'Rubik',
    backgroundColor: 'white',
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 15,
  },
  MainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
    height: '100%',
  },
  imageStyleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
      },
      default: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: {height: 96, width: 96},
        shadowOpacity: 1,
        shadowRadius: 16,
      },
    }),
  },
  imageStyle: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
});
