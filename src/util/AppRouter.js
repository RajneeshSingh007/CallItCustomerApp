import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {Easing, Animated, Platform} from 'react-native';
import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator,
} from 'react-navigation';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';
import {Colors} from 'react-native-paper';
import HomePage from './../customer/HomePage';
import Login from './../customer/Login';
//import LoginIos from './../customer/LoginIos';
import AuthPage from './../customer/AuthPage';
import Order from './../customer/OrdersPage';
import Fav from './../customer/FavPage';
import Profile from './../customer/ProfilePage';
import NewBusinessPage from './../customer/NewBusinessPage';
import ReviewsPage from './../customer/ReviewsPage';
import TrackOrderPage from './../customer/TrackOrderPage';
import SignupPage from './../customer/SignupPage';
//import SignupPageIos from './../customer/SignupPageIos';
import FinalOrder from './../customer/FinalOrder';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Image} from '@shoutem/ui';
import NavigationActions from './NavigationActions';
import * as Pref from './Pref';

let SlideFromRight = (index, position, width) => {
  const translateX = position.interpolate({
    inputRange: [index - 1, index],
    outputRange: [width, 0],
  });

  return {transform: [{translateX}]};
};

let SlideFromBottom = (index, position, height) => {
  const translateY = position.interpolate({
    inputRange: [index - 1, index],
    outputRange: [height, 0],
  });

  return {transform: [{translateY}]};
};

let CollapseTransition = (index, position) => {
  const opacity = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0, 1, 1],
  });

  const scaleY = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0, 1, 1],
  });

  return {
    opacity,
    transform: [{scaleY}],
  };
};

const handleCustomTransition = nav => {
  return {
    transitionSpec: {
      duration: 750,
      easing: Easing.out(Easing.poly(10)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: sceneProps => {
      const {layout, position, scene} = sceneProps;
      const width = layout.initWidth;
      const height = layout.initHeight;
      const {index, route} = scene;
      const params = route.params || {}; // <- That's new
      const transition = params.transition || 'default'; // <- That's new
      return {
        default: CollapseTransition(index, position, width),
        bottomTransition: SlideFromBottom(index, position, height),
        collapseTransition: CollapseTransition(index, position),
      }[transition];
    },
  };
};

const tryCustomer = createStackNavigator(
  {
    HomePage: {screen: HomePage},
    NewBusinessPage: {screen: NewBusinessPage},
    FinalOrder: {screen: FinalOrder},
    ReviewsPage: {screen: ReviewsPage},
  },
  {
    headerMode: 'none',
    initialRouteName: 'HomePage',
    transitionConfig: nav => handleCustomTransition(nav),
  },
);

const orderPage = createStackNavigator(
  {
    Orders: {screen: Order},
    TrackOrder: {screen: TrackOrderPage},
  },
  {
    headerMode: 'none',
    initialRouteName: 'Orders',
    cardStyle: {backgroundColor: 'white'},
    transitionConfig: nav => handleCustomTransition(nav),
  },
);

const customerBottomtab = createMaterialBottomTabNavigator(
  {
    Home: {
      screen: tryCustomer,
      navigationOptions: {
        tabBarIcon: ({focused}) => (
          <Image
            source={require('./../res/images/home.png')}
            tintColor={focused ? i18n.t(k.DACCF) : i18n.t(k._57)}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? i18n.t(k.DACCF) : i18n.t(k._57),
            }}
          />
        ),

        tabBarOnPress: ({navigation, defaultHandler}) => {
          const {index} = navigation.state;
          if (index === 1 || index === 2 || index === 3) {
            Pref.setVal(Pref.HomeReload, '1');
            NavigationActions.navigate('HomePage');
          } else {
            Pref.setVal(Pref.HomeReload, null);
          }
          defaultHandler();
        },
        title: i18n.t(k.homeTab),
      },
    },

    Orders: {
      screen: orderPage,
      navigationOptions: {
        tabBarIcon: ({focused}) => (
          <Image
            source={require('./../res/images/choices.png')}
            tintColor={focused ? i18n.t(k.DACCF) : i18n.t(k._57)}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? i18n.t(k.DACCF) : i18n.t(k._57),
            }}
          />
        ),

        tabBarOnPress: ({navigation, defaultHandler}) => {
          const {index} = navigation.state;
          if (index === 1) {
            Pref.setVal(Pref.HomeReload, '1');
            NavigationActions.navigate('Orders');
          } else {
            Pref.setVal(Pref.TrackHomePageData, '');
            Pref.setVal(Pref.HomeReload, null);
          }
          //NavigationActions.navigate('Orders');
          defaultHandler();
        },
        title: i18n.t(k.ordersTab),
      },
    },

    Fav: {
      screen: Fav,
      navigationOptions: {
        tabBarIcon: ({focused}) => (
          <Image
            source={require('./../res/images/favorites.png')}
            tintColor={focused ? i18n.t(k.DACCF) : i18n.t(k._57)}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? i18n.t(k.DACCF) : i18n.t(k._57),
            }}
          />
        ),

        tabBarOnPress: ({navigation, defaultHandler}) => {
          Pref.setVal(Pref.TrackHomePageData, '');
          Pref.setVal(Pref.HomeReload, null);
          //NavigationActions.navigate('Fav');
          defaultHandler();
        },
        title: i18n.t(k.favTab),
      },
    },

    Profile: {
      screen: Profile,
      navigationOptions: {
        tabBarIcon: ({focused}) => (
          <Image
            source={require('./../res/images/avatar.png')}
            tintColor={focused ? i18n.t(k.DACCF) : i18n.t(k._57)}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? i18n.t(k.DACCF) : i18n.t(k._57),
            }}
          />
        ),

        tabBarOnPress: ({navigation, defaultHandler}) => {
          Pref.setVal(Pref.TrackHomePageData, '');
          Pref.setVal(Pref.HomeReload, null);
          //NavigationActions.navigate('Profile');
          defaultHandler();
        },
        title: i18n.t(k.profileTab),
      },
    },
  },

  {
    initialRouteName: 'Home',
    shifting: false,
    labeled: true,
    tabBarOptions: {
      activeTintColor: '#3daccf',
      inactiveTintColor: '#292929',
    },
    activeTintColor: '#3daccf',
    inactiveTintColor: '#292929',
    backBehavior: 'none',
    barStyle: {backgroundColor: Colors.white},
    //resetOnBlur: true,
    transitionConfig: nav => handleCustomTransition(nav),
  },
);

/**
 * Customer Login
 */
const loginNav = createStackNavigator(
  {
    SignupPage: {screen: Platform.OS === 'ios' ? SignupPageIos : SignupPage},
    //SignupPage: {screen: SignupPage},
    Login: {screen: Platform.OS === 'ios' ? LoginIos : Login},
    //Login: {screen: Login},
  },

  {
    headerMode: 'none',
    initialRouteName: 'Login',
    cardStyle: {backgroundColor: 'white'},
    headerStyle: {
      backgroundColor: 'white',
    },
    transitionConfig: nav => handleCustomTransition(nav),
  },
);

/**
 * Navigation
 */
const Navigation = createSwitchNavigator(
  {
    AuthPage: AuthPage,
    Login: loginNav,
    Home: customerBottomtab,
  },

  {
    initialRouteName: 'AuthPage',
    headerMode: 'none',
  },
);

export const AppContainer = createAppContainer(Navigation);
