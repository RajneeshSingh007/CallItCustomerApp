import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  View,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  SectionList,
  TouchableOpacity,
  BackHandler,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Divider,
  Heading,
  Image,
  NavigationBar,
  Screen,
  Subtitle,
  Title,
  Caption,
} from '@shoutem/ui';
import * as Animatable from 'react-native-animatable';
import DummyLoader from '../util/DummyLoader';
import * as Pref from './../util/Pref';
import * as Helper from './../util/Helper';
import NavigationActions from '../util/NavigationActions';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import * as Lodash from 'lodash';
import {
  Card,
  Button,
  Checkbox,
  Dialog,
  Portal,
  Colors,
  TextInput,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import {EmptyMessage} from './EmptyMessage';

var now = new Date().getDay();

/**
 * Fav page
 */
export default class FavPage extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.onFilterClick = this.onFilterClick.bind(this);
    this.state = {
      progressView: false,
      searchVisibility: false,
      clone: [],
      favList: [],
      filterView: false,
      filterOpenNow: false,
      filterDelivery: false,
      filterKusher: false,
      filterRating: 0,
      filterKM: 0,
      filterDistance: false,
      filterBusiness: i18n.t(k._4),
      filterCat: i18n.t(k._4),
      filterKusherr: 0,
      filterDeliveryy: 0,
      filterOpenNoww: 0,
      fakelist: [],
      token: '',
    };
  }

  componentDidMount() {
    this.willfocusListener = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({progressView: true});
        Pref.getVal(Pref.bearerToken, value => {
          const rm = Helper.removeQuotes(value);
          this.setState({token: rm});
        });
      },
    );
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.setState({progressView: true});
      this.fetchFavData();
    });
  }

  componentWillUnmount() {
    if (this.focusListener !== undefined) {
      this.focusListener.remove();
    }
    if (this.willfocusListener !== undefined) {
      this.willfocusListener.remove();
    }
  }

  backClick = () => {
    // if(this.state.filterView){
    //   this.setState({
    //     filterView: false,
    //     filterOpenNow: false,
    //     filterDelivery: false,
    //     filterKusher: false,
    //     filterRating: 0,
    //     filterKM: 0,
    //     filterDistance: false,
    //     filterBusiness: '',
    //     filterCat: '',
    //     filterKusherr: 0,
    //     filterDeliveryy: 0,
    //     filterOpenNoww: 0, });
    //   this.fetchFavData();
    //   return true;
    // }else{
    //   return false;
    // }
  };

  onFilterClick = () => {
    const ogData = this.state.clone;
    let sortedData = [];
    if (this.state.filterCat !== '') {
      sortedData = Lodash.orderBy(
        ogData,
        [{category_name: this.state.filterCat}],
        ['desc'],
      );
      //////console.log('sorted', 8);
    } else if (this.state.filterDelivery === true) {
      sortedData = Lodash.orderBy(ogData, ['hasDelivery'], ['desc']);
      //////console.log('sorted', 7);
    } else if (this.state.filterRating === 2) {
      sortedData = Lodash.orderBy(ogData, ['rating'], ['desc']);
      //////console.log('sorted', 6);
    } else if (this.state.filterRating === 1) {
      sortedData = Lodash.orderBy(ogData, ['rating'], ['asc']);
      //////console.log('sorted', 5);
    } else if (
      this.state.filterDelivery === true &&
      this.state.filterRating === 2
    ) {
      sortedData = Lodash.orderBy(
        ogData,
        ['hasDelivery', 'rating'],
        ['desc', 'desc'],
      );

      //////console.log('sorted', 4);
    } else if (
      this.state.filterDelivery === true &&
      this.state.filterRating === 1
    ) {
      sortedData = Lodash.orderBy(
        ogData,
        ['hasDelivery', 'rating'],
        ['desc', 'asc'],
      );

      //////console.log('sorted', 3);
    } else if (this.state.filterDistance === true) {
      this.fetchAllCat(
        this.state.token,
        this.state.currentLon,
        this.state.currentLat,
        0,
        Number(this.state.filterKM).toFixed(0),
      );
      //////console.log('sorted', 2);
    } else {
      sortedData = ogData;
      //////console.log('sorted', 1);
    }
    this.setState({
      favList: sortedData,
      filterKM: 1,
      filterRating: 0,
      filterDelivery: false,
      filterDistance: false,
      filterKusher: false,
      filterOpenNow: false,
      filterDeliveryy: 0,
      filterKusherr: 0,
      filterOpenNoww: 0,
      filterView: false,
    });
  };

  itemClickx(item) {
    //NavigationActions.navigate("NewBusinessPage", { item: item, mode: false });
    Helper.networkHelperToken(
      Pref.BusinessBranchDetailUrl + item.idbranch,
      Pref.methodGet,
      this.state.token,
      result => {
        const tuu = result.branch;
        tuu.imageurl = result.imageUrl;
        tuu.description = item.description;
        tuu.serviceFreeservices = result.freeServices || [];
        NavigationActions.navigate('NewBusinessPage', {item: tuu, mode: false});
      },
      error => {
        //error
      },
    );
  }

  myFunction() {
    return new Promise((resolve, reject) => {
      this.setState({progressView: true});
      let fetches = [];
      let arr = [];
      const {fakelist} = this.state;
      for (let i = 0; i < fakelist.length; i++) {
        const item = fakelist[i];
        fetches.push(
          fetch(Pref.BusinessBranchDetailUrl + item.idbranch, {
            method: Pref.methodGet,
            headers: {
              Authorization: 'Bearer ' + this.state.token,
            },
          })
            .then(data => data.json())
            .then(dataJson => {
              let {branch} = dataJson;
              const urlx = dataJson.imageUrl;
              branch.description = item.description;
              branch.imageurl = urlx;
              arr[i] = branch;
            }),
        );
      }
      Promise.all(fetches).then(() => {
        resolve(arr);
      });
    });
  }

  /**
   * Fetch All fav Data
   */
  fetchFavData() {
    Pref.getVal(Pref.favData, value => {
      const dx = JSON.parse(value);
      const ret = Lodash.reverse(dx);
      this.setState({progressView: false, favList: ret, clone: ret});
    });
  }

  parsetime = time => {
    if (time == undefined || time == null) {
      return '';
    }
    if (time.includes('#')) {
      const g = time.split('\n');
      let data = '';
      for (let index = 0; index < g.length; index++) {
        if (now === index) {
          data = g[index]; //+ '-' + g[index + 1] + " :" + g[index+2];
          break;
        }
      }
      return data.replace(/#/g, ':').trim();
    } else {
      return '';
    }
  };

  renderRow(item, index) {
    return (
      <TouchableWithoutFeedback onPress={() => this.itemClickx(item)}>
        <Card
          style={{
            marginHorizontal: sizeWidth(4),
            marginVertical: sizeHeight(2),
            height: sizeHeight(20),
            borderColor: '#dedede',
            ...Platform.select({
              android: {
                elevation: 2,
              },

              default: {
                shadowColor: 'rgba(0,0,0, .2)',
                shadowOffset: {height: 0, width: 0},
                shadowOpacity: 1,
                shadowRadius: 1,
              },
            }),
          }}>
          <View style={{flexDirection: 'row'}}>
            {/* <View style={[styles.triangleCorner, { alignContent: 'flex-end', alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'center', }]}>
               <Subtitle style={{
                color: 'white',
                fontFamily: 'Rubik',
                fontSize: 17,
                marginTop: sizeHeight(6),
                marginEnd: sizeWidth(1.5),
                transform: [{ rotate: '-45 deg' }]
               }}>25%</Subtitle>
               </View> */}
            {item.imageurl !== undefined && item.imageurl !== null ? (
              <Image
                styleName="large-square"
                source={{uri: `${Pref.BASEURL}${item.imageurl}`}}
                style={{
                  width: 124,
                  height: sizeHeight(20),
                  borderTopRightRadius: 8,
                  borderTopStartRadius: 8,
                  borderBottomRightRadius: 8,
                  borderBottomStartRadius: 8,
                }}
              />
            ) : null}
            <View
              style={{
                flexDirection: 'column',
                width: '100%',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  alignContent: 'flex-start',
                  alignItems: 'flex-start',
                  marginStart: 8,
                  marginTop: 4,
                }}>
                <Title
                  styleName="bold"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                  {Helper.subslongText(item.name, 18)}
                </Title>
                <Subtitle
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 14,
                  }}>
                  {item.description}
                </Subtitle>
                {item.businessHours !== undefined &&
                item.businessHours !== null &&
                item.businessHours !== '' ? (
                  <View style={{flexDirection: 'row', marginEnd: 8}}>
                    {/* <Subtitle style={{
                     color: Helper.checktime(item.businessHours) ? '#1BB940' : '#B85050',
                     fontFamily: 'Rubik',
                     fontSize: 14,
                     }}>{Helper.parsetime(item.businessHours)}</Subtitle>
                     <View style={{
                     width: 8, height: 8, backgroundColor: '#292929', borderRadius: 8, margin: 4, alignSelf: 'center',
                     }} /> */}
                    <Subtitle
                      style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        fontSize: 14,
                      }}>
                      {this.parsetime(item.businessHours)}{' '}
                    </Subtitle>
                  </View>
                ) : null}
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  width: '100%',
                  alignContent: 'center',
                  marginStart: 8,
                  marginTop: 4,
                  paddingVertical: 4,
                  flex: 1,
                }}>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#dedede',
                    width: '56%',
                    marginHorizontal: sizeWidth(0.5),
                    marginVertical: sizeHeight(1),
                  }}
                />

                <View style={{flexDirection: 'row'}}>
                  {item.rating !== -1 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <Image
                        styleName="small v-center h-center"
                        source={require(`./../res/images/smiley.png`)}
                        style={{
                          width: 24,
                          height: 24,
                          alignSelf: 'center',
                          justifyContent: 'center',
                        }}
                      />
                      <Subtitle
                        style={{
                          padding: 2,
                          color: '#292929',
                          fontFamily: 'Rubik',
                          fontSize: 14,
                        }}>
                        {item.rating}
                      </Subtitle>
                    </View>
                  ) : null}
                  {item.message !== null &&
                  item.message !== undefined &&
                  item.message !== '' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: '#292929',
                          borderRadius: 8,
                          margin: 4,
                          alignSelf: 'center',
                        }}
                      />

                      <Subtitle
                        style={{
                          color: '#292929',
                          fontFamily: 'Rubik',
                          fontSize: 14,
                          alignSelf: 'center',
                        }}>
                        {Helper.subslongText(item.message, 10)}
                      </Subtitle>
                    </View>
                  ) : null}
                  {item.distance !== undefined &&
                  !isNaN(Number(item.distance)) ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: '#292929',
                          borderRadius: 8,
                          margin: 4,
                          alignSelf: 'center',
                        }}
                      />

                      <Subtitle
                        style={{
                          color: '#292929',
                          fontFamily: 'Rubik',
                          fontSize: 14,
                          alignSelf: 'center',
                        }}>
                        {`${Number(item.distance).toFixed(1)} ${i18n.t(k._)}`}
                      </Subtitle>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </Card>
      </TouchableWithoutFeedback>
    );
  }

  render() {
    return (
      <Screen
        style={{
          backgroundColor: 'white',
        }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationBar
          styleName="inline no-border"
          // rightComponent={
          //   <View style={{ flexDirection: 'row', marginEnd: sizeWidth(1) }}>
          //     <TouchableOpacity onPress={() => {}}>
          //       <Image source={require('./../res/images/search.png')}
          //         style={{ width: 24, height: 24, marginEnd: 16, }}
          //       />
          //     </TouchableOpacity>
          //     {/* <Image source={require('./../res/images/menu.png')}
          //       style={{ width: 24, height: 24, }}
          //     /> */}

          //   </View>
          // }
          style={{
            rightComponent: {
              flex: 0.4,
            },

            leftComponent: {
              flex: 0.4,
            },

            centerComponent: {
              flex: 0.2,
            },

            componentsContainer: {
              flex: 1,
            },
          }}
          leftComponent={
            <View style={{marginStart: 12}}>
              <Heading
                style={{
                  fontSize: 20,
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontWeight: '700',
                  alignSelf: 'center',
                }}>
                {i18n.t(k._1)}
              </Heading>
            </View>
          }
        />

        {this.state.filterView ? (
          <View style={{flexDirection: 'column', marginTop: sizeHeight(3)}}>
            <TextInput
              mode="flat"
              label={i18n.t(k.BUSINESS_NAME)}
              underlineColor="transparent"
              underlineColorAndroid="transparent"
              style={[styles.inputStyle]}
              placeholderTextColor={i18n.t(k.DEDEDE)}
              placeholder={i18n.t(k.ENTER_BUSINESS_NAME)}
              onChangeText={value => this.setState({filterBusiness: value})}
              value={this.state.filterBusiness}
            />

            <TextInput
              mode="flat"
              label={i18n.t(k.CATEGORY_NAME)}
              underlineColor="transparent"
              underlineColorAndroid="transparent"
              style={[styles.inputStyle, {marginTop: 16}]}
              placeholderTextColor={i18n.t(k.DEDEDE)}
              placeholder={i18n.t(k.ENTER_CATEGORY_NAME)}
              onChangeText={value => this.setState({filterCat: value})}
              value={this.state.filterCat}
            />

            <Subtitle
              style={{
                color: '#777777',
                fontSize: 16,
                marginTop: sizeHeight(1.5),
                alignSelf: 'flex-start',
                marginStart: sizeWidth(6),
              }}>
              {i18n.t(k.RATING)}
            </Subtitle>
            <View
              style={{
                flexDirection: 'row-reverse',
                borderRadius: 2,
                borderColor: '#dedede',
                borderStyle: 'solid',
                borderWidth: 1,
                backgroundColor: '#ffffff',
                marginHorizontal: sizeWidth(6),
                height: sizeHeight(6),
                flexWrap: 'wrap',
              }}>
              <TouchableWithoutFeedback
                onPress={() => this.setState({filterRating: 1})}>
                <View
                  style={{
                    flex: 0.5,
                    flexDirection: 'row',
                    height: '100%',
                    backgroundColor:
                      this.state.filterRating === 1 ? '#3DACCF' : 'white',
                    alignSelf: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                  }}>
                  <Title
                    styleName="bold"
                    style={{
                      color:
                        this.state.filterRating === 1 ? 'white' : '#777777',
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      alignSelf: 'center',
                      fontWeight: '400',
                      justifyContent: 'center',
                    }}>
                    {i18n.t(k.LOW_TO_HIGH)}
                  </Title>
                </View>
              </TouchableWithoutFeedback>
              <View
                style={{
                  width: 1,
                  borderColor: '#dedede',
                  borderStyle: 'solid',
                  borderWidth: 1,
                  alignSelf: 'center',
                  height: '100%',
                }}
              />

              <TouchableWithoutFeedback
                onPress={() => this.setState({filterRating: 2})}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 0.5,
                    height: '100%',
                    alignSelf: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      this.state.filterRating === 2 ? '#3DACCF' : 'white',
                  }}>
                  <Title
                    styleName="bold h-center v-center center"
                    style={{
                      color:
                        this.state.filterRating === 2 ? 'white' : '#777777',
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      fontWeight: '400',
                    }}>
                    {i18n.t(k.HIGH_TO_LOW)}
                  </Title>
                </View>
              </TouchableWithoutFeedback>
            </View>
            <Subtitle
              style={{
                color: '#777777',
                fontSize: 16,
                marginTop: sizeHeight(1.5),
                alignSelf: 'flex-start',
                marginStart: sizeWidth(8),
              }}>
              {i18n.t(k.DISTANCE)}
            </Subtitle>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: sizeWidth(8),
                justifyContent: 'space-between',
                alignContent: 'center',
                alignItems: 'center',
                paddingVertical: sizeHeight(0.5),
              }}>
              <Subtitle
                style={{
                  width: sizeWidth(16),
                  color: '#777777',
                  fontSize: 16,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}>
                {this.state.filterKM === 0 ? 1 : this.state.filterKM.toFixed(0)}
                {i18n.t(k._)}{' '}
              </Subtitle>
              <Slider
                style={{width: sizeWidth(71), alignSelf: 'center'}}
                minimumValue={1}
                maximumValue={25}
                minimumTrackTintColor={i18n.t(k.EBBD)}
                maximumTrackTintColor="#777777"
                thumbTintColor={i18n.t(k.EBBD)}
                onSlidingComplete={value =>
                  this.setState({filterKM: value, filterDistance: true})
                }
              />
            </View>
            <View
              style={{
                width: '100%',
                borderColor: '#dedede',
                borderStyle: 'solid',
                borderWidth: 1,
                alignSelf: 'center',
                marginTop: sizeHeight(2),
                height: 1,
              }}
            />

            <View
              style={{
                marginHorizontal: sizeWidth(8),
                flexDirection: 'row',
                justifyContent: 'space-between',
                top: sizeHeight(2),
              }}>
              <View style={{flexDirection: 'column'}}>
                <Subtitle
                  style={{
                    color: '#777777',
                    fontSize: 16,
                    alignSelf: 'flex-start',
                  }}>
                  {i18n.t(k.OPEN_NOW)}
                </Subtitle>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Checkbox
                    status={
                      this.state.filterOpenNoww === 2
                        ? i18n.t(k.CHECKED)
                        : i18n.t(k.UNCHECKED)
                    }
                    onPress={() =>
                      this.setState({
                        filterOpenNoww: 2,
                        filterOpenNow: true,
                      })
                    }
                    color={'#3DACCF'}
                  />

                  <Subtitle
                    style={{
                      color: '#777777',
                      fontSize: 14,
                      alignSelf: 'center',
                    }}>
                    {i18n.t(k.YES)}
                  </Subtitle>
                  <Checkbox
                    status={
                      this.state.filterOpenNoww === 1
                        ? i18n.t(k.CHECKED)
                        : i18n.t(k.UNCHECKED)
                    }
                    onPress={() =>
                      this.setState({
                        filterOpenNoww: 1,
                        filterOpenNow: false,
                      })
                    }
                    color={'#3DACCF'}
                  />

                  <Subtitle
                    style={{
                      color: '#777777',
                      fontSize: 16,
                      alignSelf: 'center',
                    }}>
                    {i18n.t(k.NO)}
                  </Subtitle>
                </View>
              </View>
              <View style={{flexDirection: 'column'}}>
                <Subtitle
                  style={{
                    color: '#777777',
                    fontSize: 16,
                    alignSelf: 'flex-start',
                  }}>
                  {i18n.t(k.DELIVERY)}
                </Subtitle>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Checkbox
                    status={
                      this.state.filterDeliveryy === 2
                        ? i18n.t(k.CHECKED)
                        : i18n.t(k.UNCHECKED)
                    }
                    onPress={() =>
                      this.setState({
                        filterDeliveryy: 2,
                        filterDelivery: true,
                      })
                    }
                    color={'#3DACCF'}
                  />

                  <Subtitle
                    style={{
                      color: '#777777',
                      fontSize: 16,
                      alignSelf: 'center',
                    }}>
                    {i18n.t(k.YES)}
                  </Subtitle>
                  <Checkbox
                    status={
                      this.state.filterDeliveryy === 1
                        ? i18n.t(k.CHECKED)
                        : i18n.t(k.UNCHECKED)
                    }
                    onPress={() =>
                      this.setState({
                        filterDeliveryy: 1,
                        filterDelivery: false,
                      })
                    }
                    color={'#3DACCF'}
                  />

                  <Subtitle
                    style={{
                      color: '#777777',
                      fontSize: 16,
                      alignSelf: 'center',
                    }}>
                    {i18n.t(k.NO)}
                  </Subtitle>
                </View>
              </View>
            </View>
            <View
              style={{
                marginHorizontal: sizeWidth(8),
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View style={{flexDirection: 'column', top: sizeHeight(3.5)}}>
                <Subtitle
                  style={{
                    color: '#777777',
                    fontSize: 16,
                    alignSelf: 'flex-start',
                  }}>
                  {i18n.t(k.KUSHER)}
                </Subtitle>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Checkbox
                    status={
                      this.state.filterKusherr === 2
                        ? i18n.t(k.CHECKED)
                        : i18n.t(k.UNCHECKED)
                    }
                    onPress={() =>
                      this.setState({
                        filterKusherr: 2,
                        filterKusher: true,
                      })
                    }
                    color={'#3DACCF'}
                  />

                  <Subtitle
                    style={{
                      color: '#777777',
                      fontSize: 16,
                      alignSelf: 'center',
                    }}>
                    {i18n.t(k.YES)}
                  </Subtitle>
                  <Checkbox
                    status={
                      this.state.filterKusherr === 1
                        ? i18n.t(k.CHECKED)
                        : i18n.t(k.UNCHECKED)
                    }
                    onPress={() =>
                      this.setState({
                        filterKusherr: 1,
                        filterKusher: false,
                      })
                    }
                    color={'#3DACCF'}
                  />

                  <Subtitle
                    style={{
                      color: '#777777',
                      fontSize: 16,
                      alignSelf: 'center',
                    }}>
                    {i18n.t(k.NO)}
                  </Subtitle>
                </View>
              </View>
            </View>
            <Button
              styleName=" muted border"
              mode={i18n.t(k.CONTAINED)}
              uppercase={true}
              dark={true}
              loading={false}
              style={[styles.buttonStyle, {top: sizeHeight(9)}]}
              onPress={this.onFilterClick}>
              <Subtitle
                style={{
                  color: 'white',
                }}>
                {i18n.t(k.APPLY)}
              </Subtitle>
            </Button>
          </View>
        ) : (
          <View
            styleName="vertical"
            style={{
              flex: 1,
              backgroundColor: 'white',
            }}>
            <DummyLoader
              visibilty={this.state.progressView}
              center={
                this.state.favList !== null && this.state.favList.length > 0 ? (
                  <FlatList
                    extraData={this.state}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    data={this.state.favList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item: item, index}) =>
                      this.renderRow(item, index)
                    }
                  />
                ) : (
                  <EmptyMessage
                    name={require(`./../res/images/fav.png`)}
                    message={i18n.t(k._3)}
                  />
                )
              }
            />
          </View>
        )}
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  triangleCorner: {
    position: 'absolute',
    right: 0,
    height: sizeHeight(10),
    borderStyle: i18n.t(k.SOLID),
    borderRightWidth: sizeWidth(16),
    borderBottomWidth: sizeHeight(10),
    borderRightColor: '#3DACCF',
    borderBottomColor: 'transparent',
    borderTopEndRadius: 8,
  },

  inputStyle: {
    height: sizeHeight(8),
    borderRadius: 2,
    borderColor: i18n.t(k.DEDEDE1),
    borderStyle: i18n.t(k.SOLID),
    borderWidth: 1,
    backgroundColor: i18n.t(k.FFFFFF),
    marginHorizontal: sizeWidth(8),
  },

  buttonStyle: {
    color: i18n.t(k.WHITE),
    bottom: 0,
    paddingVertical: 6,
    width: i18n.t(k._5),
    backgroundColor: i18n.t(k.DACCF),
    textAlign: 'center',
  },
});
