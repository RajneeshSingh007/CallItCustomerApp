import Slider from '@react-native-community/slider';
import {
  Heading,
  Image,
  NavigationBar,
  Screen,
  Subtitle,
  Title,
} from '@shoutem/ui';
import i18n from 'i18next';
import Lodash from 'lodash';
import React from 'react';
import {
  BackHandler,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import GetLocation from 'react-native-get-location';
import {Button, Card, Checkbox, Colors, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DummyLoader from '../util/DummyLoader';
import NavigationActions from '../util/NavigationActions';
import k from './../i18n/keys';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import {sizeHeight, sizeWidth} from './../util/Size';

var now = new Date().getDay();

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.homecatClick = this.homecatClick.bind(this);
    this.backClick = this.backClick.bind(this);
    this.renderCatItemRow = this.renderCatItemRow.bind(this);
    this.renderHomepageItemRow = this.renderHomepageItemRow.bind(this);
    this.renderRowCat = this.renderRowCat.bind(this);
    this.renderRowBusiness = this.renderRowBusiness.bind(this);
    this.onFilterClick = this.onFilterClick.bind(this);
    this.renderRowBizSug = this.renderRowBizSug.bind(this);
    this.fetchbizsuggestions = this.fetchbizsuggestions.bind(this);
    this.fetchcatsuggestions = this.fetchcatsuggestions.bind(this);
    this.state = this.initialState();
  }

  initialState = () => {
    return {
      locaDialog: false,
      progressView: true,
      searchVisibility: false,
      clone: [],
      restaurants: [],
      categoryData: [],
      originalData: [],
      isCatgegoryClicked: 0,
      categoryname: '',
      currentLat: 0,
      currentLon: 0,
      token: i18n.t(k._4),
      filterView: false,
      filterOpenNow: false,
      filterDelivery: false,
      filterKusher: false,
      filterRating: 0,
      filterKM: 1,
      filterDistance: false,
      filterBusiness: i18n.t(k._4),
      filterCat: i18n.t(k._4),
      filterKusherr: 0,
      filterDeliveryy: 0,
      filterOpenNoww: 0,
      allBusiness: [],
      cloneBusiness: [],
      businessId: '',
      navFromBusiness: false,
      cartDatas: [],
      counter: 0,
      showOrderNo: false,
      idbusinessss: 0,
      backSearchshow: false,
      businessSuggestions: [],
      businessCatSuggestions: [],
      searchingMode: 1,
      catsList: [],
      catmodsss: 1,
      existing: false,
      existingagain: false,
      catImageList: [],
      cloneHomePageList: [],
      catClicked: false,
    };
  };

  componentDidMount() {
    try {
      Helper.requestPermissions();
    } catch (e) {
      //console.log(e);
    }
    BackHandler.addEventListener('hardwareBackPress', this.backClick);
    this.willfocusListener = this.props.navigation.addListener(
      'willFocus',
      () => {
        if (this.state.restaurants.length > 0) {
          if (this.state.isCatgegoryClicked !== 0) {
            Pref.getVal(Pref.HomeReload, value => {
              const valuevalue = Helper.removeQuotes(value);
              if (
                valuevalue !== undefined &&
                valuevalue !== null &&
                Number(valuevalue) === 1
              ) {
                if (this.state.catClicked === false) {
                  this.setState({
                    progressView: true,
                  });
                } else {
                  this.backrestore();
                }
              }
            });
          }
        }
      },
    );
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.getOrderCounter();
      if (this.state.restaurants.length > 0) {
        //this.setState({progressView:true})
        if (this.state.isCatgegoryClicked !== 0) {
          Pref.getVal(Pref.HomeReload, value => {
            const valuevalue = Helper.removeQuotes(value);
            if (
              valuevalue !== undefined &&
              valuevalue !== null &&
              Number(valuevalue) === 1
            ) {
              if (this.state.catClicked === false) {
                this.setState(this.initialState(), () => {
                  this.homesetup();
                });
              } else {
                this.backrestore();
              }
              //console.log(`valuevalue`, valuevalue);
            }
          });
        }
      } else {
        this.homesetup();
      }
    });
  }

  homesetup() {
    Pref.getVal(Pref.bearerToken, result => {
      const rem = Helper.removeQuotes(result);

      this.setState({token: rem}, () => {
        RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        })
          .then(data => {
            this.geodatass();
          })
          .catch(err => {
            this.setState({
              progressView: true,
              locaDialog: true,
              backSearchshow: false,
            });
            this.fetchallbusinessss();
            Pref.setVal(Pref.AskedLocationDailog, '0');
          });
        Helper.networkHelperToken(
          Pref.GetBusinessCats,
          Pref.methodGet,
          this.state.token,
          result => {
            const filss = [];
            for (let index = 0; index < result.length; index++) {
              const element = result[index];
              filss.push({name: element});
            }
            this.setState({catsList: filss});
          },
          error => {
            //
          },
        );
      });
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backClick);
    if (this.focusListener !== undefined) {
      this.focusListener.remove();
    }
    if (this.willfocusListener !== undefined) {
      this.willfocusListener.remove();
    }
  }

  fetchallbusinessss() {
    this.fetchAllBusinesss(true, this.state.token);
  }

  backClick = () => {
    const {
      isCatgegoryClicked,
      navFromBusiness,
      locaDialog,
      filterView,
      existing,
      existingagain,
    } = this.state;
    console.log(
      'back',
      isCatgegoryClicked,
      navFromBusiness,
      locaDialog,
      filterView,
      existing,
      existingagain,
    );
    if (
      isCatgegoryClicked === 0 &&
      !navFromBusiness &&
      locaDialog &&
      !filterView &&
      !existing
    ) {
      Pref.setVal(Pref.TempBizData, null);
      Pref.setVal(Pref.TempLocBranchData, null);
      Pref.setVal(Pref.TempLocOzranchData, null);
      Pref.setVal(Pref.AskedLocationDailog, null);
      BackHandler.exitApp();
      return false;
    } else if (
      isCatgegoryClicked === 1 &&
      navFromBusiness &&
      locaDialog &&
      !filterView &&
      existing &&
      existingagain
    ) {
      this.revertfilterBusiness();
      return true;
    } else if (
      isCatgegoryClicked === 1 &&
      navFromBusiness &&
      locaDialog &&
      !filterView &&
      existing
    ) {
      this.backrestore();
      return true;
    } else if (
      (isCatgegoryClicked === 1 &&
        !navFromBusiness &&
        !locaDialog &&
        !filterView) ||
      (!navFromBusiness && locaDialog && !filterView) ||
      (!navFromBusiness && !locaDialog && filterView) ||
      (!navFromBusiness && locaDialog && filterView) ||
      (navFromBusiness && locaDialog && !filterView)
    ) {
      this.backrestore();
      return true;
    } else if (
      (navFromBusiness && locaDialog && filterView) ||
      (navFromBusiness && !locaDialog && filterView)
    ) {
      this.filterBusiness();
      return true;
    } else if (navFromBusiness) {
      this.revertfilterBusiness();
      return true;
    } else if (isCatgegoryClicked === 0) {
      Pref.setVal(Pref.TempBizData, null);
      Pref.setVal(Pref.TempLocBranchData, null);
      Pref.setVal(Pref.TempLocOzranchData, null);
      Pref.setVal(Pref.AskedLocationDailog, null);
      BackHandler.exitApp();
      return false;
    }
  };

  geodatass = () => {
    const ispresentData = true;
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 10000,
    })
      .then(location => {
        //console.log(`location`, location)
        const lat = location.latitude;
        const lon = location.longitude;
        this.setState({
          currentLat: lat,
          currentLon: lon,
          locaDialog: false,
          backSearchshow: false,
          progressView: ispresentData,
          filterView: false,
          existing: false,
        });
        this.fetchAllCat(this.state.token, lon, lat, 0, 20);
        const body = JSON.stringify({
          Lat: lat,
          Lon: lon,
        });
        Helper.networkHelperTokenPost(
          Pref.GetImageForHomepageUrl,
          body,
          Pref.methodPost,
          this.state.token,
          result => {
            this.setState({catImageList: result});
          },
          error => {
            //
          },
        );
        Pref.setVal(Pref.AskedLocationDailog, '0');
      })
      .catch(error => {
        //console.log(`error`, error)
        this.setState({
          progressView: ispresentData,
          locaDialog: true,
          backSearchshow: false,
          filterView: false,
          existing: false,
        });
        this.fetchallbusinessss();
        Pref.setVal(Pref.AskedLocationDailog, '0');
      });
  };

  backrestore = () => {
    this.setState({
      navFromBusiness: false,
      isCatgegoryClicked: 0,
      filterCat: i18n.t(k._4),
      filterBusiness: i18n.t(k._4),
      progressView: false,
      backSearchshow: false,
      filterView: false,
      existing: false,
      restaurants: JSON.parse(JSON.stringify(this.state.cloneHomePageList)),
    });
  };

  /**
   * Fetch all category
   */
  fetchAllCat(result, lon, lat, category, radius) {
    const body = JSON.stringify({
      coordinantes: {
        lon: lon,
        lat: lat,
        category: category,
      },
      use_radius: radius === 20 ? false : true,
    });
    this.setState({isCatgegoryClicked: 0});
    const token = this.state.token;
    Helper.networkHelperTokenPost(
      Pref.SearchBrachesUrl + Number(radius),
      body,
      Pref.methodPost,
      token,
      result => {
        //console.log(`result`, result);
        this.setState({progressView: false});
        if (result && result.length > 0) {
          if (this.state.isCatgegoryClicked === 0) {
            let groupedExtra = Lodash.groupBy(result, function(exData) {
              return exData.category_name;
            });
            const serviceCat = Object.keys(groupedExtra).map(key => ({
              title: key,
              data: groupedExtra[key],
            }));
            this.setState({
              filterCat: i18n.t(k._4),
              filterBusiness: i18n.t(k._4),
              clone: serviceCat,
              originalData: result,
              restaurants: serviceCat,
              cloneHomePageList: serviceCat,
              progressView: false,
              backSearchshow: false,
            });
            Pref.setVal(Pref.TempLocBranchData, serviceCat);
            Pref.setVal(Pref.TempLocOzranchData, result);
          } else {
            Pref.setVal(Pref.TempLocBranchData, result);
            Pref.setVal(Pref.TempLocOzranchData, null);
            this.setState({
              filterCat: i18n.t(k._4),
              filterBusiness: i18n.t(k._4),
              clone: result,
              restaurants: result,
              originalData: result,
              progressView: false,
              backSearchshow: false,
              cloneHomePageList: result,
            });
          }
        }
      },
      error => {
        this.setState({progressView: false});
      },
    );
    this.fetchAllBusinesss(false, token);
  }

  /**
   * filter all category
   */
  fetchFilterAllCat(result, lon, lat, category, radius) {
    const body = JSON.stringify({
      coordinantes: {
        lon: lon,
        lat: lat,
        category: category,
      },
      use_radius: radius === 20 ? false : true,
    });
    this.setState({isCatgegoryClicked: 0, progressView: true});
    Helper.networkHelperTokenPost(
      Pref.SearchBrachesUrl + Number(radius),
      body,
      Pref.methodPost,
      this.state.token,
      result => {
        this.setState({progressView: false});
        if (result && result.length > 0) {
          if (this.state.isCatgegoryClicked === 0) {
            let groupedExtra = Lodash.groupBy(result, function(exData) {
              return exData.category_name;
            });
            const serviceCat = Object.keys(groupedExtra).map(key => ({
              title: key,
              data: groupedExtra[key],
            }));
            this.setState({
              filterCat: i18n.t(k._4),
              filterBusiness: i18n.t(k._4),
              clone: serviceCat,
              originalData: result,
              restaurants: serviceCat,
              progressView: false,
              backSearchshow: false,
            });
          } else {
            this.setState({
              filterCat: i18n.t(k._4),
              filterBusiness: i18n.t(k._4),
              clone: result,
              restaurants: result,
              originalData: result,
              progressView: false,
              backSearchshow: false,
            });
          }
        }
      },
      error => {
        this.setState({progressView: false});
      },
    );
  }

  fetchbizsuggestions = value => {
    if (value === '') {
      this.setState({filterBusiness: value, businessSuggestions: []});
    } else {
      const body = JSON.stringify({
        input: value,
      });
      this.setState({filterBusiness: value});
      const {token} = this.state;
      if (value !== '') {
        Helper.networkHelperTokenPost(
          Pref.GetBusinessSuggestions,
          body,
          Pref.methodPost,
          token,
          result => {
            const datafound = result;
            var data = [];
            for (let index = 0; index < datafound.length; index++) {
              const element = datafound[index];
              const sp = element.split('?');
              data.push({name: sp[1]});
            }
            this.setState({businessSuggestions: data});
          },
          error => {
            //
          },
        );
      }
    }
  };

  fetchcatsuggestions = () => {
    const ttoo = this.state.catmodsss;
    this.setState({
      businessCatSuggestions: this.state.catsList,
      catmodsss: ttoo === 0 ? 1 : 0,
    });
  };

  fetchAllBusinesss(valuse, token) {
    Helper.networkHelperToken(
      Pref.AllBusinessListUrl,
      Pref.methodGet,
      this.state.token,
      result => {
        let modified = [];
        const mm = Lodash.map(result, ele => {
          const mmx = ele.business;
          modified.push(mmx);
        });
        this.setState({
          allBusiness: modified,
          cloneBusiness: modified,
        });

        if (valuse) {
          let groupedExtra = Lodash.groupBy(result, function(exData) {
            return exData.category_name;
          });
          const serviceCat = Object.keys(groupedExtra).map(key => {
            const datax = groupedExtra[key];
            return {
              title: key,
              data: datax,
            };
          });
          this.setState({
            cloneHomePageList: serviceCat,
            filterBusiness: i18n.t(k._4),
            isCatgegoryClicked: 0,
            restaurants: serviceCat,
            navFromBusiness: false,
            progressView: false,
          });
          Pref.setVal(Pref.TrackHomePageData, '');
        }
      },
      error => {
        //
      },
    );
    if (valuse) {
      const body = JSON.stringify({
        Lat: '0',
        Lon: '0',
      });
      Helper.networkHelperTokenPost(
        Pref.GetImageForHomepageUrl,
        body,
        Pref.methodPost,
        this.state.token,
        result => {
          this.setState({catImageList: result});
        },
        error => {
          //
        },
      );
    }
  }

  getOrderCounter() {
    Pref.getVal(Pref.cartItem, value => {
      if (value !== undefined && value !== null) {
        const cartData = JSON.parse(value);
        this.setState({
          cartDatas: cartData,
          counter: cartData.length,
          showOrderNo: cartData.length > 0 ? true : false,
        });
      }
    });
  }

  /**
   *
   * @param {*} idbusiness
   */
  getBusinessBasedBranch(idbusiness) {
    this.setState({progressView: true, idbusinessss: idbusiness});
    Helper.networkHelperToken(
      Pref.BusinessBranchUrl + idbusiness,
      Pref.methodGet,
      this.state.token,
      result => {
        const oopx = [];
        const business = result.business;
        const branchlist = result.branch;
        Lodash.map(branchlist, ele => {
          ele.description = business.description;
          ele.imageurl = business.imageUrl;
          ele.websiteUrl = business.websiteUrl;
          oopx.push(ele);
        });
        if (oopx !== undefined && oopx.length > 0) {
          this.setState({
            progressView: false,
            navFromBusiness: true,
            isCatgegoryClicked: 1,
            clone: oopx,
            originalData: result,
            restaurants: oopx,
            existing: true,
          });
        }
      },
      error => {
        this.setState({progressView: false});
      },
    );
  }

  renderRowBusiness(item, index) {
    return (
      <TouchableWithoutFeedback
        onPress={() => this.getBusinessBasedBranch(item.idbusiness)}>
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
            <Image
              styleName="large-square"
              source={{
                uri: `${Pref.BASEURL}${item.imageUrl.replace('%5C', '')}`,
              }}
              style={{
                width: 124,
                height: sizeHeight(20),
                borderTopRightRadius: 8,
                borderTopStartRadius: 8,
                borderBottomRightRadius: 8,
                borderBottomStartRadius: 8,
              }}
            />

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
                  {item.name}
                </Title>
                <Subtitle
                  numberOfLines={1}
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 14,
                  }}>
                  {item.description}
                </Subtitle>
                <Subtitle
                  numberOfLines={1}
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 14,
                  }}>
                  {Helper.subslongText(item.address, 18)}
                </Subtitle>
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  width: '100%',
                  alignContent: 'center',
                  marginStart: 8,
                  marginTop: 4,
                  paddingVertical: 4,
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
                  <Icon
                    name={'phone'}
                    size={20}
                    style={{
                      width: 24,
                      height: 24,
                      alignSelf: 'center',
                      justifyContent: 'center',
                    }}
                  />

                  <TouchableWithoutFeedback
                    onPress={() =>
                      Linking.openURL(`${i18n.t(k.TEL)}${item.phone}`)
                    }>
                    <Subtitle
                      style={{
                        padding: 2,
                        color: '#292929',
                        fontFamily: 'Rubik',
                        fontSize: 14,
                      }}>
                      {item.phone}
                    </Subtitle>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </TouchableWithoutFeedback>
    );
  }

  parsetime = time => {
    if (time == undefined || time == null) {
      return '';
    }
    if (time.includes('#')) {
      const g = time.split('\n');
      let data = i18n.t(k._4);
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

  renderRowCat(item, index) {
    return (
      <TouchableWithoutFeedback onPress={() => this.branchItemClicked(item)}>
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
                  {Helper.subslongText(item.name, 16)}
                </Title>
                <Subtitle
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 14,
                  }}>
                  {Helper.subslongText(item.description, 16)}
                </Subtitle>
                {item.businessHours !== undefined &&
                item.businessHours !== null &&
                item.businessHours !== '' ? (
                  <View style={{flexDirection: 'row', marginStart: 8}}>
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
                        {`${Number(item.distance).toFixed(1)}${i18n.t(k._)}`}
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

  branchItemClicked(item) {
    const f = Lodash.findIndex(
      this.state.allBusiness,
      {idbusiness: item.fkbusiness},
      0,
    );
    if (f !== -1) {
      item.websiteUrl = this.state.allBusiness[f].websiteUrl;
    }
    Pref.setVal(Pref.EditModeEnabled, '0');
    Pref.setVal(Pref.TrackHomePageData, '1');
    NavigationActions.navigate('NewBusinessPage', {item: item, mode: false});
  }

  homecatClick = item => {
    if (!this.state.locaDialog) {
      const itemsList = [];
      const filter = Lodash.map(this.state.restaurants, ele => {
        const data = Lodash.map(ele.data, ioo => {
          if (ioo.category_name === item.name) {
            itemsList.push(ioo);
          }
        });
      });
      this.setState({
        backSearchshow: false,
        businessId: '',
        isCatgegoryClicked: 1,
        restaurants: itemsList,
        navFromBusiness: false,
        filterView: false,
        existing: false,
        catClicked: true,
      });
    } else {
      this.setState({progressView: true});
      const itemsList = Lodash.filter(
        this.state.restaurants,
        ele => ele.title === item.name,
      );
      if (
        itemsList !== undefined &&
        itemsList !== null &&
        itemsList.length > 0
      ) {
        let id = 0;
        const kkk = itemsList[0].data;
        const fil = [];
        for (let index = 0; index < kkk.length; index++) {
          const element = kkk[index];
          const {business} = element;
          id = business.category;
          fil.push(business);
        }
        this.setState({
          businessId: id,
          filterView: false,
          progressView: false,
          backSearchshow: false,
          navFromBusiness: true,
          isCatgegoryClicked: 3,
          restaurants: fil,
          existing: false,
          existingagain: true,
          catClicked: true,
        });
      }
    }
  };
  renderCatItemRow(item, index) {
    if (index === 0) {
      return null;
    }
    return (
      <View
        style={{
          width: 124,
          marginEnd: 8,
          marginStart: 8,
        }}>
        <TouchableWithoutFeedback onPress={() => this.homecatClick(item)}>
          <Card
            elevation={0}
            style={{
              marginVertical: 8,
              width: 124,
              backgroundColor: 'white',
              borderRadius: 8,
            }}>
            <Card.Cover
              source={{uri: `${Pref.BASEURL}${item.imageurl}`}}
              style={{
                width: 124,
                height: 96,
                resizeMode: 'contain',
              }}
            />
          </Card>
        </TouchableWithoutFeedback>

        <Title
          style={{
            color: 'black',
            fontFamily: 'Rubik',
            fontSize: 14,
            alignSelf: 'flex-start',
            fontWeight: '400',
          }}>
          {Helper.subslongText(item.name, 16)}
        </Title>
      </View>
    );
  }

  renderHomepageItemRow(item, index) {
    return item.business === undefined ? (
      <View
        style={{
          width: 124,
          marginEnd: 12,
          marginStart: 8,
        }}>
        <TouchableWithoutFeedback onPress={() => this.branchItemClicked(item)}>
          <Card
            elevation={0}
            style={{
              marginVertical: 8,
              width: 124,
              backgroundColor: '#dedede',
              borderRadius: 8,
              // borderColor: "#dedede",
              // ...Platform.select({
              // 	android: {
              // 		elevation: 4,
              // 	},
              // 	default: {
              // 		shadowColor: "rgba(0,0,0, .2)",
              // 		shadowOffset: { height: 0, width: 0 },
              // 		shadowOpacity: 1,
              // 		shadowRadius: 1,
              // 	},
              // }),
            }}>
            <Card.Cover
              source={{uri: `${Pref.BASEURL}${item.imageurl}`}}
              style={{
                width: 124,
                height: 124,
                resizeMode: 'contain',
              }}
            />
          </Card>
        </TouchableWithoutFeedback>

        <View
          style={{
            flexDirection: 'column',
            //marginTop: 2,
            //marginHorizontal: sizeWidth(2),
          }}>
          <Title
            styleName="bold"
            style={{
              color: 'black',
              fontFamily: 'Rubik',
              fontSize: 14,
              alignSelf: 'flex-start',
              fontWeight: '700',
            }}>
            {Helper.subslongText(item.name, 16)}
          </Title>
          {/* <Subtitle
            style={{
              //color: "#dedede",
              fontFamily: "Rubik",
              alignSelf: "flex-start",
              fontSize: 13,
              fontWeight: "400",
            }}
          >
            {Helper.subslongText(item.description, 16)}
          </Subtitle> */}
          {/* <View
            style={{
              height: 1,
              backgroundColor: "#dedede",
              marginHorizontal: sizeWidth(0.5),
              marginVertical: sizeHeight(1),
            }}
          /> */}

          <View
            style={{
              flexDirection: 'row',
              alignContent: 'flex-end',
              alignItems: 'center',
              alignSelf: 'flex-start',
              justifyContent: 'flex-start',
              //marginHorizontal: sizeWidth(1.5),
            }}>
            {item.rating !== -1 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: -4,
                }}>
                <Image
                  styleName="small v-center h-center"
                  source={require(`./../res/images/star.png`)}
                  style={{
                    width: 16,
                    height: 16,
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}
                />
                {/* ${i18n.t(k.homerating)} (${item.ratingcount}) */}
                <Subtitle
                  styleName="v-center h-center"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 14,
                    alignSelf: 'center',
                    fontWeight: '700',
                    //marginTop: -4,
                    marginStart: 4,
                  }}>
                  {`${item.rating}`}
                </Subtitle>
              </View>
            ) : null}

            {/* {item.message !== null &&
              item.message !== undefined &&
              item.message !== "" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: "#292929",
                      borderRadius: 8,
                      margin: 4,
                    }}
                  />
                  <Subtitle
                    style={{
                      color: "#292929",
                      fontFamily: "Rubik",
                      fontSize: 14,
                      alignSelf: "flex-start",
                      fontWeight: "400",
                    }}
                  >
                    {Helper.subslongText(item.message, 16)}
                  </Subtitle>
                </View>
              ) : null} */}
          </View>
        </View>
      </View>
    ) : (
      <View
        style={{
          width: 124,
          marginEnd: 12,
          marginStart: 8,
        }}>
        <TouchableWithoutFeedback
          onPress={() => this.getBusinessBasedBranch(item.business.idbusiness)}>
          <Card
            elevation={0}
            style={{
              marginVertical: 8,
              width: 124,
              backgroundColor: 'white',
              borderColor: '#dedede',
              borderRadius: 8,
              // ...Platform.select({
              //   android: {
              //     elevation: 4,
              //   },
              //   default: {
              //     shadowColor: "rgba(0,0,0, .2)",
              //     shadowOffset: { height: 0, width: 0 },
              //     shadowOpacity: 1,
              //     shadowRadius: 1,
              //   },
              // }),
            }}>
            <Card.Cover
              source={{
                uri: `${Pref.BASEURL}${item.business.imageUrl.replace(
                  i18n.t(k.C),
                  '',
                )}`,
              }}
              style={{
                width: 124,
                height: 124,
                resizeMode: 'contain',
              }}
            />
          </Card>
        </TouchableWithoutFeedback>

        <View
          style={{
            flexDirection: 'column',
            //   marginTop: 2,
            //   marginHorizontal: sizeWidth(2),
          }}>
          <Title
            styleName="bold"
            style={{
              color: 'black',
              fontFamily: 'Rubik',
              fontSize: 14,
              alignSelf: 'flex-start',
              fontWeight: '700',
            }}>
            {Helper.subslongText(item.business.name, 16)}
          </Title>
          {item.description !== undefined && item.description !== '' ? (
            <Subtitle
              style={{
                //color: "#dedede",
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 13,
                fontWeight: '400',
              }}>
              {Helper.subslongText(item.description, 16)}
            </Subtitle>
          ) : null}
          {/* <View
            style={{
              height: 1,
              backgroundColor: "#dedede",
              marginHorizontal: sizeWidth(0.5),
              marginVertical: sizeHeight(1),
            }}
          /> */}

          <View
            style={{
              flexDirection: 'row',
              alignContent: 'flex-end',
              alignItems: 'center',
              alignSelf: 'flex-start',
              justifyContent: 'flex-start',
              //marginHorizontal: sizeWidth(1.5),
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              {/* <Image
                  styleName="small v-center h-center"
                  source={require(`./../res/images/smiley.png`)}
                  style={{
                    width: 24,
                    height: 24,
                    alignSelf: "center",
                    justifyContent: "center",
                  }}
                /> */}

              <Subtitle
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontSize: 14,
                  alignSelf: 'flex-start',
                  fontWeight: '400',
                }}>
                {`${Helper.subslongText(item.business.address, 16)}`}
              </Subtitle>
            </View>

            {/* {item.message !== null &&
              item.message !== undefined &&
              item.message !== "" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: "#292929",
                      borderRadius: 8,
                      margin: 4,
                    }}
                  />
                  <Subtitle
                    style={{
                      color: "#292929",
                      fontFamily: "Rubik",
                      fontSize: 14,
                      alignSelf: "flex-start",
                      fontWeight: "400",
                    }}
                  >
                    {Helper.subslongText(item.message, 16)}
                  </Subtitle>
                </View>
              ) : null} */}
          </View>
        </View>

        {/* 
          <View
            style={{
              flexDirection: "column",
              marginTop: 4,
              marginHorizontal: sizeWidth(2),
            }}
          >
            <View
              style={{
                flexDirection: "column",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  alignContent: "flex-start",
                  alignItems: "flex-start",
                  marginStart: 8,
                  marginTop: 4,
                }}
              >
                <Title
                  styleName="bold"
                  style={{
                    color: "#292929",
                    fontFamily: "Rubik",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {item.business.name}
                </Title>
                <Subtitle
                  style={{
                    color: "#292929",
                    fontFamily: "Rubik",
                    fontSize: 14,
                  }}
                >
                  {item.business.description}
                </Subtitle>
                {/* <Subtitle
                  style={{
                    color: "#292929",
                    fontFamily: "Rubik",
                    fontSize: 14,
                  }}
                >
                  {Helper.subslongText(item.business.address, 18)}
                </Subtitle> 
              </View>
              
              {/* <View
                style={{
                  flexDirection: "column",
                  width: "100%",
                  alignContent: "center",
                  marginStart: 8,
                  paddingVertical: 4,
                }}
              >
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#dedede",
                    width: "80%",
                    marginHorizontal: sizeWidth(0.5),
                    marginVertical: sizeHeight(1),
                  }}
                />

                <View style={{ flexDirection: "row" }}>
                  <Icon
                    name={i18n.t(k.PHONE)}
                    size={20}
                    style={{
                      width: 24,
                      height: 24,
                      alignSelf: "center",
                      justifyContent: "center",
                    }}
                  />

                  <Subtitle
                    style={{
                      padding: 2,
                      color: "#292929",
                      fontFamily: "Rubik",
                      fontSize: 14,
                    }}
                  >
                    {item.business.phone}
                  </Subtitle>
                </View>
              </View>
             
            </View>
          </View>
       */}
      </View>
    );
  }

  itemClick(categoryname, data, mode) {
    if (!this.state.locaDialog) {
      this.setState({
        backSearchshow: false,
        businessId: '',
        isCatgegoryClicked: 1,
        restaurants: data,
        navFromBusiness: false,
        filterView: false,
        categoryname: categoryname,
        existing: false,
      });
    } else {
      this.setState({progressView: true});
      const itemsList = [];
      let id = 0;
      const filter = Lodash.map(data, ele => {
        const {business} = ele;
        id = business.category;
        itemsList.push(business);
      });
      //console.log('categoryname', itemsList);
      if (
        itemsList !== undefined &&
        itemsList !== null &&
        itemsList.length > 0
      ) {
        this.setState({
          businessId: id,
          filterView: false,
          progressView: false,
          backSearchshow: false,
          navFromBusiness: true,
          isCatgegoryClicked: 3,
          restaurants: itemsList,
          existing: false,
          existingagain: true,
        });
      }
    }
  }

  onFilterClick = () => {
    if (this.state.filterBusiness == '') {
      const ogData = this.state.originalData;
      let sortedData = [];
      if (this.state.filterCat !== '') {
        const llll = this.state.filterCat;
        let inxe = -1;
        const ppp = Lodash.find(this.state.catsList, (ele, index) => {
          if (ele.name === llll) {
            inxe = index;
            return ele;
          }
        });
        if (inxe !== -1) {
          this.fetchFilterAllCat(
            this.state.token,
            this.state.currentLon,
            this.state.currentLat,
            inxe,
            20,
          );
        }
      } else if (this.state.filterDelivery === true) {
        sortedData = Lodash.map(ogData, io => {
          const filterData = Lodash.orderBy(io.data, ['hasDelivery'], ['desc']);
          io.data = filterData;
          return io;
        });
      } else if (this.state.filterRating === 2) {
        sortedData = Lodash.map(ogData, io => {
          const filterData = Lodash.orderBy(io.data, ['rating'], ['desc']);
          io.data = filterData;
          return io;
        });
        //sortedData = Lodash.orderBy(ogData, ["rating"], ["desc"]);
      } else if (this.state.filterRating === 1) {
        sortedData = Lodash.map(ogData, io => {
          const filterData = Lodash.orderBy(io.data, ['rating'], ['asc']);
          io.data = filterData;
          return io;
        });
        //sortedData = Lodash.orderBy(ogData, ["rating"], ["asc"]);
      } else if (
        this.state.filterDelivery === true &&
        this.state.filterRating === 2
      ) {
        sortedData = Lodash.map(ogData, io => {
          const filterData = Lodash.orderBy(
            io.data,
            ['hasDelivery', 'rating'],
            ['desc', 'desc'],
          );
          io.data = filterData;
          return io;
        });
        // sortedData = Lodash.orderBy(
        // 	ogData,
        // 	["hasDelivery", "rating"],
        // 	["desc", "desc"]
        // );
      } else if (
        this.state.filterDelivery === true &&
        this.state.filterRating === 1
      ) {
        sortedData = Lodash.map(ogData, io => {
          const filterData = Lodash.orderBy(
            io.data,
            ['hasDelivery', 'rating'],
            ['desc', 'asc'],
          );
          io.data = filterData;
          return io;
        });
        // sortedData = Lodash.orderBy(
        // 	ogData,
        // 	["hasDelivery", "rating"],
        // 	["desc", "asc"]
        // );
      } else if (this.state.filterDistance === true) {
        this.fetchFilterAllCat(
          this.state.token,
          this.state.currentLon,
          this.state.currentLat,
          0,
          Number(this.state.filterKM).toFixed(0),
        );
      } else {
        sortedData = ogData;
      }
      if (!this.state.locaDialog) {
        let groupedExtra = Lodash.groupBy(sortedData, function(exData) {
          return exData.category_name;
        });
        const serviceCat = Object.keys(groupedExtra).map(key => ({
          title: key,
          data: groupedExtra[key],
        }));

        this.setState({
          isCatgegoryClicked: 0,
          restaurants: serviceCat,
          backSearchshow: false,
        });
      } else {
        this.setState({
          backSearchshow: false,
        });

        this.fetchallbusinessss();
      }
    } else {
      this.filterBusiness();
    }
  };

  filterBusiness() {
    const tyy = this.state.filterBusiness;
    const ogData = this.state.cloneBusiness;
    let sortedData = ogData.filter(element => {
      return element.name.toLowerCase().includes(tyy.toLowerCase());
    });
    this.setState({
      backSearchshow: false,
      businessId: tyy,
      isCatgegoryClicked: 3,
      restaurants: sortedData,
      navFromBusiness: false,
    });
  }

  revertfilterBusiness() {
    const tyy = this.state.businessId;
    const ogData = this.state.cloneBusiness;
    let sortedData = ogData.filter(element => {
      return element.category === tyy;
    });
    this.setState({
      backSearchshow: false,
      businessId: tyy,
      isCatgegoryClicked: 3,
      restaurants: sortedData,
      navFromBusiness: false,
    });
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRowBizSug(rowData, index, mode) {
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
        <TouchableWithoutFeedback
          style={{
            backgroundColor: 'transparent',
          }}
          onPress={() => {
            if (mode === 1) {
              this.setState({
                filterBusiness: rowData.name,
                businessSuggestions: [],
              });
            } else {
              this.setState({
                filterCat: rowData.name,
                businessCatSuggestions: [],
                catmodsss: 1,
              });
            }
          }}>
          <Title
            styleName="v-start h-start "
            style={{
              color: '#292929',
              fontFamily: 'Rubik',
              fontSize: 15,
              fontWeight: '400',
            }}>
            {`${rowData.name}`}
          </Title>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  /**
   * search category
   * @param {Search} text
   */
  filterSearch(text) {
    if (text === '') {
      this.setState({restaurants: this.state.clone});
    } else {
      const newData = this.state.clone.filter(item => {
        const itemData = item.name.toLowerCase();
        const textData = text.toLowerCase();
        return itemData.includes(textData);
      });
      this.setState({
        restaurants: newData.length > 0 ? newData : this.state.clone,
      });
    }
  }

  onValueChange(value) {
    clearTimeout(this.sliderTimeoutId);
    this.sliderTimeoutId = setTimeout(() => {
      this.setState(
        () => {
          return {filterKM: value};
        },
        () => {
          clearTimeout(this.sliderTimeoutId);
        },
      );
    }, 50);
  }

  render() {
    const {catImageList} = this.state;
    const {categories, bigImage} = catImageList;
    return (
      <Screen
        style={{
          backgroundColor: 'white',
        }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationBar
          styleName="inline no-border"
          rightComponent={
            !this.state.backSearchshow ? (
              <View style={{flexDirection: 'row', marginEnd: sizeWidth(1)}}>
                {/* {this.state.showOrderNo ? 
               <TouchableWithoutFeedback onPress={() => NavigationActions.navigate('FinalOrder', { orderData: this.state.cartDatas, })}>
                <View style={{
                  width: 36,
                  height: 36,
                  marginEnd: sizeWidth(2),
                  alignContent: 'center',
                  justifyContent: 'center',
                  marginBottom:6,
                  ...Platform.select({
                    android: {
                      elevation: 2,
                    },
                    default: {
                      shadowColor: 'rgba(0,0,0, .2)',
                      shadowOffset: { height: 0, width: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 1,
                    },
                  }),
                }}>
                  <Image
                   // styleName="large"
                    source={require("./../res/images/cart.png")}
                    style={{ width: 36, height: 36, alignSelf: 'center', alignContent: 'center',}} />
                </View>
               </TouchableWithoutFeedback> : null} */}

                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      isCatgegoryClicked: 2,
                      filterView: true,
                      backSearchshow: true,
                    })
                  }>
                  <Image
                    source={require(`./../res/images/search.png`)}
                    style={{
                      width: 24,
                      height: 24,
                      marginEnd: 16,
                      marginStart: 8,
                      marginTop: 8,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  />
                </TouchableOpacity>
                {/* <Image source={require('./../res/images/menu.png')}
                style={{ width: 24, height: 24, alignSelf: 'center', justifyContent: 'center' }}
               /> */}
              </View>
            ) : (
              <View style={{flexDirection: 'row', marginEnd: sizeWidth(1)}}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    this.setState({
                      filterView: false,
                      backSearchshow: false,
                      businessSuggestions: [],
                      businessCatSuggestions: [],
                      catmodsss: 0,
                      isCatgegoryClicked: 0,
                      filterView: false,
                      filterOpenNow: false,
                      filterDelivery: false,
                      filterKusher: false,
                      filterRating: 0,
                      filterKM: 1,
                      filterDistance: false,
                    });
                  }}>
                  <Icon
                    name="close"
                    size={36}
                    color="#292929"
                    style={{
                      padding: 4,
                      backgroundColor: 'transparent',
                      alignSelf: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </TouchableWithoutFeedback>
              </View>
            )
          }
          style={{
            rightComponent: {
              flex: !this.state.backSearchshow ? 0.3 : 0.4,
            },

            leftComponent: {
              flex: !this.state.backSearchshow ? 0.6 : 0.5,
            },

            centerComponent: {
              flex: !this.state.backSearchshow ? 0.1 : 0.1,
            },

            componentsContainer: {
              flex: 1,
            },
          }}
          leftComponent={
            <View style={{marginStart: 12}}>
              {!this.state.backSearchshow ? (
                this.state.filterView ? (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      this.backClick();
                    }}>
                    <Icon
                      name="arrow-forward"
                      size={36}
                      color="#292929"
                      style={{
                        padding: 4,
                        backgroundColor: 'transparent',
                        alignSelf: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  </TouchableWithoutFeedback>
                ) : (
                  <Image
                    styleName="small"
                    style={{
                      width: sizeWidth(30),
                      height: 40,
                      marginStart: -12,
                    }}
                    source={require(`./../res/images/callitlogo.png`)}
                  />
                )
              ) : (
                <Heading
                  style={{
                    fontSize: 20,
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                    alignSelf: 'center',
                  }}>
                  {i18n.t(k._32)}
                </Heading>
              )}
            </View>
          }
        />

        {this.state.isCatgegoryClicked == 0 ||
        this.state.isCatgegoryClicked == 1 ||
        this.state.isCatgegoryClicked == 3 ? (
          <View style={{flexDirection: 'column', flex: 1}}>
            <DummyLoader
              visibilty={this.state.progressView}
              showText={this.state.isCatgegoryClicked == 0}
              center={
                this.state.restaurants !== null &&
                this.state.restaurants.length > 0 ? (
                  this.state.isCatgegoryClicked == 0 ? (
                    <ScrollView
                      persistentScrollbar
                      showsVerticalScrollIndicator
                      showsHorizontalScrollIndicator={false}>
                      <SectionList
                        extraData={this.state}
                        persistentScrollbar
                        showsVerticalScrollIndicator={true}
                        showsHorizontalScrollIndicator={false}
                        sections={this.state.restaurants}
                        //style={{ marginStart: sizeWidth(3) }}
                        keyExtractor={(item, index) => item.name}
                        ListHeaderComponent={() =>
                          !this.state.filterView ? (
                            <View>
                              <View
                                style={{
                                  width: '100%',
                                  height: 164,
                                }}>
                                <Image
                                  styleName="fill-parent"
                                  source={{
                                    uri: `${Pref.BASEURL}${bigImage}`,
                                  }}
                                  // style={{
                                  // 	resizeMode:'contain'
                                  // }}
                                />

                                {/* <View
                                style={{
                                  position: "absolute",
                                  width: "100%",
                                  backgroundColor: "rgba(0,0,0,0.4)",
                                  height: "100%",
                                  flex: 1,
                                }}
                              >
                                <View style={{ flex: 0.6 }}></View>
                                <View
                                  style={{
                                    marginHorizontal: 12,
                                    flex: 0.3,
                                    alignContent:'flex-start',
                                    alignItems:'flex-start'
                                  }}
                                >
                                  <Title
                                    styleName="v-start h-start"
                                    style={{
                                      color: "white",
                                      fontFamily: "Rubik",
                                      fontSize: 16,
                                      fontWeight: "700",
                                    }}
                                  >
                                    {`Name`}
                                  </Title>
                                  <Subtitle
                                    styleName="v-start h-start"
                                    style={{
                                      color: "#ebeceb",
                                      fontFamily: "Rubik",
                                      fontSize: 15,
                                    }}
                                  >
                                    {`Description`}
                                  </Subtitle>
                                </View>
                                <View style={{ flex: 0.1 }}></View>
                              </View>
                             */}
                              </View>

                              {categories !== undefined &&
                              categories !== null &&
                              categories.length > 0 ? (
                                <View style={{marginTop: 8}}>
                                  <View
                                    styleName="horizontal space-between"
                                    style={{
                                      marginStart: sizeWidth(4.5),
                                      marginVertical: sizeHeight(1),
                                      flexDirection: 'row',
                                      flex: 1,
                                      justifyContent: 'space-between',
                                    }}>
                                    <Title
                                      styleName="v-center h-center"
                                      style={{
                                        color: 'black',
                                        fontFamily: 'Rubik',
                                        fontSize: 16,
                                        fontWeight: '700',
                                      }}>
                                      {`${i18n.t(k.catTitle)}`}
                                    </Title>
                                  </View>
                                  <FlatList
                                    //extraData={this.state}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    data={categories}
                                    style={{
                                      alignContent: 'flex-start',
                                      alignSelf: 'flex-start',
                                      flexShrink: 1,
                                      marginStart: sizeWidth(2.5),
                                      marginBottom: 8,
                                    }}
                                    horizontal
                                    // inverted={true}
                                    keyExtractor={(item, index) => `${index}`}
                                    renderItem={({item, index}) =>
                                      this.renderCatItemRow(item, index)
                                    }
                                  />
                                </View>
                              ) : null}
                            </View>
                          ) : null
                        }
                        renderSectionHeader={({section, index}) => (
                          <View
                            styleName="horizontal space-between"
                            style={{
                              marginStart: sizeWidth(4.5),
                              marginVertical: sizeHeight(1),
                              flexDirection: 'row',
                              flex: 1,
                              justifyContent: 'space-between',
                            }}>
                            <Title
                              styleName="v-center h-center"
                              style={{
                                color: 'black',
                                fontFamily: 'Rubik',
                                fontSize: 16,
                                fontWeight: '700',
                              }}>
                              {`${section.title}`}
                            </Title>
                            <TouchableWithoutFeedback
                              style={{
                                backgroundColor: 'transparent',
                              }}
                              onPress={() =>
                                this.itemClick(section.title, section.data, 1)
                              }>
                              <Title
                                styleName="v-center h-center"
                                style={{
                                  color: '#3DACCF',
                                  fontFamily: 'Rubik',
                                  fontSize: 16,
                                  fontWeight: '700',
                                  marginEnd: 16,
                                }}>
                                {`${i18n.t(k.more)}`}
                              </Title>
                            </TouchableWithoutFeedback>
                          </View>
                        )}
                        // ItemSeparatorComponent={() => <View style={{
                        //   height: 1, width: '90%', backgroundColor: '#dedede', marginStart: sizeWidth(1.5),
                        //   marginVertical: sizeHeight(1.5), }} />}
                        renderItem={({item, index, section}) =>
                          index == 0 ? (
                            <View>
                              <FlatList
                                extraData={this.state}
                                horizontal
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                data={section.data}
                                style={{
                                  alignContent: 'flex-start',
                                  alignSelf: 'flex-start',
                                  flexShrink: 1,
                                  marginStart: sizeWidth(2.5),
                                }}
                                // inverted={true}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item: item, index}) =>
                                  this.renderHomepageItemRow(item, index)
                                }
                              />
                              {index < this.state.restaurants.length - 1 ? (
                                <View
                                  style={{
                                    height: 0.8,
                                    width: '90%',
                                    backgroundColor: '#dedede',
                                    marginStart: sizeWidth(4.5),
                                    marginVertical: sizeHeight(1.5),
                                  }}
                                />
                              ) : null}
                            </View>
                          ) : null
                        }
                      />
                    </ScrollView>
                  ) : this.state.isCatgegoryClicked == 3 ? (
                    <FlatList
                      //extraData={this.state}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      data={this.state.restaurants}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item: item, index}) =>
                        this.renderRowBusiness(item, index)
                      }
                    />
                  ) : (
                    <FlatList
                      //extraData={this.state}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      data={this.state.restaurants}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item: item, index}) =>
                        //this.state.isCatgegoryClicked == 0 ? this.renderRow(item, index) :
                        this.renderRowCat(item, index)
                      }
                    />
                  )
                ) : (
                  <Subtitle
                    styleName="md-gutter v-center h-center"
                    style={{alignSelf: 'center', justifyContent: 'center'}}>
                    {`${i18n.t(k._33)}`}
                    <TouchableWithoutFeedback
                      onPress={() => {
                        Linking.openURL(i18n.t(k.HTTP_M_ME_APPCALLIT));
                      }}>
                      <Subtitle style={{color: Colors.blue500}}>
                        {`${i18n.t(k.HTTP_M_ME_APPCALLIT)}`}
                        <Subtitle>{` ${i18n.t(k._34)}`}</Subtitle>
                      </Subtitle>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        Linking.openURL(
                          `${i18n.t(k.HTTPS_WWW_INSTAGRAM_COM_CALL)}`,
                        );
                      }}>
                      <Subtitle>
                        {`${i18n.t(k.N)} `}
                        <Subtitle style={{color: Colors.blue500}}>{`${i18n.t(
                          k.HTTPS_WWW_INSTAGRAM_COM_CALL,
                        )}`}</Subtitle>
                      </Subtitle>
                    </TouchableWithoutFeedback>
                  </Subtitle>
                )
              }
            />
          </View>
        ) : null}
        {this.state.isCatgegoryClicked == 2 && this.state.filterView ? (
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={'handled'}>
            <View style={{flexDirection: 'column', height: sizeHeight(86)}}>
              <TextInput
                mode="flat"
                label={i18n.t(k._35)}
                underlineColor="transparent"
                underlineColorAndroid="transparent"
                style={[styles.inputStyle, {marginTop: sizeHeight(2)}]}
                placeholderTextColor={i18n.t(k.DEDEDE)}
                onChangeText={value => this.fetchbizsuggestions(value)}
                value={this.state.filterBusiness}
              />

              {this.state.businessSuggestions.length > 0 ? (
                <View
                  style={{
                    flexGrow: 1,
                    //flexWrap: 'wrap',
                    //marginVertical: sizeHeight(2),
                    marginHorizontal: sizeWidth(6),
                    marginTop: -2,
                  }}>
                  <Card elevation={2}>
                    <FlatList
                      //extraData={this.state}
                      showsVerticalScrollIndicator={true}
                      showsHorizontalScrollIndicator={false}
                      data={this.state.businessSuggestions}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps={'handled'}
                      ItemSeparatorComponent={() => (
                        <View style={styles.listservicedivider} />
                      )}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item: item, index}) =>
                        this.renderRowBizSug(item, index, 1)
                      }
                    />
                  </Card>
                </View>
              ) : null}

              <TouchableWithoutFeedback
                onPress={() => this.fetchcatsuggestions()}>
                <View
                  style={[
                    styles.inputStyle,
                    {
                      marginTop: 16,
                      justifyContent: 'space-between',
                      flexDirection: 'row-reverse',
                    },
                  ]}>
                  <View
                    style={{
                      flex: 0.2,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Icon
                      name={i18n.t(k.KEYBOARD_ARROW_DOWN)}
                      size={24}
                      color={'#777777'}
                      style={{
                        width: 24,
                        height: 24,
                        alignSelf: 'center',
                        marginHorizontal: sizeWidth(2),
                      }}
                    />
                  </View>
                  <Subtitle
                    style={{
                      color:
                        this.state.filterCat === '' ? '#777777' : '#292929',
                      fontSize: 16,
                      alignSelf: 'center',
                      marginHorizontal: sizeWidth(2),
                    }}>
                    {this.state.filterCat === ''
                      ? i18n.t(k._36)
                      : this.state.filterCat}
                  </Subtitle>
                </View>
              </TouchableWithoutFeedback>
              {this.state.businessCatSuggestions.length > 0 &&
              this.state.catmodsss === 0 ? (
                <View
                  style={{
                    flexGrow: 1,
                    //flexWrap: 'wrap',
                    //marginVertical: sizeHeight(2),
                    marginHorizontal: sizeWidth(6),
                    marginTop: -2,
                  }}>
                  <Card elevation={2}>
                    <FlatList
                      //extraData={this.state}
                      showsVerticalScrollIndicator={true}
                      showsHorizontalScrollIndicator={false}
                      data={this.state.businessCatSuggestions}
                      nestedScrollEnabled={true}
                      keyExtractor={(item, index) => index.toString()}
                      ItemSeparatorComponent={() => (
                        <View style={styles.listservicedivider} />
                      )}
                      renderItem={({item: item, index}) =>
                        this.renderRowBizSug(item, index, 2)
                      }
                    />
                  </Card>
                </View>
              ) : null}

              <Subtitle
                style={{
                  color: '#777777',
                  fontSize: 16,
                  marginTop: sizeHeight(1.5),
                  alignSelf: 'flex-start',
                  marginStart: sizeWidth(6),
                }}>
                {i18n.t(k._37)}
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
                      {i18n.t(k._38)}
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
                      {i18n.t(k._39)}
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
                  marginStart: sizeWidth(6),
                }}>
                {`${i18n.t(k._40)}`}{' '}
              </Subtitle>
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: sizeWidth(6),
                  paddingVertical: sizeHeight(0.5),
                }}>
                <Subtitle
                  style={{
                    flex: 0.2,
                    color: '#777777',
                    fontSize: 16,
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}>
                  {`${this.state.filterKM.toFixed(0)} ${i18n.t(k._)}`}{' '}
                </Subtitle>
                <Slider
                  style={{flex: 0.8, alignSelf: 'center'}}
                  minimumValue={1}
                  maximumValue={20}
                  value={this.state.filterKM}
                  minimumTrackTintColor={i18n.t(k.EBBD)}
                  maximumTrackTintColor="#777777"
                  thumbTintColor={i18n.t(k.EBBD)}
                  onValueChange={this.onValueChange.bind(this)}
                  onSlidingComplete={e => {
                    this.setState(() => {
                      return {filterKM: e, filterDistance: true};
                    });
                  }}
                />
              </View>
              <View
                style={{
                  width: '100%',
                  backgroundColor: '#d9d9d9',
                  marginTop: sizeHeight(2),
                  height: 1,
                }}
              />

              <View
                style={{
                  marginHorizontal: sizeWidth(6),
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
                    }}>{`${i18n.t(k._41)}`}</Subtitle>
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
                      {i18n.t(k._42)}
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
                      {i18n.t(k._43)}
                    </Subtitle>
                  </View>
                </View>
                <View style={{flexDirection: 'column'}}>
                  <Subtitle
                    style={{
                      color: '#777777',
                      fontSize: 16,
                      alignSelf: 'flex-start',
                    }}>{`${i18n.t(k._44)}`}</Subtitle>
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
                      {i18n.t(k._42)}
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
                      {i18n.t(k._43)}
                    </Subtitle>
                  </View>
                </View>
              </View>
              <View
                style={{
                  marginHorizontal: sizeWidth(6),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View style={{flexDirection: 'column', top: sizeHeight(3.5)}}>
                  <Subtitle
                    style={{
                      color: '#777777',
                      fontSize: 16,
                      alignSelf: 'flex-start',
                    }}>{`${i18n.t(k._45)}`}</Subtitle>
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
                      {i18n.t(k._42)}
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
                      {i18n.t(k._43)}
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
                style={[styles.buttonStyle, {marginTop: sizeHeight(7.5)}]}
                onPress={this.onFilterClick}>
                <Subtitle
                  style={{
                    color: 'white',
                  }}>
                  {i18n.t(k._46)}
                </Subtitle>
              </Button>
            </View>
          </ScrollView>
        ) : null}

        {this.state.showOrderNo && !this.state.filterView ? (
          <View
            style={{
              height: 48,
              width: 48,
              borderRadius: 120,
              position: 'absolute',
              bottom: 16,
              right: 16,
              backgroundColor: 'transparent',
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
                  backgroundColor: 'transparent',
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
                  height: '100%',
                  backgroundColor: 'white',
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
    );
  }
}

export default HomePage;

const styles = StyleSheet.create({
  triangleCorner: {
    position: i18n.t(k.ABSOLUTE),
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
    marginHorizontal: sizeWidth(6),
  },

  buttonStyle: {
    color: i18n.t(k.WHITE),
    bottom: 0,
    paddingVertical: 6,
    width: i18n.t(k._5),
    backgroundColor: i18n.t(k.DACCF),
    textAlign: 'center',
  },
  listservicedivider: {
    height: 1,
    backgroundColor: '#dedede',
    marginHorizontal: sizeWidth(6),
  },
});
