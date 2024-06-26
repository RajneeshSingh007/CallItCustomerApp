import './src/util/patch';
import 'react-native-gesture-handler';
import * as React from 'react';
import {StatusBar, StyleSheet, View, NativeModules} from 'react-native';
import {AppContainer} from './src/util/AppRouter';
import NavigationActions from './src/util/NavigationActions';
import {inject, observer} from 'mobx-react';
import * as Helper from './src/util/Helper';
import * as Pref from './src/util/Pref';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {Notifications} from 'react-native-notifications';
import {requestNotifications} from 'react-native-permissions';
import {Snackbar} from 'react-native-paper';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import i18next from 'i18next';

//@inject('navigationStore')
//@observer
class AppIos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showToast: false,
      message: '',
      fcmToken: '',
    };
    changeNavigationBarColor('black', true);
  }

  /**
   * req permissions
   * @returns {Promise<void>}
   */
  componentDidMount() {
    Pref.getVal(Pref.langCode, code => {
      if (code !== undefined && code !== null && code !== '') {
        const lang = Helper.removeQuotes(code);
        if (lang !== '' && lang.length > 0) {
          i18next.changeLanguage(lang);
        }
      }
    });
    PushNotificationIOS.requestPermissions().then(op => {
      messaging()
        .getToken()
        .then(token => {
          if (token !== null && token !== '') {
            this.setState({fcmToken: token});
          }
        });
    });
    this.registerForPushNotificationsAsync();

    StatusBar.setBarStyle('dark-content', false);
    StatusBar.setTranslucent(false);
    Pref.setVal(Pref.TrackHomePageData, '');
    requestNotifications(['alert', 'badge', 'sound']).then(
      ({status, settings}) => {
        Notifications.registerRemoteNotifications();

        Notifications.events().registerNotificationReceivedForeground(
          (notification, completion) => {
            const {title} = notification;
            this.setState({showToast: true, message: title});
          },
        );
      },
    );

    this.onTokenRefreshListener = firebase
      .messaging()
      .onTokenRefresh(fcmToken => {
        if (fcmToken !== null) {
          Pref.getVal(Pref.userDeviceID, userDeviceID => {
            if (userDeviceID !== undefined && userDeviceID !== null) {
              const trimuserDeviceID = Helper.removeQuotes(userDeviceID);
              if (trimuserDeviceID !== '' && trimuserDeviceID !== fcmToken) {
                this.refreshToken(fcmToken);
              }
            }
          });
        }
      });

    Pref.getVal(Pref.userDeviceID, userDeviceID => {
      const trimuserDeviceID = Helper.removeQuotes(userDeviceID);
      let tokenx = this.state.fcmToken;
      // if (tokenx == '' || tokenx == null) {
      //   tokenx = NativeModules.Workaround.getToken();
      // }
      if (trimuserDeviceID === '') {
        this.refreshToken(tokenx);
      } else {
        if (tokenx !== trimuserDeviceID) {
          this.refreshToken(tokenx);
        }
      }
    });

    this.onrefreshtoken();
  }

  registerForPushNotificationsAsync = async () => {
    try {
      await messaging().requestPermission();
      const fcmToken = await messaging().getToken();
      // Save
      this.setState({fcmToken: fcmToken});
    } catch (error) {
      //alert(error);
    }
  };

  onrefreshtoken = () => {
    Pref.getVal(Pref.CustData, rel => {
      const vo = JSON.parse(rel);
      if (rel !== undefined && rel !== null && rel !== '' && vo !== null) {
        const {idcustomer} = vo;
        if (idcustomer !== undefined && idcustomer !== null) {
          Helper.networkHelperTokenPost(
            Pref.RefreshToken,
            JSON.stringify({
              idcustomer: idcustomer,
            }),
            Pref.methodPost,
            Pref.LASTTOKEN,
            res => {
              const token = res['token'];
              //console.log(new Date(), token);
              if (token !== undefined && token !== '') {
                Pref.setVal(Pref.bearerToken, token);
              }
            },
            error => {},
          );
        }
      }
    });
  };

  refreshToken(fcmToken) {
    Pref.getVal(Pref.bearerToken, value => {
      const token = Helper.removeQuotes(value);
      if (token !== '') {
        Helper.networkHelperToken(
          Pref.GetInfoUrl,
          Pref.methodGet,
          token,
          result => {
            var details = JSON.parse(JSON.stringify(result));
            Pref.setVal(Pref.CustData, details);
            const idcustomer = details.idcustomer;
            if (fcmToken !== null && fcmToken !== '') {
              const tt = JSON.stringify({
                value: fcmToken,
              });
              Pref.setVal(Pref.userDeviceID, fcmToken);
              Helper.networkHelperTokenPost(
                Pref.UpdateTokenUrl + idcustomer,
                tt,
                Pref.methodPost,
                Pref.LASTTOKEN,
                result => {
                  const token = result['token'];
                  if (token !== undefined && token !== '') {
                    Pref.setVal(Pref.bearerToken, token);
                  }
                },
                error => {},
              );
            }
          },
          error => {},
        );
      }
    });
  }

  componentWillUnmount() {
    if (this.onTokenRefreshListener !== undefined) {
      this.onTokenRefreshListener();
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
        }}>
        <StatusBar setBarStyle={'dark-content'} />
        <AppContainer
          ref={ref => NavigationActions.setTopLevelNavigator(ref)}
          onNavigationStateChange={this.handleNavigationChange}
        />

        <Snackbar
          visible={this.state.showToast}
          duration={Snackbar.DURATION_MEDIUM}
          style={{backgroundColor: '#3daccf'}}
          action={{
            label: 'סגור',
            onPress: () => {
              this.setState({message: '', showToast: false});
            },
          }}
          onDismiss={() => this.setState({message: '', showToast: false})}>
          {this.state.message}
        </Snackbar>
      </View>
    );
  }

  handleNavigationChange = (prevState, newState) => {
    const currentScreen = getActiveRouteName(newState);
    const prevScreen = getActiveRouteName(prevState);
    if (prevScreen !== currentScreen) {
      this.props.navigationStore.onChangeNavigation(prevScreen, currentScreen);
    }
  };
}

const getActiveRouteName = navigationState => {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
};

export default inject('navigationStore')(observer(AppIos));
