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
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Card, Colors, List, Button} from 'react-native-paper';
import {
  Image,
  Divider,
  NavigationBar,
  Row,
  Screen,
  Subtitle,
  Title,
  TouchableOpacity,
  Heading,
  View,
} from '@shoutem/ui';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import NavigationActions from '../util/NavigationActions';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import PushNotificationAndroid from 'react-native-push-android';
import DummyLoader from '../util/DummyLoader';
import * as Lodash from 'lodash';
import Moment from 'moment';
import {Loader} from './Loader';

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
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    BackHandler.addEventListener('hardwareBackPress', this.backClick);
    const {navigation} = this.props;
    const item = navigation.getParam('item', null);
    if (item !== null) {
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
              //console.log('ServerTimeUrl', value);
              const convertTime = Moment.utc(value)
                .utcOffset(2, false)
                .format('YYYY-MM-DD HH');
              //console.log('convertTime', convertTime);
              this.setState({
                convertTime: convertTime,
              });
            },
            error => {
              //console.log('err', error);
            },
          );
        });
      });
    }

    // this.willfocusListener = this.props.navigation.addListener(
    //   'willFocus',
    //   () => {
    //     this.setState({progressView: true});
    //   },
    // );
    // this.focusListener = this.props.navigation.addListener('didFocus', () => {
    //   const {navigation} = this.props;
    //   const item = navigation.getParam('item', null);
    //   if (item !== null) {
    //     this.fetchData(item);
    //   }
    // });
    this._notificationEvent = PushNotificationAndroid.addEventListener(
      'notification',
      details => {
        PushNotificationAndroid.notify(details);
        this.refresh();
      },
    );
  }

  refresh = () => {
    //console.log('isHistory', this.state.isHistory);
    if (this.state.isHistory) {
      this.setState({progressView: true});
      Helper.networkHelperToken(
        Pref.GetOrdersUrl,
        Pref.methodGet,
        this.state.token,
        result => {
          this.setState({progressView: false});
          const sumclone = result.order_Bs;
          const fii = Lodash.findIndex(sumclone, {idorder: this.state.idorder});
          if (fii !== -1) {
            const kddd = sumclone[fii];
            this.setState({
              status: kddd.status,
              businessMessage: kddd.business_message,
            });
          }
        },
        error => {
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
      const groupByProduct = Lodash.groupBy(allDatas, item => item.serviceName);
      const finalDisplayData = [];
      Object.keys(groupByProduct).map(keyx => {
        let pppp = groupByProduct[keyx];
        Lodash.map(pppp, (firspos, index) => {
          const {extras, message, price, idorder, serviceName} = firspos;
          let total = Number(price);
          let found = false;
          for (let lu = index + 1; lu < pppp.length; lu++) {
            const cc = pppp[lu];
            const check = this.objectsEqual(extras, cc.extras);
            if (check && message === cc.message) {
              found = true;
              total += Number(cc.price);
            }
          }
          //console.log(`found`, found);
          //if (find === undefined) {
          const exstr = Helper.groupExtraWithCountString(extras, found);
          const find = Lodash.filter(
            finalDisplayData,
            z => z.serviceName === keyx,
          );
          if (find.length === 0) {
            finalDisplayData.push({
              serviceName: keyx,
              extraDisplayArray: exstr,
              message: message,
              price: found ? total : price,
              counter: found ? pppp.length : 0,
            });
          }

          //}
        });
      });

      // const mapdataList = Lodash.map(allDatas, (ele, index) => {
      //   const extraDisplayArray = Helper.groupExtraWithCountString(
      //     ele.extras,
      //     false,
      //   );
      //   ele.extraDisplayArray = extraDisplayArray;
      //   return ele;
      // });
      //console.log(`extraDisplayArray`, mapdataList);
      this.setState(
        {
          progressView: false,
          idbranch: firstData.idbranch,
          deliveryss: allDatas[0].isdelivery,
          isHistory: firstData.isHistory,
          keyx: firstData.keys,
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
          orderidList:
            firstData.orderidList === undefined ? [] : firstData.orderidList,
        },
        () => {
          //console.log(`imageUrl`, this.state.imageUrl);
          Helper.networkHelperToken(
            Pref.BusinessBranchDetailUrl + firstData.idbranch,
            Pref.methodGet,
            this.state.token,
            result => {
              //console.log(`result`, result);
              this.setState({imageUrl: result.imageUrl});
            },
            error => {
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
        //value
        //console.log('ServerTimeUrl', value);
        const convertTime = Moment.utc(value)
          .utcOffset(2, false)
          .format('YYYY-MM-DD HH');
        //console.log('convertTime', convertTime);
        this.setState({convertTime: convertTime});
      },
      error => {
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
    if (this._notificationEvent !== undefined) {
      this._notificationEvent.remove();
    }
  }

  _handleAppStateChange = async nextAppState => {
    const {appState} = this.state;
    //////console.log('nextAppState -->', nextAppState);
    //////console.log('appState -->', appState);
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

  // filterExtrasCat(result) {
  //   let groupedExtra = Lodash.groupBy(result, function(exData) {
  //     if (exData.category !== '') {
  //       return exData.category;
  //     }
  //   });
  //   let fias = [];
  //   Object.keys(groupedExtra).map(key => {
  //     let filterExtras = key + ': ';
  //     const datass = groupedExtra[key];
  //     Lodash.map(datass, (ele, index) => {
  //       if (index === datass.length - 1) {
  //         filterExtras += ele.name;
  //       } else {
  //         filterExtras += ele.name + ',';
  //       }
  //     });
  //     //console.log('filterExtras', filterExtras);
  //     fias.push({data: filterExtras});
  //   });
  //   ////console.log('fias', fias);
  //   return fias;
  // }

  renderRow(itemx, index) {
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
            {itemx.serviceName}{' '}
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
    const {datas, token, convertTime, idbranch, orderidList} = this.state;
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

              Lodash.map(datas, (ele, index) => {
                bodyList.push({
                  Id_order:
                    orderidList.length > 0 ? orderidList[index] : ele.idorder,
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
                er => {
                  this.setState({smp: false});
                },
              );
            },
            error => {},
          );
        },
      },
    ]);
  };

  render() {
    return (
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
                    source={{uri: `${Pref.BASEURL}${this.state.imageUrl}`}}
                    style={{height: sizeHeight(24), resizeMode: 'contain'}}
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
                            this.renderRow(item, index)
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
                          {`${i18n.t(k._17)}`}{' '}
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
                      {this.state.totalPrice !== '' &&
                      this.state.totalPrice !== null &&
                      this.state.totalPrice !== undefined ? (
                        <Title
                          style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            alignSelf: 'flex-start',
                            fontSize: 15,
                            fontWeight: '400',
                          }}>
                          {`${i18n.t(k._108)}`}{' '}
                          <Title
                            style={{
                              color: '#292929',
                              fontFamily: 'Rubik',
                              alignSelf: 'flex-start',
                              fontSize: 15,
                              fontWeight: '700',
                            }}>
                            {`${i18n.t(k._6)}${this.state.totalPrice}`}
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
                          {this.state.paid == 0 ? i18n.t(k._76) : i18n.t(k._75)}
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

                      {this.state.status === -1 ? null : (
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
    );
  }
}

/**
 * StyleSheet
 */
const styles = StyleSheet.create({
  circleView: {
    width: 42,
    height: 42,
    alignItems: i18n.t(k.CENTER),
    justifyContent: i18n.t(k.CENTER),
    borderWidth: 1,
    borderColor: Colors.grey300,
    borderRadius: 24,
  },
  loginButtonStyle: {
    color: i18n.t(k.WHITE),
    paddingVertical: sizeWidth(1.5),
    marginHorizontal: sizeWidth(4),
    marginBottom: sizeHeight(2),
    marginTop: sizeHeight(2),
    backgroundColor: i18n.t(k.DACCF),
  },
});
