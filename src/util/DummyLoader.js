import React, {Component, useRef, useState, useEffect} from 'react';
import {Portal} from 'react-native-paper';
import FlipAnimator from './FlipAnimator';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';

/***
 * Rajneesh singh
 * 17-06-2020
 */

const DummyLoader = props => {
  const {visibilty, center, showText = false} = props;
  if (visibilty === false) {
    return <View>{center}</View>;
  } else {
    //console.log(`d`)
    const [loadingImage, setLoadingImage] = useState(
      require('../res/images/front.png'),
    );
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [value, setValue] = useState(0);
    useEffect(() => {
      let intervalRef = setInterval(() => {
        if (value >= 90) {
          setLoadingImage(require('../res/images/back.png'));
          Animated.spring(animatedValue, {
            toValue: 0,
            tension: 10,
            friction: 8,
          }).start();
        } else {
          setLoadingImage(require('../res/images/front.png'));
          Animated.spring(animatedValue, {
            toValue: 180,
            tension: 10,
            friction: 8,
          }).start();
        }
      }, 60);
      const listerner = animatedValue.addListener(({value}) => setValue(value));
      return () => {
        clearInterval(intervalRef);
        animatedValue.removeAllListeners();
        intervalRef = null;
      };
    }, [value]);

    return (
      <Portal>
        <FlipAnimator
          animatedValue={animatedValue}
          loadingImage={loadingImage}
          showText={showText}
          visibilty={visibilty}
          center={center}
        />
      </Portal>
    );
  }
};

export default DummyLoader;
