import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  ScrollView,
  BackHandler,
  AppState,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Colors, Button} from 'react-native-paper';
import {
  Image,
  NavigationBar,
  Screen,
  Subtitle,
  Title,
  TouchableOpacity,
  View,
} from '@shoutem/ui';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import NavigationActions from '../util/NavigationActions';
import {sizeHeight, sizeWidth} from './../util/Size';
import PushNotificationAndroid from 'react-native-push-android';
import DummyLoader from '../util/DummyLoader';
import * as Lodash from 'lodash';
import Moment from 'moment';
import {Loader} from './Loader';
import {SafeAreaView} from 'react-navigation';
import {Notifications} from 'react-native-notifications';

export default class TrackOrderPage extends React.Component {
  constructor(props) {
    super(props);
    this.cancelOrderClick = this.cancelOrderClick.bind(this);
    this.backClick = this.backClick.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this._handleAppStateChange = this._handleAppStateChange.bind(this);
    this._notificationEvent = null;
    this.refresh = this.refresh.bind(this);
    this.state = {
      progressView: false,
      item: null,
      datas: [],
      customerMessage: '',
      businessName: i18n.t(k._4),
      status: 0,
      paid: 0,
      orderdate: i18n.t(k._4),
      totalPrice: i18n.t(k._4),
      keyx: '',
      orderdatex: '',
      appstate: AppState.currentState,
      businessMessage: i18n.t(k._4),
      isHistory: false,
      imageUrl: i18n.t(k._4),
      token: '',
      deliveryss: -1,
      deliveryPrices: 0,
      convertTime: '',
      smp: false,
      orderidList: [],
      allDatasOg: [],
      fkbranchO: 0,
      cartGuid: '',
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    BackHandler.addEventListener('hardwareBackPress', this.backClick);
    const {navigation} = this.props;
    const item = navigation.getParam('item', null);
    if (item !== null) {
      const so = item[0].isHistory;
      if (so === false) {
        this.setState({progressView: true});
      }
      Pref.getVal(Pref.bearerToken, value => {
        const tn = Helper.removeQuotes(value);
        this.setState({token: tn}, () => {
          this.fetchData(item);
          Helper.networkHelperToken(
            Pref.ServerTimeUrl,
            Pref.methodGet,
            tn,
            value => {
              //value
              const convertTime = Moment.utc(value)
                .utcOffset(2, false)
                .format('YYYY-MM-DD HH');
              //console.log('convertTime', convertTime);
              this.setState({
                convertTime: convertTime,
              });
            },
            () => {
              //console.log('err', error);
            },
          );
        });
      });
    }
    if (Platform.OS === 'ios') {
      Notifications.registerRemoteNotifications();

      Notifications.events().registerNotificationReceivedForeground(
        (notification, completion) => {
          this.refresh();
          // this.setState(
          //   prevState => {
          //     return {
          //       status: prevState.status + 1,
          //     };
          //   },
          //   () => {
          //     this.refresh();
          //   },
          // );
          completion({
            alert: false,
            sound: true,
            badge: false,
          });
        },
      );

      Notifications.events().registerNotificationOpened(
        (notification, completion) => {
          this.refresh();
          // this.setState(
          //   prevState => {
          //     return {
          //       status: prevState.status + 1,
          //     };
          //   },
          //   () => {
          //     this.refresh();
          //   },
          // );
          completion();
        },
      );
    } else {
      this._notificationEvent = PushNotificationAndroid.addEventListener(
        'notification',
        details => {
          PushNotificationAndroid.notify(details);
          this.refresh();
        },
      );
    }
  }

  componentDidUpdate(prevProp, nextState) {
    const {navigation} = prevProp;
    if (navigation !== undefined) {
      const previtem = navigation.getParam('item', null);
      if (previtem !== null) {
        const prevfirstData = previtem[0];
        const prevallDatas = prevfirstData.data;
        const prevdatex = prevallDatas[0].orderdate;
        const item = this.props.navigation.getParam('item', null);
        if (item !== null) {
          const firstData = item[0];
          const allDatas = firstData.data;
          const datex = allDatas[0].orderdate;
          if (prevdatex !== datex) {
            this.fetchData(item);
          }
        }
      }
    }
  }

  refresh = () => {
    if (this.state.isHistory) {
      this.setState({progressView: true});
      Helper.networkHelperToken(
        Pref.GetOrdersUrl,
        Pref.methodGet,
        this.state.token,
        result => {
          this.setState({progressView: false});
          let {idorder} = this.state;
          const sumclone = result.order_Bs;
          const branches = result.branches;
          const opFinalOrders = Helper.orderData(sumclone, branches, true);
          //console.log(`keyx`, idorder);
          const fii = Lodash.find(opFinalOrders, xm => xm.idorder === idorder);
          //console.log(`fii`, fii);
          if (fii !== undefined) {
            const {data,status} = fii;
            const firstpos = data[0];
            this.setState(
              {
                status: status,
                businessMessage: firstpos.business_message,
              },
              () => {
                this.forceUpdate();
              },
            );
            // this.setState({
            //   status: status + 1,
            //   businessMessage: firstpos.business_message,
            // });
          }
        },
        () => {
          this.setState({progressView: false});
        },
      );
    }
  };

  objectsEqual = (o1, o2) => {
    if (o1.length !== o2.length) return false;
    let count = 0;
    for (let index = 0; index < o1.length; index++) {
      const e1 = o1[index];
      const e2 = o2[index];
      if (e1.name === e2.name) {
        count += 1;
      }
    }
    return count === o1.length;
  };

  fetchData(pp) {
    if (pp !== undefined && pp !== null) {
      const firstData = pp[0];
      const allDatas = firstData.data;
      const finalDisplayData = [];
      Lodash.map(allDatas, firspos => {
        const {
          extras,
          message,
          price,
          serviceName,
          orderdate,
          quantity,
        } = firspos;
        let total = Number(price);
        const exstr = Helper.groupExtraWithCountString(extras, false);
        finalDisplayData.push({
          orderdate: orderdate,
          serviceName: serviceName,
          extraDisplayArray: exstr,
          message: message,
          price: total,
          counter: quantity || 0,
        });
      });
      this.setState(
        {
          progressView: false,
          idbranch: firstData.idbranch,
          deliveryss: allDatas[0].isdelivery,
          isHistory: firstData.isHistory,
          keyx: firstData.keys,
          fkbranchO: firstData.fkbranchO,
          cartGuid: firstData.cartGuid,
          orderdatex: firstData.orderdate,
          totalPrice: firstData.totalPrice,
          orderdate: allDatas[0].orderdate,
          paid: firstData.paid,
          status: firstData.status,
          item: allDatas,
          datas: finalDisplayData,
          imageUrl: firstData.imageUrl,
          customerMessage: firstData.message,
          businessName: firstData.title,
          idorder: firstData.idorder,
          businessMessage: allDatas[0].business_message,
          deliveryPrices: allDatas[0].deliveryprice,
          allDatasOg: allDatas,
          orderidList:
            firstData.orderidList === undefined ? [] : firstData.orderidList,
        },
        () => {
          Helper.networkHelperToken(
            Pref.BusinessBranchDetailUrl + firstData.idbranch,
            Pref.methodGet,
            this.state.token,
            result => {
              this.setState({imageUrl: result.imageUrl});
            },
            () => {
              //error
            },
          );
        },
      );
    }
    Helper.networkHelperToken(
      Pref.ServerTimeUrl,
      Pref.methodGet,
      this.state.token,
      value => {
        const convertTime = Moment.utc(value)
          .utcOffset(2, false)
          .format('YYYY-MM-DD HH');
        this.setState({convertTime: convertTime});
      },
      () => {
        //console.log('err', error);
      },
    );
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    Pref.setVal(Pref.DummyLoaderData, null);
    BackHandler.removeEventListener('hardwareBackPress', this.backClick);
    if (this.focusListener !== undefined) {
      if (this.focusListener !== undefined) {
        this.focusListener.remove();
      }
    }
    if (this.willfocusListener !== undefined) {
      this.willfocusListener.remove();
    }
    if (Platform.OS === 'android') {
      if (
        this._notificationEvent !== undefined &&
        this._notificationEvent !== null
      ) {
        this._notificationEvent.remove();
      }
    }
  }

  _handleAppStateChange = async nextAppState => {
    const {appState} = this.state;
    if (appState === 'active') {
      // do this
    } else if (appState === 'background') {
      // do that
      this.refresh();
    } else if (appState === 'inactive') {
      // do that other thing
    }

    this.setState({appState: nextAppState});
  };

  backClick = () => {
    NavigationActions.goBack();
    return true;
  };

  renderRow(itemx) {
    return (
      <View
        style={{
          flexDirection: 'column',
          marginVertical: sizeHeight(1),
        }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Title
            styleName="bold"
            style={{
              color: '#292929',
              fontFamily: 'Rubik',
              fontSize: 16,
              alignSelf: 'flex-start',
              fontWeight: '700',
            }}>
            {itemx.serviceName}
            {itemx.counter > 0 ? (
              <Title
                styleName="bold"
                style={{
                  color: 'green',
                  fontFamily: 'Rubik',
                  fontSize: 18,
                  alignSelf: 'flex-start',
                  fontWeight: 'bold',
                }}>
                {`   ${itemx.counter}x`}
              </Title>
            ) : (
              ''
            )}
          </Title>
          <Title
            style={{
              color: '#292929',
              fontFamily: 'Rubik',
              alignSelf: 'flex-start',
              fontSize: 16,
              marginEnd: 8,
              fontWeight: '700',
            }}>
            {`${i18n.t(k._6)}${itemx.price}`}
          </Title>
        </View>
        <View style={{marginEnd: 8, flexDirection: 'column', flexWrap: 'wrap'}}>
          <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}}>
            <Title
              styleName="wrap horizontal"
              style={{
                color: '#292929',
                fontFamily: 'Rubik',
                fontSize: 16,
                fontWeight: '400',
                paddingHorizontal: 2,
              }}>
              {`${Lodash.capitalize(itemx.extraDisplayArray.trim())}`}
            </Title>
          </View>
        </View>

        {itemx.message !== '' &&
        itemx.message !== null &&
        itemx.message !== undefined ? (
          <Title
            style={{
              color: '#292929',
              fontFamily: 'Rubik',
              alignSelf: 'flex-start',
              fontSize: 16,
              fontWeight: '400',
            }}>
            {`${i18n.t(k._7)} ${itemx.message}`}
          </Title>
        ) : null}
      </View>
    );
  }

  last3digitorder() {
    var orderid = this.state.idorder.toString();
    const size = orderid.length;
    if (size > 3) {
      const start = size - 2;
      return orderid.substr(start - 1, size);
    } else {
      return orderid;
    }
  }

  cancelOrderClick = () => {
    const {allDatasOg, token, convertTime, idbranch, orderidList} = this.state;
    //console.log(`datas`, allDatasOg);
    Alert.alert(``, `${i18n.t(k.cancelContent)}`, [
      {
        text: `${i18n.t(k.NO)}`,
      },
      {
        text: `${i18n.t(k.YES)}`,
        onPress: () => {
          this.setState({smp: true});
          Helper.networkHelperToken(
            Pref.GetInfoUrl,
            Pref.methodGet,
            this.state.token,
            result => {
              const {idcustomer} = result;
              const bodyList = [];
              //const time = this.state.time;
              const message = ``;
              const timeformat = `${convertTime}:00:00`;

              Lodash.map(allDatasOg, (ele, index) => {
                //console.log(`ele`, ele, orderidList);
                bodyList.push({
                  Id_order:
                    orderidList !== undefined && orderidList.length > 0
                      ? orderidList[index]
                      : ele.idorder,
                  customerfkO: idcustomer,
                  Expected_date: timeformat,
                  //Expected_date: "",
                  Mins: '',
                  Message: message,
                  Status: -2,
                  Id_branch: Number(idbranch),
                });
              });
              const body = JSON.stringify(bodyList);
              //console.log(`body`, body);
              Helper.networkHelperTokenPost(
                Pref.CancelOrderUrl,
                body,
                Pref.methodPost,
                token,
                re => {
                  console.log(`re`, re);
                  this.setState({smp: false});
                  if (
                    re === `re cancel request sent` ||
                    re === `cancel request sent`
                  ) {
                    this.setState({status: -1});
                    Alert.alert(
                      `${i18n.t(k.cancelalerttitle)}`,
                      `${i18n.t(k.afterCancel)}`,
                      [
                        {
                          text: `${i18n.t(k.cancelalertok)}`,
                        },
                      ],
                    );
                  }
                },
                () => {
                  this.setState({smp: false});
                },
              );
            },
            () => {},
          );
        },
      },
    ]);
  };

  getCombinedprice = () => {
    const {totalPrice, deliveryPrices} = this.state;
    let price = Number(totalPrice);
    if (
      deliveryPrices !== undefined &&
      deliveryPrices !== null &&
      deliveryPrices !== ''
    ) {
      price += Number(deliveryPrices);
    }
    return price;
  };

  render() {
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: 'white'}}
        forceInset={{top: 'never'}}>
        <Screen
          style={{
            backgroundColor: 'white',
          }}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          <DummyLoader
            visibilty={this.state.progressView}
            center={
              <ScrollView
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}>
                <View>
                  {this.state.item !== null && this.state.item !== undefined ? (
                    <Image
                      styleName="large-wide"
                      source={{
                        uri: `${Pref.BASEURL}${this.state.imageUrl}`,
                      }}
                      style={{
                        height: sizeHeight(24),
                        resizeMode: 'contain',
                      }}
                    />
                  ) : null}
                  <View
                    style={{
                      position: 'absolute',
                      backgroundColor: 'transparent',
                    }}>
                    <NavigationBar
                      styleName="inline no-border clear"
                      leftComponent={
                        <View
                          styleName="horizontal space-between"
                          style={{
                            marginStart: 12,
                          }}>
                          <TouchableOpacity
                            onPress={() => NavigationActions.goBack()}>
                            <Icon
                              name="arrow-forward"
                              size={36}
                              color="#292929"
                              style={{
                                padding: 4,
                                backgroundColor: 'transparent',
                              }}
                            />
                          </TouchableOpacity>
                        </View>
                      }
                    />
                  </View>
                  {this.state.item !== null && this.state.item !== undefined ? (
                    <>
                      <View
                        style={{
                          flexDirection: 'column',
                          marginStart: sizeWidth(4),
                          marginVertical: sizeHeight(2),
                          paddingHorizontal: sizeWidth(1),
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          {this.state.businessName !== '' &&
                          this.state.businessName !== null &&
                          this.state.businessName !== undefined ? (
                            <View style={{flexDirection: 'row'}}>
                              <Title
                                styleName="bold"
                                style={{
                                  color: '#292929',
                                  fontFamily: 'Rubik',
                                  fontSize: 18,
                                  alignSelf: 'flex-start',
                                  fontWeight: '700',
                                  marginBottom: sizeHeight(1),
                                }}>
                                {this.state.businessName}
                              </Title>
                            </View>
                          ) : null}
                          {this.state.idorder !== null &&
                          this.state.idorder !== undefined ? (
                            <Subtitle
                              style={{
                                color: '#292929',
                                fontFamily: 'Rubik',
                                alignSelf: 'flex-start',
                                fontWeight: '600',
                                fontSize: 16,
                                marginEnd: sizeWidth(1),
                              }}>
                              {`${i18n.t(k._106)} ${this.last3digitorder()}`}
                            </Subtitle>
                          ) : null}
                        </View>

                        {this.state.status === 1 ? (
                          <View style={{flex: 1, flexDirection: 'row-reverse'}}>
                            <Button
                              style={{
                                color: i18n.t(k.WHITE),
                                marginBottom: sizeHeight(1),
                                marginTop: sizeHeight(1),
                                flex: 0.18,
                                marginEnd: 3,
                                //borderColor:'#292929',
                                //borderWidth:1,
                                elevation: 0,
                                height: 42,
                                backgroundColor: i18n.t(k.DACCF),
                              }}
                              mode="contained"
                              dark={true}
                              uppercase={true}
                              color={'white'}
                              onPress={this.cancelOrderClick}
                              loading={false}>
                              <Subtitle
                                styleName="v-center h-center"
                                style={{
                                  color: 'white',
                                  fontSize: 13,
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                  marginBottom: -32,
                                  height: '100%',
                                  width: '100%',
                                }}>
                                {i18n.t(k.cancelButton)}
                              </Subtitle>
                            </Button>
                            <View style={{flex: 0.82}} />
                          </View>
                        ) : null}

                        {this.state.datas !== null &&
                        this.state.datas.length > 0 ? (
                          <FlatList
                            extraData={this.state}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            data={this.state.datas}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item: item, index}) =>
                              this.renderRow(item)
                            }
                          />
                        ) : null}

                        {/*<Subtitle style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      alignSelf: 'flex-start',
                      fontSize: 14,
                     }}>{`${this.state.item.orderdate} : Order Date`}</Subtitle> */}
                        {this.state.orderdate !== undefined &&
                        this.state.orderdate !== '' &&
                        this.state.orderdate !== null ? (
                          <Subtitle
                            style={{
                              marginTop: sizeHeight(1),
                              color: '#292929',
                              fontFamily: 'Rubik',
                              alignSelf: 'flex-start',
                              fontWeight: '600',
                              fontSize: 15,
                            }}>
                            {`${i18n.t(k._107)} ${Moment(
                              this.state.orderdate,
                            ).format(i18n.t(k.YYYY_DD_MM_HH_MM))}`}
                          </Subtitle>
                        ) : null}
                        {this.state.deliveryPrices !== '' &&
                        this.state.deliveryPrices !== null &&
                        this.state.deliveryPrices !== undefined &&
                        this.state.deliveryPrices > 0 ? (
                          <Title
                            style={{
                              color: '#292929',
                              fontFamily: 'Rubik',
                              alignSelf: 'flex-start',
                              fontSize: 15,
                              fontWeight: '400',
                            }}>
                            {`${i18n.t(k._17)}`}
                            <Title
                              style={{
                                color: '#292929',
                                fontFamily: 'Rubik',
                                alignSelf: 'flex-start',
                                fontSize: 15,
                                fontWeight: '400',
                              }}>
                              {`${i18n.t(k._6)}${this.state.deliveryPrices}`}
                            </Title>
                          </Title>
                        ) : null}
                        {this.state.totalPrice !== undefined &&
                        this.state.totalPrice !== null &&
                        this.state.totalPrice !== '' ? (
                          <Title
                            style={{
                              color: '#292929',
                              fontFamily: 'Rubik',
                              alignSelf: 'flex-start',
                              fontSize: 15,
                              fontWeight: '400',
                            }}>
                            {`${i18n.t(k._108)}`}
                            <Title
                              style={{
                                color: '#292929',
                                fontFamily: 'Rubik',
                                alignSelf: 'flex-start',
                                fontSize: 15,
                                fontWeight: '700',
                              }}>
                              {`${i18n.t(k._6)}${this.getCombinedprice()}`}
                            </Title>
                          </Title>
                        ) : null}
                        {this.state.paid !== undefined ? (
                          <Subtitle
                            style={{
                              color: '#6DC124',
                              fontFamily: 'Rubik',
                              alignSelf: 'flex-start',
                              fontSize: 15,
                            }}>
                            {this.state.paid == 0
                              ? i18n.t(k._76)
                              : i18n.t(k._75)}
                          </Subtitle>
                        ) : null}
                        <View
                          style={{
                            height: 1,
                            marginEnd: 6,
                            backgroundColor: '#dedede',
                            marginVertical: sizeHeight(1),
                          }}
                        />

                        {this.state.businessMessage !== '' &&
                        this.state.businessMessage !== null &&
                        this.state.businessMessage !== undefined ? (
                          <Title
                            style={{
                              color: '#292929',
                              fontFamily: 'Rubik',
                              alignSelf: 'flex-start',
                              fontSize: 15,
                              marginTop: sizeHeight(2),
                              marginBottom: sizeHeight(2),
                              marginStart: sizeWidth(2),
                              fontWeight: '400',
                            }}>
                            {`${i18n.t(k._109)} ${this.state.businessMessage}`}
                          </Title>
                        ) : null}

                        {this.state.status === -1 ||
                        this.state.status === -2 ? null : (
                          <View
                            style={{
                              justifyContent: 'space-evenly',
                              marginBottom: sizeHeight(1),
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginTop: sizeHeight(1),
                              }}>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Image
                                  source={require(`./../res/images/package.png`)}
                                  style={{
                                    width: 24,
                                    height: 24,
                                    alignSelf: 'center',
                                    marginTop: 8,
                                    marginBottom: 8,
                                  }}
                                  tintColor={
                                    this.state.status <= 1 ? i18n.t(k.EBBD) : ''
                                  }
                                />

                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  marginHorizontal: sizeWidth(3),
                                }}>
                                <Title
                                  styleName="bold"
                                  style={{
                                    color:
                                      this.state.status <= 1
                                        ? '#5EBBD7'
                                        : '#292929',
                                    fontFamily: 'Rubik',
                                    fontSize: 14,
                                    alignSelf: 'flex-start',
                                    fontWeight: '700',
                                  }}>
                                  {i18n.t(k._110)}
                                </Title>
                                <Subtitle
                                  style={{
                                    color: '#292929',
                                    fontFamily: 'Rubik',
                                    alignSelf: 'flex-start',
                                    fontSize: 14,
                                  }}>
                                  {i18n.t(k._77)}
                                </Subtitle>
                              </View>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Image
                                  source={require(`./../res/images/clock.png`)}
                                  style={{
                                    width: 24,
                                    height: 24,
                                    alignSelf: 'center',
                                    marginTop: 8,
                                    marginBottom: 8,
                                  }}
                                  tintColor={
                                    this.state.status === 2
                                      ? i18n.t(k.EBBD)
                                      : i18n.t(k._57)
                                  }
                                />

                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  marginHorizontal: sizeWidth(3),
                                }}>
                                <Title
                                  styleName="bold"
                                  style={{
                                    color:
                                      this.state.status === 2
                                        ? '#5EBBD7'
                                        : '#292929',
                                    fontFamily: 'Rubik',
                                    fontSize: 14,
                                    alignSelf: 'flex-start',
                                    fontWeight: '700',
                                  }}>
                                  {i18n.t(k._111)}
                                </Title>
                                <Subtitle
                                  style={{
                                    color: '#292929',
                                    fontFamily: 'Rubik',
                                    alignSelf: 'flex-start',
                                    fontSize: 14,
                                  }}>
                                  {i18n.t(k._78)}
                                </Subtitle>
                              </View>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Image
                                  source={require(`./../res/images/Tracking.png`)}
                                  style={{
                                    width: 29,
                                    height: 24,
                                    alignSelf: 'center',
                                    marginTop: 8,
                                    marginBottom: 8,
                                  }}
                                  tintColor={
                                    this.state.status === 3
                                      ? i18n.t(k.EBBD)
                                      : i18n.t(k._57)
                                  }
                                />

                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                                <View
                                  style={{
                                    height: 8,
                                    width: 2,
                                    backgroundColor: '#292929',
                                    marginTop: 2,
                                    marginBottom: 2,
                                  }}
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  marginHorizontal: sizeWidth(3),
                                }}>
                                <Title
                                  styleName="bold"
                                  style={{
                                    color:
                                      this.state.status === 3
                                        ? '#5EBBD7'
                                        : '#292929',
                                    fontFamily: 'Rubik',
                                    fontSize: 14,
                                    alignSelf: 'flex-start',
                                    fontWeight: '700',
                                  }}>
                                  {this.state.deliveryss == 0
                                    ? `${i18n.t(k._112)}`
                                    : `${i18n.t(k._113)}`}
                                </Title>
                                <Subtitle
                                  style={{
                                    color: '#292929',
                                    fontFamily: 'Rubik',
                                    alignSelf: 'flex-start',
                                    fontSize: 14,
                                  }}>
                                  {this.state.deliveryss == 0
                                    ? `${i18n.t(k._114)}`
                                    : `${i18n.t(k._115)}`}
                                </Subtitle>
                              </View>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Image
                                  source={require(`./../res/images/surface1.png`)}
                                  style={{
                                    width: 24,
                                    height: 29,
                                    alignSelf: 'center',
                                  }}
                                  tintColor={
                                    this.state.status >= 4
                                      ? i18n.t(k.EBBD)
                                      : i18n.t(k._57)
                                  }
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  marginHorizontal: sizeWidth(3),
                                }}>
                                <Title
                                  styleName="bold"
                                  style={{
                                    color:
                                      this.state.status >= 4
                                        ? '#5EBBD7'
                                        : '#292929',
                                    fontFamily: 'Rubik',
                                    fontSize: 14,
                                    alignSelf: 'flex-start',
                                    fontWeight: '700',
                                  }}>
                                  {this.state.deliveryss == 0
                                    ? `${i18n.t(k._116)}`
                                    : `${i18n.t(k._117)}`}
                                </Title>
                                <Subtitle
                                  style={{
                                    color: '#292929',
                                    fontFamily: 'Rubik',
                                    alignSelf: 'flex-start',
                                    fontSize: 14,
                                  }}>
                                  {i18n.t(k._118)}
                                </Subtitle>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    </>
                  ) : null}
                </View>
              </ScrollView>
            }
          />
          <Loader isShow={this.state.smp} />
        </Screen>
      </SafeAreaView>
    );
  }
}
