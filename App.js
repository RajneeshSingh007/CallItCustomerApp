import * as React from "react";
import * as ReactNative from "react-native";
import {StatusBar, StyleSheet, View} from 'react-native';
import {AppContainer} from "./src/util/AppRouter";
import NavigationActions from "./src/util/NavigationActions";
import {inject, observer} from "mobx-react";
import * as Helper from "./src/util/Helper";
import * as Pref from "./src/util/Pref";
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import PushNotificationAndroid from "react-native-push-android";
import {Snackbar} from 'react-native-paper';
import { CustomToast} from './src/util/CustomToast';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';

//@inject('navigationStore')
//@observer
class App extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            showToast:false,
            message:''
        }
        changeNavigationBarColor('white', true);
    }

    /**
   * req permissions
   * @returns {Promise<void>}
   */
    componentDidMount() {
        Pref.setVal(Pref.TrackHomePageData, "");
        this._notificationEvent = PushNotificationAndroid.addEventListener(
            "notification",
            details => {
                console.log('notifyOrder', details);
                const { fcm } = details;
                const title = fcm.title;
                this.setState({ message:title, showToast:true});
                // setTimeout(()=>{
                //     this.setState({message:'', showToast:false});
                //     clearTimeout()
                // }, 15000);
            }
        );

        this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
            console.log('fcmToken', fcmToken)
            if(fcmToken){
                Pref.getVal(Pref.userDeviceID, userDeviceID => {
                    const trimuserDeviceID = Helper.removeQuotes(userDeviceID);
                    if (trimuserDeviceID !== '' && trimuserDeviceID !== fcmToken) {
                        this.refreshToken(fcmToken);
                    }
                })
            }
        });

        Pref.getVal(Pref.userDeviceID, userDeviceID => {
            const trimuserDeviceID = Helper.removeQuotes(userDeviceID);
            if (trimuserDeviceID === '') {
                messaging().getToken()
                    .then(fcmToken => {
                        if (fcmToken) {
                            this.refreshToken(fcmToken);
                        }
                    });
            }else { 
                messaging().getToken()
                    .then(fcmToken => {
                        if (fcmToken && fcmToken !== trimuserDeviceID) {
                            this.refreshToken(fcmToken);
                        }
                    });
            }
        })

    }

    refreshToken(fcmToken){
        Pref.getVal(Pref.bearerToken, value => {
            const token = Helper.removeQuotes(value);
            if (token !== '') {
                Helper.networkHelperToken(
                    Pref.GetInfoUrl,
                    Pref.methodGet,
                    token,
                    result => {
                        var details = JSON.parse(JSON.stringify(result));
                        const idcustomer = details.idcustomer;
                        const tt = JSON.stringify({
                            value: fcmToken
                        });
                        Pref.setVal(Pref.userDeviceID, fcmToken);
                        Helper.networkHelperTokenPost(Pref.UpdateTokenUrl + idcustomer, tt, Pref.methodPost, Pref.LASTTOKEN, (result) => {
                            const token = result["token"];
                            if (token !== "") {
                                Pref.setVal(Pref.bearerToken, token);
                            }
                        }, (error) => {
                        });
                    },
                    error => { }
                );
            }
        });
    }

    componentWillUnmount(){
        if (this._notificationEvent !== undefined) {
            this._notificationEvent.remove();
        }

        if (this.onTokenRefreshListener !== undefined){
            this.onTokenRefreshListener();
        }
    }

    render() {

        return (
            <View style={{
                flex: 1
            }}>
                <AppContainer
                    ref={ref => NavigationActions.setTopLevelNavigator(ref)}
                    onNavigationStateChange={this.handleNavigationChange}/>

                <CustomToast isShow={this.state.showToast} content={this.state.message} callbacks={() =>{
                    this.setState({showToast:false,message:''})
                }} />
            </View>
        );
    }

    handleNavigationChange = (prevState, newState) => {
        const currentScreen = getActiveRouteName(newState)
        const prevScreen = getActiveRouteName(prevState)
        if (prevScreen !== currentScreen) {
            this
                .props
                .navigationStore
                .onChangeNavigation(prevScreen, currentScreen)
        }
    }
}

const getActiveRouteName = (navigationState) => {
    if (!navigationState) {
        return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
        return getActiveRouteName(route);
    }
    return route.routeName;
}

export default inject("navigationStore")(observer(App));
