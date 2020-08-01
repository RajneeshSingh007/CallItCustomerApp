import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Share,
  Linking,
  TouchableWithoutFeedback,
  BackHandler,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Card, Colors, FAB} from 'react-native-paper';
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
  ImageBackground,
  Tile,
  Overlay,
} from '@shoutem/ui';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import NavigationActions from '../util/NavigationActions';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import OrderProcess1 from './OrderProcess1';
import DummyLoader from '../util/DummyLoader';
import * as Animatable from 'react-native-animatable';
import * as Lodash from 'lodash';
import {ScrollView} from 'react-native-gesture-handler';
import Moment from 'moment';
import {SafeAreaView} from 'react-navigation';

var data = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
var now = new Date().getDay();
var currentDate = new Date();
const openBiz = `פתוח`;
const closedBiz = `סגור`;
const busyBiz = `עמוס`;
let scrollY = 0;

export default class NewBusinessPage extends React.Component {
  constructor(props) {
    super(props);
    this.scrollViewRef = React.createRef();
    this.backClick = this.backClick.bind(this);
    this.getOrderCounter = this.getOrderCounter.bind(this);
    this.parsetime = this.parsetime.bind(this);
    this.checkStatusBiz = this.checkStatusBiz.bind(this);
    this.phoneCalls = this.phoneCalls.bind(this);
    this.locationOpen = this.locationOpen.bind(this);
    this.backScroll = this.backScroll.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.state = {
      favData: [],
      item: null,
      progressView: false,
      isFav: false,
      favIndex: 0,
      counter: 0,
      currentLog: 0,
      currentLat: 0,
      showOrderNo: false,
      cartDatas: [],
      branchid: 0,
      tabNames: null,
      eachTabData: null,
      deliveryPrice: i18n.t(k._4),
      customerdt: i18n.t(k._4),
      isMode: false,
      editData: null,
      cartBranchId: 0,
      isTimeExpanded: false,
      businessHoursx: '',
      splittedDates: [],
      hasDelivery: 0,
      checkerDate: null,
      isOpen:''
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backClick);
    this.willfocusListener = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({progressView: true});
      },
    );
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      Pref.setVal(Pref.HomeReload, null);
      this.setState({progressView: true});
      this.work();
    });
  }

  componentWillUnmount() {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
    }
    this.scrollViewRef = null;
    BackHandler.removeEventListener('hardwareBackPress', this.backClick);
    if (this.focusListener !== undefined) {
      this.focusListener.remove();
    }
    if (this.willfocusListener !== undefined) {
      this.willfocusListener.remove();
    }
  }

  backClick = () => {
    //////console.log('back', "NewBusinessPage");
    NavigationActions.goBack();
    return true;
  };

  work() {
    const {state} = this.props.navigation;
    const data = state.params.item;
    //const val = state.params.mode;
    //console.log('item', data);
    this.setState({
      item: data,
      progressView: false,
      hasDelivery: data.hasDelivery === null ? 0 : data.hasDelivery,
    });
    Pref.getVal(Pref.EditModeEnabled, value => {
      //console.log('editmode', value);
      if (value !== undefined && value !== '' && value !== null) {
        const editData = state.params.editData;
        const mode = Helper.removeQuotes(value) === '1' ? true : false;
        this.setState({
          mode: mode,
          editData:
            Helper.removeQuotes(value) === '1' ? editData : null,
        });
      }
    });
    this.getOrderCounter();
    Pref.getVal(Pref.favData, value => {
      if (value !== '' && value != null && value.length > 0) {
        const favex = JSON.parse(value);
        const findFav = Lodash.findIndex(favex, {
          idbranch: data.idbranch,
        });

        // favex[findFav] =
        // Pref.setVal(Pref.favData, favex);
        if (findFav !== -1) {
          favex[findFav] = this.state.item;
          Pref.setVal(Pref.favData, favex);
        }
        this.setState({
          isFav: findFav === -1 ? false : true,
          favIndex: findFav,
          favData: favex,
        });
      } else {
        this.setState({isFav: false});
      }
    });
    this.fetchAllServices(data.idbranch);
  }

  /**
   * Fetch All Services
   */
  fetchAllServices(idx) {
    this.setState({progressView: true});
    Pref.getVal(Pref.bearerToken, value => {
      const token = Helper.removeQuotes(value);
      this.setState({token: token});
      
      Helper.networkHelperToken(
        Pref.BranchStatusUrl+idx,
        Pref.methodGet,
        token,
        res => {
          this.setState({isOpen: res});
        },
        e => {
          console.log(e)
        },
      );

      Helper.networkHelperToken(
        Pref.ServerTimeUrl,
        Pref.methodGet,
        token,
        value => {
          //value
          //console.log('ServerTimeUrl', value);
          const convertTime = Moment.utc(value)
            .utcOffset(2, false)
            .format('YYYY/MM/DD HH:mm');
          const checkerDate = new Date(convertTime);
          //console.log('convertTime', convertTime, checkerDate);
          this.setState({checkerDate: checkerDate});
        },
        error => {
          //console.log('err', error);
        },
      );

      Helper.networkHelperToken(
        Pref.GetInfoUrl,
        Pref.methodGet,
        token,
        result => {
          Pref.setVal(Pref.CustData, result);
          this.setState({customerdt: result});
        },
        error => {},
      );

      Helper.networkHelperToken(
        Pref.BranchAllServiceUrl + idx,
        Pref.methodGet,
        token,
        result => {
          //console.log('result', result[0].fkbranchS)
          this.setState({progressView: false});
          if (result !== null && result.length > 0) {
            let groupedExtra = Lodash.groupBy(result, function(exData) {
              if (exData.category !== '') {
                return exData.category.toLowerCase();
              }
            });
            const serviceCat = Object.keys(groupedExtra).map(key => ({
              cat: key,
              data: groupedExtra[key],
            }));

            //console.log(`serviceCat`, serviceCat);

            this.setState({
              branchid: idx,
              tabNames: serviceCat,
              eachTabData: result,
            });
          }
        },
        error => {
          this.setState({progressView: false});
        },
      );
    });
  }

  getOrderCounter() {
    Pref.getVal(Pref.cartItem, value => {
      const cartData = JSON.parse(value);
      //////console.log('cartData', cartData);
      if (cartData !== undefined && cartData !== null && cartData.length > 0) {
        const firstItem = cartData[0];
        const cartBranchId = firstItem.branchData.idbranch;
        this.setState({
          cartBranchId: cartBranchId,
          cartDatas: cartData,
          counter: cartData.length,
          showOrderNo: true,
        });
      } else {
        this.setState({cartBranchId: 0, showOrderNo: false});
      }
    });
  }

  favClick() {
    if (this.state.isFav === false) {
      const yyy = this.state.item;
      const xxx = this.state.item;
      let ty = this.state.favData;
      yyy.description = xxx.description;
      yyy.imageurl = xxx.imageurl;
      ty.push(yyy);
      Pref.setVal(Pref.favData, ty);
      this.setState({isFav: true});
    } else {
      const fevin = this.state.favIndex;
      this.state.favData.splice(fevin, 1);
      Pref.setVal(Pref.favData, this.state.favData);
      this.setState({isFav: false});
    }
  }

  /**
   * Share Business
   */
  shareBusiness = () => {
    let ur = '';
    if (
      this.state.item.websiteUrl !== undefined &&
      this.state.item.websiteUrl !== null
    ) {
      ur = this.state.item.websiteUrl;
    }
    Share.share({
      title: this.state.item.name,
      message: this.state.item.message,
      url: ur,
      subject: 'CallIt',
    });
  };

  isValid(date, h1, m1, h2, m2) {
    var h = date.getHours();
    var m = date.getMinutes();
    return (h1 < h || (h1 == h && m1 <= m)) && (h < h2 || (h == h2 && m <= m2));
  }

  /**
   * deprecated
   * @param {} time
   */
  checkStatusBiz = time => {
    if (time == undefined || time == null) {
      return false;
    }
    if (time.includes('#')) {
      if (this.state.checkerDate !== null) {
        const serverMonth = this.state.checkerDate.getMonth() + 1;
        const deviceMonth = currentDate.getMonth() + 1;

        // if (currentDate.getFullYear() === this.state.checkerDate.getFullYear() &&
        //     deviceMonth === serverMonth &&
        //     currentDate.getDate() === this.state.checkerDate.getDate()) {
        const g = time.split('\n');
        let data = '';
        const day = this.state.checkerDate.getDay();
        for (let index = 0; index < g.length; index++) {
          if (day === index) {
            data = g[index]; //+ '-' + g[index + 1] + " :" + g[index+2];
            break;
          }
        }
        //console.log('day', day);
        if (data.includes('סגור')) {
          return false;
        } else {
          const fool = data.replace(/#/g, ':');
          const jj = fool.split(' ');

          const startSp = jj[1].split(':');
          const endSp = jj[3].split(':');

          const start = Number(startSp[0]) * 60 + Number(startSp[1]);
          const end = Number(endSp[0]) * 60 + Number(endSp[1]);
          const now =
            this.state.checkerDate.getHours() * 60 +
            this.state.checkerDate.getMinutes();
          if (start <= now && now <= end) {
            return true;
          } else {
            return false;
          }
        }
        // }else{
        //     return false;
        // }
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  /**
   * biz expand time parse
   * @param {} time 
   */
  parsetime = time => {
    if (time == undefined || time == null) {
      return '';
    }
    if (this.state.isTimeExpanded === true) {
      return time.replace(/#/g, ':');
    }
    if (time.includes('#')) {
      if (this.state.checkerDate !== null) {
        const g = time.split('\n');
        let data = '';
        const day = this.state.checkerDate.getDay();
        for (let index = 0; index < g.length; index++) {
          if (day === index) {
            data = g[index]; //+ '-' + g[index + 1] + " :" + g[index+2];
            break;
          }
        }
        return data.replace(/#/g, ':').trim();
      } else {
        const g = time.split('\n');
        let data = '';
        // const day = this.state.checkerDate.getDay();
        for (let index = 0; index < g.length; index++) {
          if (now === index) {
            data = g[index]; //+ '-' + g[index + 1] + " :" + g[index+2];
            break;
          }
        }
        return data.replace(/#/g, ':').trim();
      }
    } else {
      return time.replace(/#/g, ':');
    }
  };

  phoneCalls = () => {
    const phoneNumber = this.state.item.phone;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  locationOpen = () => {
    const lat = this.state.item.lat;
    const lng = this.state.item.lon;
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${lat},${lng}`;
    const label = 'Callit';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  handleScroll = e => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > 0) {
      scrollY = y;
    }
  };

  backScroll = () => {
    if (
      this.scrollViewRef !== null &&
      this.scrollViewRef.current !== null &&
      this.scrollViewRef.current.scrollTo !== null
    ) {
      this.timer = setTimeout(() => {
        if (
          this.scrollViewRef !== null &&
          this.scrollViewRef.current !== null &&
          this.scrollViewRef.current.scrollTo !== null
        ) {
          //console.log(`scrollY`, scrollY);
          this.scrollViewRef.current.scrollTo({
            x: 0,
            y: scrollY,
            animated: false,
          });
          clearTimeout(this.timer);
        }
      }, 16);
    }
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
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                onScroll={this.handleScroll}
                ref={this.scrollViewRef}
                nestedScrollEnabled
                scrollEventThrottle={16}>
                {this.state.item !== null &&
                this.state.item !== undefined ? (
                  <Image
                    styleName="large-wide"
                    style={{height: sizeHeight(24), resizeMode: 'contain'}}
                    source={{
                      uri: `${Pref.BASEURL}${this.state.item.imageurl}`,
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
                    // rightComponent={}
                    leftComponent={
                      <View
                        styleName="horizontal space-between"
                        style={{marginStart: 12}}>
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
                <View>
                  {this.state.item !== null &&
                  this.state.item !== undefined ? (
                    <View style={{flexDirection: 'column'}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginStart: sizeWidth(4),
                          marginVertical: sizeHeight(2),
                          paddingHorizontal: sizeWidth(1.5),
                          justifyContent: 'space-between',
                          backgroundColor: 'white',
                        }}>
                        <View style={{flexDirection: 'column'}}>
                          <Title
                            styleName="bold"
                            style={{
                              color: '#292929',
                              fontFamily: 'Rubik',
                              fontSize: 20,
                              alignSelf: 'flex-start',
                              fontWeight: '700',
                            }}>
                            {this.state.item.name}
                          </Title>
                          <View style={{flexDirection: 'row'}}>
                            <Subtitle
                              style={{
                                color: '#292929',
                                fontFamily: 'Rubik',
                                alignSelf: 'flex-start',
                                fontSize: 16,
                              }}>
                              {this.state.item.description}
                            </Subtitle>
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                backgroundColor: '#292929',
                                borderRadius: 8,
                                alignSelf: 'center',
                                margin: 6,
                              }}
                            />
                            {this.state.isOpen !== '' ?
                            <Subtitle
                              style={{
                                color:
                                  this.state.isOpen === 'open'
                                    ? '#1BB940'
                                    : this.state.isOpen === 'closed'
                                    ? '#B72727'
                                    : Colors.deepOrange500,
                                fontFamily: 'Rubik',
                                alignSelf: 'flex-start',
                                fontSize: 16,
                              }}>
                              {this.state.isOpen === 'open'
                                ? `${openBiz}`
                                : this.state.isOpen === 'closed'
                                ? `${closedBiz}`
                                : `${busyBiz}`}
                            </Subtitle>
                            : null}
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignSelf: 'center',
                          }}>
                          <TouchableOpacity onPress={() => this.favClick()}>
                            <Animatable.View
                              animation="wobble"
                              duration={200}>
                              <Icon
                                name={
                                  this.state.isFav === false
                                    ? i18n.t(k.FAVORITE_BORDER)
                                    : i18n.t(k.FAVORITE)
                                }
                                size={24}
                                color={
                                  this.state.isFav === false
                                    ? '#777777'
                                    : 'red'
                                }
                                style={{
                                  padding: 4,
                                  backgroundColor: 'transparent',
                                }}
                              />
                            </Animatable.View>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View
                        style={{
                          backgroundColor: '#dedede',
                          height: 1,
                        }}
                      />

                      <View
                        style={{
                          flexDirection: 'row',
                          marginStart: sizeWidth(4),
                          marginVertical: sizeHeight(1),
                          paddingHorizontal: sizeWidth(2),
                          marginTop: sizeHeight(3),
                        }}>
                        <Image
                          source={require('./../res/images/Tracking.png')}
                          style={{
                            width: 22,
                            height: 17,
                            alignSelf: 'center',
                          }}
                        />

                        <Subtitle
                          style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            alignSelf: 'center',
                            fontSize: 14,
                            marginStart: sizeWidth(2),
                          }}>
                          {this.state.item.message}
                        </Subtitle>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginStart: sizeWidth(4),
                          paddingHorizontal: sizeWidth(2),
                          marginVertical: sizeHeight(1),
                        }}>
                        <Image
                          source={require(`./../res/images/call.png`)}
                          style={{
                            width: 17,
                            height: 17,
                            alignSelf: 'center',
                          }}
                        />

                        <TouchableWithoutFeedback onPress={this.phoneCalls}>
                          <Subtitle
                            style={{
                              color: '#3DACCF',
                              fontFamily: 'Rubik',
                              alignSelf: 'center',
                              fontSize: 14,
                              marginStart: sizeWidth(2),
                            }}>
                            {this.state.item.phone}
                          </Subtitle>
                        </TouchableWithoutFeedback>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginStart: sizeWidth(4),
                          paddingHorizontal: sizeWidth(2),
                          marginVertical: sizeHeight(1),
                          justifyContent: 'space-between',
                        }}>
                        <View style={{flexDirection: 'row'}}>
                          <Image
                            source={require(`./../res/images/smileydark.png`)}
                            style={{
                              width: 18,
                              height: 18,
                              alignSelf: 'center',
                            }}
                          />

                          <Subtitle
                            style={{
                              color: '#292929',
                              fontFamily: 'Rubik',
                              alignSelf: 'center',
                              fontSize: 14,
                              marginStart: sizeWidth(2),
                            }}>
                            {` ${i18n.t(k._59)} ${
                              this.state.item.rating === -1
                                ? i18n.t(k._60)
                                : this.state.item.rating
                            } (${this.state.item.ratingcount})`}
                          </Subtitle>
                        </View>
                        <TouchableWithoutFeedback
                          onPress={() =>
                            NavigationActions.navigate(
                              i18n.t(k.REVIEWSPAGE),
                              {
                                item: this.state.item,
                              },
                            )
                          }>
                          <Subtitle
                            style={{
                              color: '#3DACCF',
                              fontFamily: 'Rubik',
                              alignSelf: 'center',
                              fontSize: 14,
                              marginEnd: sizeWidth(2),
                            }}>
                            {`${i18n.t(k._61)}`}
                          </Subtitle>
                        </TouchableWithoutFeedback>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginStart: sizeWidth(4),
                          paddingHorizontal: sizeWidth(2),
                          marginVertical: sizeHeight(1),
                          justifyContent: 'space-between',
                        }}>
                        <View style={{flexDirection: 'row'}}>
                          <Image
                            source={require(`./../res/images/circulardark.png`)}
                            style={{
                              width: 18,
                              height: 18,
                              alignSelf: 'center',
                            }}
                          />

                          <Subtitle
                            style={{
                              color: '#292929',
                              fontFamily: 'Rubik',
                              alignSelf: 'center',
                              fontSize: 14,
                              marginStart: sizeWidth(2),
                            }}>
                            {this.parsetime(this.state.item.businessHours)}
                          </Subtitle>
                        </View>
                        <TouchableWithoutFeedback
                          onPress={() =>
                            this.setState({
                              isTimeExpanded: !this.state.isTimeExpanded,
                            })
                          }>
                          <Subtitle
                            style={{
                              color: '#3DACCF',
                              fontFamily: 'Rubik',
                              alignSelf: 'center',
                              fontSize: 14,
                              marginEnd: sizeWidth(2),
                            }}>
                            {`${i18n.t(k._62)}`}
                          </Subtitle>
                        </TouchableWithoutFeedback>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginStart: sizeWidth(4.5),
                          paddingHorizontal: sizeWidth(2),
                          marginVertical: sizeHeight(1),
                          marginBottom: sizeHeight(3),
                          justifyContent: 'space-between',
                        }}>
                        <View style={{flexDirection: 'row'}}>
                          <Image
                            source={require(`./../res/images/placeholder.png`)}
                            style={{
                              width: 16,
                              height: 22,
                              alignSelf: 'center',
                            }}
                          />

                          <TouchableWithoutFeedback
                            onPress={this.locationOpen}>
                            <Subtitle
                              style={{
                                color: '#3DACCF',
                                fontFamily: 'Rubik',
                                alignSelf: 'center',
                                fontSize: 14,
                                marginStart: sizeWidth(2),
                              }}>
                              {this.state.item.address}
                            </Subtitle>
                          </TouchableWithoutFeedback>
                        </View>
                        <TouchableWithoutFeedback
                          onPress={() => {
                            const lat = this.state.item.lat;
                            const lng = this.state.item.lon;
                            const url = `${i18n.t(
                              k.HTTPS_WWW_WAZE_COM_UL_LL,
                            )}${lat}${i18n.t(k.C1)}${lng}${i18n.t(
                              k.NAVIGATE_YES,
                            )}`;
                            Linking.openURL(url);
                          }}>
                          <Image
                            source={require(`./../res/images/waze.png`)}
                            style={{
                              width: 24,
                              height: 22,
                              alignSelf: 'center',
                              padding: 4,
                              marginEnd: 12,
                            }}
                          />
                        </TouchableWithoutFeedback>
                      </View>
                    </View>
                  ) : null}
                </View>
                {this.state.tabNames !== null &&
                this.state.tabNames !== undefined &&
                this.state.checkerDate !== undefined &&
                this.state.checkerDate !== null ? (
                  <OrderProcess1
                    currentLat={this.state.currentLat}
                    currentLog={this.state.currentLog}
                    idbranch={this.state.branchid}
                    tabNames={this.state.tabNames}
                    eachTabData={this.state.eachTabData}
                    deliveryPrice={this.state.deliveryPrice}
                    customerdt={this.state.customerdt}
                    orderChanged={() => {
                      //////console.log('k');
                      this.getOrderCounter();
                    }}
                    hasDelivery={this.state.hasDelivery}
                    mode={this.state.mode}
                    item={this.state.item}
                    editData={this.state.editData}
                    cartBranchId={this.state.cartBranchId}
                    currentNames={this.state.item.idbranch}
                    businessclosedornot={
                      this.state.isOpen === 'open' ? true : false
                    }
                    checkerDate={this.state.checkerDate}
                    backClicked={this.backScroll}
                  />
                ) : null}
              </ScrollView>
            }
          />

          {this.state.showOrderNo ? (
            <View
              style={{
                height: 48,
                width: 48,
                borderRadius: 120,
                position: 'absolute',
                bottom: 16,
                right: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableWithoutFeedback
                onPress={() =>
                  NavigationActions.navigate(i18n.t(k.FINALORDER), {
                    orderData: this.state.cartDatas,
                  })
                }>
                <Image
                  source={require(`./../res/images/cart.png`)}
                  style={{
                    width: 48,
                    height: 48,
                    alignSelf: 'center',
                    alignContent: 'center',
                  }}
                />
              </TouchableWithoutFeedback>
              <View
                style={{
                  height: 24,
                  width: 24,
                  borderRadius: 48,
                  bottom: sizeHeight(7),
                  right: sizeWidth(3),
                  alignSelf: 'flex-start',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderColor: '#3DACCF',
                  borderWidth: 1,
                }}>
                <Subtitle
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    alignSelf: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}>
                  {this.state.counter}
                </Subtitle>
              </View>
            </View>
          ) : null}
        </Screen>
      </SafeAreaView>
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

  fab: {
    position: i18n.t(k.ABSOLUTE),
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
