import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  BackHandler,
  ScrollView,
  View,
  FlatList,
} from 'react-native';
import {Image, Screen, Subtitle, Title, Heading} from '@shoutem/ui';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import {Button, Card, Colors, Snackbar, TextInput} from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import {AlertDialog} from './../util/AlertDialog';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Loader} from './Loader';
import {SafeAreaView} from 'react-navigation';
import {sizeWidth, sizeHeight} from '../util/Size';
import CodePush from 'react-native-code-push';
import i18next from '../i18n/init';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.bindingBack = this.bindingBack.bind(this);
    this.state = {
      confirmResult: null,
      mobile: i18n.t(k._4),
      otp: i18n.t(k._4),
      progressView: false,
      message: i18n.t(k._4),
      mode: 0,
      exist: false,
      id: 0,
      showAlert: false,
      alertContent: i18n.t(k._4),
      visibility: false,
      stylnn: 'bold v-center h-center',
      smp: false,
      firstTime: false,
      timerEnabled: 0,
      timercounter: 30,
      languageList: [
        {name: i18n.t(k.helang), code: 'he'},
        {name: i18n.t(k.arlang), code: 'ar'},
      ],
      showlanguageList: false,
    };
  }

  componentDidMount() {
    try {
      Helper.requestPermissions();
    } catch (e) {
      console.log(e);
    }
    BackHandler.addEventListener('hardwareBackPress', this.bindingBack);
    this.sigout = auth()
      .signOut()
      .then(vale => {
        console.log(vale);
      });
    this.unsubscribe = auth().onAuthStateChanged(user => {
      if (user != null) {
        const userx = user.toJSON();
        this.setState({user: user.toJSON(), progressView: true});
        const mob = userx.phoneNumber
          .trim()
          .replace('+91', '')
          .replace('+972', '');
        //console.log('mob', mob);
        const jsonData = JSON.stringify({
          value: this.state.mobile,
        });

        Helper.networkHelperTokenPost(
          Pref.AccountCheckUrl,
          jsonData,
          Pref.methodPost,
          Pref.LASTTOKEN,
          result => {
            //////console.log(result);
            if (Helper.checkJson(result)) {
              const ty = result.idcustomer;
              messaging()
                .getToken()
                .then(fcmToken => {
                  if (fcmToken) {
                    const tt = JSON.stringify({
                      value: fcmToken,
                    });

                    //////console.log('deviceid', tt);
                    Helper.networkHelperTokenPost(
                      Pref.UpdateTokenUrl + ty,
                      tt,
                      Pref.methodPost,
                      Pref.LASTTOKEN,
                      result => {
                        const token = result['token'];
                        if (token !== '') {
                          Pref.setVal(Pref.TOS, '0');
                          Pref.setVal(Pref.bearerToken, token);
                          Pref.setVal(Pref.loggedStatus, true);
                          Helper.itemClick(this.props, 'Home');
                        }
                      },
                      error => {
                        //////console.log('er', error);
                        this.setState({progressView: false});
                      },
                    );
                  } else {
                    this.setState({
                      alertContent: i18n.t(k._105),
                      showAlert: true,
                    });
                    // user doesn't have a device token yet
                  }
                });
            } else {
              this.setState({exist: true, progressView: false});
              if (this.state.firstTime) {
                Helper.passParamItemClick(this.props, 'SignupPage', {
                  mobile: this.state.mobile,
                });
              }
            }
          },
          error => {
            //////console.log('er', error);
            this.setState({progressView: false});
          },
        );
        //Helper.passParamItemClick(this.props, "Login", { mobile: this.state.mobile, });
      }
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.bindingBack);
    if (this.unsubscribe !== undefined) this.unsubscribe();
  }

  bindingBack() {
    if (this.state.mode > 0) {
      this.setState({
        stylnn: 'bold v-center h-center',
        visibility: false,
        mode: 0,
        mobile: i18n.t(k._4),
        otp: i18n.t(k._4),
        confirmResult: null,
        progressView: false,
      });
      return true;
    } else {
      return false;
    }
  }

  backclick = () => {
    this.setState({
      visibility: false,
      mode: 0,
      mobile: i18n.t(k._4),
      otp: i18n.t(k._4),
      confirmResult: null,
      progressView: false,
    });
  };

  /**
   * signIn
   */
  signIn() {
    if (this.state.mode === 0) {
      if (this.state.mobile === '') {
        this.setState({message: i18n.t(k._98)});
      } else if (this.state.mobile.length < 10) {
        this.setState({message: i18n.t(k._99)});
      } else if (this.state.mobile === '9876543210') {
        this.setState({message: i18n.t(k._100)});
      } else {
        this.setState({smp: true, timercounter: 30}, () => {
          if (this.timerlisterner !== undefined) {
            clearInterval(this.timerlisterner);
          }
          this.timerlisterner = setInterval(this.runtimer, 1000);
        });
        this.sendOTPCode(false);
      }
    } else if (this.state.mode === 1) {
      if (this.state.otp === '') {
        this.setState({message: i18n.t(k._101)});
      } else {
        this.setState({progressView: true, smp: true});
        const tt = this.state.otp;
        if (this.state.confirmResult) {
          this.state.confirmResult
            .confirm(tt)
            .then(user => {
              //////console.log('user', user);
              const jsonData = JSON.stringify({
                value: this.state.mobile,
              });

              Helper.networkHelperTokenPost(
                Pref.AccountCheckUrl,
                jsonData,
                Pref.methodPost,
                Pref.LASTTOKEN,
                result => {
                  //console.log('checkuserExists', result);
                  if (Helper.checkJson(result)) {
                    const ty = result.idcustomer;
                    messaging()
                      .getToken()
                      .then(fcmToken => {
                        if (fcmToken) {
                          const tt = JSON.stringify({
                            value: fcmToken,
                          });
                          //console.log('datasendDevicetoken', tt, ty);
                          Helper.networkHelperTokenPost(
                            Pref.UpdateTokenUrl + ty,
                            tt,
                            Pref.methodPost,
                            Pref.LASTTOKEN,
                            result => {
                              // console.log(
                              //   'updateCustomerDeviceApi Success',
                              //   result,
                              // );
                              const token = result['token'];
                              if (token !== '') {
                                Pref.setVal(Pref.TOS, '0');
                                Pref.setVal(Pref.bearerToken, token);
                                Pref.setVal(Pref.loggedStatus, true);
                                Helper.itemClick(this.props, 'Home');
                              }
                            },
                            error => {
                              //console.log('updateCustomerDevice Error', error);
                              this.setState({
                                progressView: false,
                                smp: false,
                              });
                            },
                          );
                        } else {
                          this.setState({
                            alertContent: i18n.t(k._105),
                            showAlert: true,
                            smp: false,
                          });
                          // user doesn't have a device token yet
                        }
                      });
                  } else {
                    this.setState({
                      exist: true,
                      progressView: false,
                      smp: false,
                    });
                    Helper.passParamItemClick(this.props, 'SignupPage', {
                      mobile: this.state.mobile,
                    });
                  }
                },
                error => {
                  //////console.log('er', error);
                  this.setState({progressView: false, smp: false});
                },
              );
              //this.setState({ progressView: false });
              //Helper.passParamItemClick(this.props, "Login", { mobile: this.state.mobile, });
            })
            .catch(error => {
              this.setState({
                progressView: false,
                message: i18n.t(k._102),
                smp: false,
              });
              //////console.log('otpFailed', error);
            });
        }
      }
    }
  }

  sendOTPCode(bal) {
    //+972
    //+91
    const to = '+972' + this.state.mobile;
    auth()
      .signInWithPhoneNumber(to, bal)
      .then(confirmResult => {
        //////console.log(confirmResult);
        this.setState({
          visibility: true,
          mode: 1,
          confirmResult: confirmResult,
          progressView: false,
          smp: false,
          firstTime: true,
          timercounter: 30,
        });
      })
      .catch(error => {
        //////console.log('error', error);
        this.setState({
          message: i18n.t(k._103),
          progressView: false,
          smp: false,
        });
      });
    if (bal) {
      this.setState({message: i18n.t(k._104)});
    }
  }

  runtimer = () => {
    if (this.state.timercounter === 1) {
      this.setState({timerEnabled: 2, timercounter: 30}, () => {
        if (this.timerlisterner !== undefined) {
          clearInterval(this.timerlisterner);
        }
      });
    } else {
      this.setState(prev => {
        const timer = prev.timercounter;
        return {
          timercounter: timer - 1,
          timerEnabled: 1,
        };
      });
    }
  };

  changelang = item => {
    const {code} = item;
    this.setState({showlanguageList:false});
    i18next.changeLanguage(code);
  };

  renderRowLanugage(item) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          //alignContent: 'flex-start',
          //alignSelf: 'flex-start',
          //justifyContent: 'flex-start',
          marginVertical: sizeHeight(1),
          marginHorizontal: sizeWidth(6),
          paddingVertical: 4,
          width: '100%',
        }}>
        <TouchableWithoutFeedback onPress={() => this.changelang(item)}>
          <Title
            styleName="v-start h-start "
            style={{
              color: '#292929',
              fontFamily: 'Rubik',
              fontSize: 15,
              fontWeight: '400',
            }}>
            {`${item.name}`}
          </Title>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  render() {
    const timer = this.state.timerEnabled;
    const textmiddle =
      timer === 1
        ? `${i18n.t(k.signuptimer)} ${this.state.timercounter} ${i18n.t(
            k.signuptimer1,
          )}`
        : timer === 2
        ? `${i18n.t(k._96)}`
        : ``;
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: 'white'}}
        forceInset={{top: 'never'}}>
        <Screen style={{backgroundColor: 'white'}}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />

          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View style={{flex: 1, justifyContent: 'space-between'}}>
              <View style={{flex: 0.2}}>
                {this.state.visibility ? (
                  <View
                    style={{
                      marginStart: 12,
                      alignSelf: 'flex-start',
                      padding: 4,
                      marginTop: 8,
                    }}>
                    <TouchableWithoutFeedback onPress={this.backclick}>
                      <Icon
                        name="arrow-forward"
                        size={36}
                        color="#292929"
                        style={{
                          alignSelf: 'center',
                          backgroundColor: 'transparent',
                        }}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                ) : (
                  <View
                    style={{
                      marginStart: 12,
                      alignSelf: 'flex-start',
                      padding: 4,
                      marginTop: 8,
                    }}>
                    <TouchableWithoutFeedback
                      onPress={() => this.setState({showlanguageList: true})}>
                      <Subtitle
                        styleName={i18n.t(k.V_CENTER_H_CENTER)}
                        style={{
                          marginTop: sizeHeight(1.8),
                          fontSize: 16,
                        }}>
                        {`שינוי שפה`}
                      </Subtitle>
                    </TouchableWithoutFeedback>
                    {/* <Icon
                      name=""
                      size={36}
                      color="#292929"
                      style={{
                        alignSelf: 'center',
                        backgroundColor: 'transparent',
                      }}
                    /> */}
                  </View>
                )}

                <Heading
                  style={{
                    color: '#292929',
                    fontWeight: '700',
                    fontSize: 22,
                    alignSelf: 'center',
                  }}>
                  {`${i18n.t(k._93)}`}
                </Heading>
              </View>
              <View
                styleName="v-center h-center"
                style={{
                  flex: 0.5,
                  marginVertical: sizeHeight(1),
                  justifyContent: 'space-between',
                }}>
                {/* <Subtitle
                  styleName="v-center h-center"
                  style={{color: '#292929', fontSize: 16}}>
                  {i18n.t(k._94)}
                </Subtitle> */}
                <TextInput
                  mode="flat"
                  label={i18n.t(k._94)}
                  underlineColor="transparent"
                  underlineColorAndroid="transparent"
                  style={[styles.inputStyle, {justifyContent: 'center'}]}
                  placeholderTextColor={'#DEDEDE'}
                  keyboardType={'numeric'}
                  maxLength={10}
                  onChangeText={value => this.setState({mobile: value})}
                  value={this.state.mobile}
                />

                {this.state.mode > 0 ? (
                  <View style={{marginTop: 16}}>
                    {/* <Subtitle
                      styleName="v-center h-center"
                      style={{color: '#292929', fontSize: 16}}>
                      {i18n.t(k._95)}
                    </Subtitle> */}
                    <TextInput
                      mode="flat"
                      label={i18n.t(k._95)}
                      underlineColor="transparent"
                      underlineColorAndroid="transparent"
                      placeholderTextColor={i18n.t(k.DEDEDE)}
                      style={[styles.inputStyle]}
                      maxLength={8}
                      keyboardType={i18n.t(k.NUMBER_PAD)}
                      onChangeText={value => this.setState({otp: value})}
                      value={this.state.otp}
                    />
                  </View>
                ) : (
                  <View>
                    <Subtitle
                      styleName="v-center h-center"
                      style={{color: '#292929', fontSize: 16}}
                    />
                    <View style={[styles.box]} />
                  </View>
                )}
                {this.state.mode !== 0 ? (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      if (timer === 2) {
                        this.setState({timercounter: 30}, () => {
                          if (this.timerlisterner !== undefined) {
                            clearInterval(this.timerlisterner);
                          }
                          this.timerlisterner = setInterval(
                            this.runtimer,
                            1000,
                          );
                        });
                        this.sendOTPCode(true);
                      }
                    }}>
                    <Subtitle
                      styleName={i18n.t(k.V_CENTER_H_CENTER)}
                      style={{
                        marginTop: sizeHeight(1.8),
                        fontSize: timer === 1 ? 17 : 16,
                      }}>
                      {`${textmiddle}`}
                    </Subtitle>
                  </TouchableWithoutFeedback>
                ) : (
                  <Subtitle
                    styleName={i18n.t(k.V_CENTER_H_CENTER)}
                    style={{marginTop: sizeHeight(3)}}>
                    {' '}
                  </Subtitle>
                )}
              </View>
              <Image
                styleName="large-wide v-center h-center"
                source={require('./../res/images/loginbg.png')}
                style={{flex: 0.22, resizeMode: 'contain'}}
              />

              <TouchableWithoutFeedback onPress={() => this.signIn()}>
                <Button
                  styleName="muted border"
                  mode={'flat'}
                  uppercase={true}
                  dark={true}
                  loading={this.state.progressView}
                  style={styles.loginButtonStyle}
                  onPress={() => this.signIn()}>
                  <Subtitle
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      justifyContent: 'center',
                    }}>
                    {this.state.progressView === true
                      ? i18n.t(k._47)
                      : this.state.mode === 0
                      ? i18n.t(k._54)
                      : i18n.t(k._97)}
                  </Subtitle>
                </Button>
              </TouchableWithoutFeedback>
            </View>
          </ScrollView>
          {this.state.showAlert ? (
            <AlertDialog
              isShow={true}
              title={i18n.t(k._29)}
              content={this.state.alertContent}
              callbacks={() => this.setState({showAlert: false})}
            />
          ) : null}
          <Snackbar
            visible={this.state.message === '' ? false : true}
            duration={1000}
            onDismiss={() =>
              this.setState({
                message: i18n.t(k._4),
              })
            }>
            {this.state.message}
          </Snackbar>
          <Loader isShow={this.state.smp} />
          {this.state.showlanguageList === true ? (
            <Card
              elevation={3}
              style={{
                position: 'absolute',
                top: 0,
                marginTop: sizeHeight(8.5),
                paddingEnd: 16,
                marginStart: 16,
                width: '40%',
                minHeight: 106,
              }}>
              <FlatList
                //extraData={this.state}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                data={this.state.languageList}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps={'handled'}
                ItemSeparatorComponent={() => (
                  <View style={styles.listservicedivider} />
                )}
                keyExtractor={(item, index) => `${index.toString()}`}
                renderItem={({item: item, index}) =>
                  this.renderRowLanugage(item)
                }
              />
            </Card>
          ) : null}
        </Screen>
      </SafeAreaView>
    );
  }
}

/**
 * styles
 */
const styles = StyleSheet.create({
  inputStyle: {
    height: 56,
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: i18n.t(k.FFFFFF),
    color: i18n.t(k._57),
    fontFamily: 'Rubik',
    fontSize: 16,
    marginHorizontal: 24,
    fontWeight: i18n.t(k._58),
  },

  loginButtonStyle: {
    height: 42,
    color: i18n.t(k.WHITE),
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: i18n.t(k.CENTER),
    width: '100%',
    borderRadius: 0,
    backgroundColor: i18n.t(k.DACCF),
    flex: 0.08,
  },
  box: {
    height: 56,
    backgroundColor: i18n.t(k.FFFFFF),
    color: i18n.t(k._57),
    fontFamily: 'Rubik',
    fontSize: 16,
    marginHorizontal: 24,
    fontWeight: i18n.t(k._58),
  },
  listservicedivider: {
    height: 0.8,
    backgroundColor: '#dedede',
    width: '100%',
  },
});
