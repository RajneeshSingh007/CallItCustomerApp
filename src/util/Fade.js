import React, {Component} from 'react';
import {Animated} from 'react-native';
import * as Animatable from 'react-native-animatable';

export default class Fade extends React.PureComponent {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     visible: props.visible,
  //   };
  // }

  // componentWillMount() {
  //   this._visibility = new Animated.Value(this.props.visible ? 1 : 0);
  // }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.visible) {
  //     this.setState({visible: true});
  //   }
  //   Animated.timing(this._visibility, {
  //     toValue: nextProps.visible ? 1 : 0,
  //     duration: 1,
  //     useNativeDriver:true
  //   }).start(() => {
  //     this.setState({visible: nextProps.visible});
  //   });
  // }

  render() {
    const {visible, style, children, ...rest} = this.props;

    // const containerStyle = {
    //   opacity: this._visibility.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: [0, 1],
    //   }),
    //   transform: [
    //     {
    //       scale: this._visibility.interpolate({
    //         inputRange: [0, 1],
    //         outputRange: [1.1, 1],
    //       }),
    //     },
    //   ],
    // };

    // const combinedStyle = [containerStyle, style];
    // return (
    //   <Animated.View
    //     style={this.state.visible ? combinedStyle : containerStyle}
    //     {...rest}>
    //     {this.state.visible ? children : null}
    //   </Animated.View>
    // );
    return (
      <Animatable.View
        name={visible ? 'fadeInUp' : ' fadeOutUp'}
        useNativeDriver
        style={style}
        {...rest}>
        {visible ? children : null}
      </Animatable.View>
    );
  }
}
