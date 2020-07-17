import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  Linking,
  FlatList,
  StatusBar,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  BackHandler,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Divider,
  Heading,
  Image,
  NavigationBar,
  Screen,
  Subtitle,
  TextInput,
  TouchableOpacity,
  View,
  Row,
  Title,
  ImageBackground,
} from '@shoutem/ui';
import {
  Button,
  Card,
  Chip,
  Colors,
  Surface,
  List,
  Checkbox,
  Portal,
  Modal,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import DummyLoader from '../util/DummyLoader';
import NavigationActions from '../util/NavigationActions';
import * as Helper from '../util/Helper';
import * as Pref from '../util/Pref';
import GetLocation from 'react-native-get-location';
import * as Lodash from 'lodash';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import {Loader} from './Loader';
import Moment from 'moment';
import {AlertDialog} from './../util/AlertDialog';
import MaskedInput from 'react-native-masked-input-text';
import xml2js from 'xml2js';
import {SafeAreaView} from 'react-navigation';
import Geolocation from '@react-native-community/geolocation';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

let branchData = null;
var now = new Date().getDay();
var currentDate = new Date();
const circleButtonFreeWidth = 32;
const circleButtonFreeRadius = 32 / 2;
let terminalNumbers = '';
var tempCguid = '';

export default class FinalOrder extends React.Component {
  constructor(props) {
    super(props);
    this.cardnumberRef = React.createRef();
    this.cardcvvRef = React.createRef();
    this.cardyearRef = React.createRef();
    this.pressPayment = this.pressPayment.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.extraRow = this.extraRow.bind(this);
    this.backClick = this.backClick.bind(this);
    this.editmode = this.editmode.bind(this);
    this.locationOpen = this.locationOpen.bind(this);
    this.renderRowSuggestion = this.renderRowSuggestion.bind(this);
    this.filtercities = this.filtercities.bind(this);
    this.renderRowCardsList = this.renderRowCardsList.bind(this);
    this.renderRowFreeServiceList = this.renderRowFreeServiceList.bind(this);
    this.saveCardsData = this.saveCardsData.bind(this);
    this.saveFreeData = this.saveFreeData.bind(this);
    this.freeserviceSelect = this.freeserviceSelect.bind(this);
    this.state = {
      insertGuid: false,
      isDeliveryMode: false,
      smp: false,
      id: 0,
      progressView: true,
      searchVisibility: false,
      address: i18n.t(k._4),
      payment: false,
      isCod: false,
      extraMessage: '',
      alternateNumber: '',
      deliveryPrice: 0,
      fullAddressInput: i18n.t(k._4),
      fullcitiesInput: i18n.t(k._4),
      currentLog: 0,
      currentLat: 0,
      allOrder: [],
      data: [],
      selectedMode: false,
      savedAdd: i18n.t(k._4),
      paymentMode: false,
      token: '',
      cdata: null,
      addresss: '',
      totalAmt: 0,
      fadeAnim: new Animated.Value(1),
      indexToAnimate: -1,
      gpsChecked: false,
      showAlert: false,
      alertContent: i18n.t(k._4),
      isrealDelivery: true,
      deliveryprices: 0,
      odeliveryprices: 0,
      deliveryCitiesList: [],
      cloneCitiesList: [],
      cloneData: [],
      noLocationEnabled: false,
      alertTitle: i18n.t(k._29),
      flexChanged: false,
      shownDialogdprice: 0,
      businessHours: '',
      hasDelivery: -1,
      cardList: [],
      showcardAdd: false,
      cardNumber: '',
      cardcvv: '',
      cardyear: '',
      cardTempNumber: '',
      cardTempcvv: '',
      cardTempyear: '',
      cardTempID: '',
      cardSave: true,
      cardSessionID: '',
      freeS: [],
      freeServiceList: [],
      ogFreeServiceList: [],
      showFreeServiceModal: false,
      showorderButton: false,
      freeDeliveryAmount: 0,
      freeServiceDialogCounter: 0,
      freeItemS: [],
      freemodalTitle: '',
      freemodalTitleCount: '',
      maxQuantity: 0,
      maxTitle: '',
      creditCardImage: `${Pref.VisaCardImage}card.png`,
      paymentDoneAlready: false,
    };
    if (Platform.OS === 'ios') {
      Geolocation.setRNConfiguration({
        authorizationLevel: 'whenInUse',
        skipPermissionRequests: false,
      });
    }
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    }
    BackHandler.addEventListener('hardwareBackPress', this.backClick);
    this.willfocusListener = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({progressView: true});
      },
    );
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      Pref.setVal(Pref.HomeReload, null);
      this.work();
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

  backClick = () => {
    //////console.log('back', 'FinalOrder');
    NavigationActions.goBack();
    return true;
  };

  work() {
    this.getAllData();
    if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(res => {
        switch (res) {
          case RESULTS.UNAVAILABLE:
            this.setState({noLocationEnabled: true});
            break;
          case RESULTS.DENIED:
            this.setState({noLocationEnabled: true});
            break;
          case RESULTS.GRANTED:
            this.getLoc();
            break;
          case RESULTS.BLOCKED:
            this.setState({noLocationEnabled: true});
            break;
        }
        // if (res == 'granted') {
        //   this.getLoc();
        // } else {
        // this.setState({noLocationEnabled: true});
        // }
      });
    } else {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 1000,
        fastInterval: 500,
      })
        .then(data => {
          this.getLoc();
        })
        .catch(err => {
          //error
          this.setState({noLocationEnabled: true});
        });
    }
    //Pref.setVal(Pref.cardList, []);
    Pref.getVal(Pref.cardList, value => {
      const val = JSON.parse(value);
      //console.log(`val`, val)
      if (
        val === '' ||
        val === null ||
        (val === undefined && val.length === 0)
      ) {
      } else {
        this.setState({cardList: val});
      }
    });
  }

  getLoc() {
    const option =
      Platform.OS === 'ios'
        ? {
            enableHighAccuracy: true,
            timeout: 15000,
          }
        : {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 10000,
          };
    GetLocation.getCurrentPosition(option)
      .then(location => {
        const lat = location.latitude;
        const lon = location.longitude;
        this.setState({
          currentLog: lon,
          currentLat: lat,
        });

        Pref.getVal(Pref.bearerToken, value => {
          const token = Helper.removeQuotes(value);
          if (branchData != null) {
            const idbranch = branchData.idbranch;

            const data = JSON.stringify({
              lon: Number(lon),
              lat: Number(lat),
              // "lon": 35.439152,
              // "lat": 32.721458
            });
            //console.log('branchData', branchData.idbranch, data);
            Helper.networkHelperTokenPost(
              Pref.GetDeliveryPriceUrl + idbranch,
              data,
              Pref.methodPost,
              token,
              result => {
                //console.log('resultx', result);
                if (result != "this branch doesn't deliver to your place") {
                  const dprice = Number(result);
                  let totalAmt = this.state.totalAmt;
                  //totalAmt += Number(dprice);
                  //console.log('totalAmt', totalAmt);
                  const cal =
                    Number(totalAmt) > Number(this.state.freeDeliveryAmount)
                      ? 0
                      : dprice;
                  this.setState({
                    isrealDelivery: true,
                    isDeliveryMode: false,
                    totalAmt: totalAmt,
                    //deliveryprices:dprice,
                    deliveryprices: cal,
                    odeliveryprices: dprice,
                  });
                } else {
                  this.setState({
                    isrealDelivery: false,
                    isDeliveryMode: false,
                  });
                }
              },
              error => {
                //////console.log(error);
              },
            );

            Helper.networkHelperToken(
              Pref.GetDeliveryPricesUrl + idbranch,
              Pref.methodGet,
              token,
              result => {
                this.setState({
                  cloneCitiesList: result,
                });
                //console.log("result", result);
              },
              error => {
                //////console.log(error);
              },
            );
          }
        });
      })
      .catch(error => {
        //console.log(error);
        this.setState({noLocationEnabled: true});
      });
  }

  filtercities = value => {
    //filtercities
    //de
    //console.log("noLocationEnabled", this.state.noLocationEnabled);
    this.setState({
      fullcitiesInput: value,
      deliveryCitiesList: [],
    });
    if (value !== '') {
      if (!this.state.noLocationEnabled) {
        const okk = this.state.cloneCitiesList;
        if (okk.length > 0) {
          const filters = Lodash.filter(okk, (ele, index) => {
            return ele.cityName.includes(value);
          });
          //console.log("log", filters);
          this.setState({
            deliveryCitiesList: filters,
          });
        }
      } else {
        Helper.networkHelperTokenPost(
          Pref.GetDeliveryListItemAutoCompleteSearchUrl,
          JSON.stringify({
            input: value,
          }),

          Pref.methodPost,
          this.state.token,
          result => {
            //console.log(result);
            this.setState({
              deliveryCitiesList: result,
            });
          },
          error => {},
        );
      }
      //בת שלמה
    }
  };

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRowSuggestion(rowData, index) {
    return (
      <Row
        style={{
          flexDirection: 'column',
          marginHorizontal: -8,
          marginVertical: -6,
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (!this.state.noLocationEnabled) {
              const pp = rowData.delivery.price;
              const ok = this.state.deliveryprices;
              let tool = this.state.totalAmt - ok;
              tool += pp;

              const cal =
                Number(this.state.totalAmt) >
                Number(this.state.freeDeliveryAmount)
                  ? 0
                  : pp;

              const addcal =
                Number(this.state.totalAmt) >
                Number(this.state.freeDeliveryAmount)
                  ? this.state.totalAmt
                  : tool;

              this.setState({
                //deliveryprices: pp,
                //totalAmt: tool,
                deliveryprices: cal,
                totalAmt: addcal,
                deliveryCitiesList: [],
                fullcitiesInput: rowData.cityName,
                odeliveryprices: pp,
              });
            } else {
              this.setState({
                deliveryCitiesList: [],
                fullcitiesInput: rowData.name,
              });
            }
          }}>
          <View styleName="horizontal space-between" style={{width: '100%'}}>
            <Subtitle
              numberOfLines={1}
              style={{
                color: '#292929',
                fontSize: 16,
              }}>
              {this.state.noLocationEnabled ? rowData.name : rowData.cityName}
            </Subtitle>
            {!this.state.noLocationEnabled ? (
              <Subtitle
                numberOfLines={1}
                style={{
                  color: '#B72727',
                  fontSize: 14,
                  fontWeight: '700',
                }}>{`${i18n.t(k._6)}${rowData.delivery.price}`}</Subtitle>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </Row>
    );
  }

  getAllData() {
    //this.setState({progressView:true});
    Pref.getVal(Pref.CustData, rel => {
      const vo = JSON.parse(rel);
      const {address} = vo;
      let addx = '';
      if (address.includes('@')) {
        const spx = address.split('@');
        addx = spx[0];
      } else {
        addx = address;
      }
      this.setState({cdata: vo, address: addx});
    });
    Pref.getVal(Pref.bearerToken, value => {
      const token = Helper.removeQuotes(value);
      Helper.networkHelperToken(
        Pref.GetSessionCardUrl,
        Pref.methodGet,
        token,
        op => {
          //console.log(`sessionid`, op);
          this.setState({
            cardSessionID: op,
          });
        },
        error => {
          console.log(error);
        },
      );

      Helper.networkHelperToken(
        Pref.ServerTimeUrl,
        Pref.methodGet,
        token,
        value => {
          const convertTime = Moment.utc(value)
            .utcOffset(2, false)
            .format('YYYY/MM/DD HH:mm');
          const checkerDate = new Date(convertTime);
          this.setState({
            checkerDate: checkerDate,
          });
        },
        e => {},
      );
      this.setState({token: token});
      //Pref.setVal(Pref.cartItem, [])
      Pref.getVal(Pref.cartItem, value => {
        const val = JSON.parse(value);
        //console.log('orders', val);
        if (
          val === undefined ||
          val.length === 0 ||
          val === '' ||
          val === null
        ) {
          //NavigationActions.navigate('HomePage');
        } else {
          let sumValue = 0;
          const oppp = Lodash.map(val, (ele, index) => {
            sumValue += ele.price;
            if (index == 0) {
              branchData = ele.branchData;
              terminalNumbers = branchData.terminalNumber || '';
            }
            const extraDisplayArray = Helper.groupExtraWithCountString(
              ele.extras,
              false,
            );
            ele.extraDisplayArray = extraDisplayArray;
            return ele;
          });
          Helper.networkHelperToken(
            Pref.BusinessBranchDetailUrl + branchData.idbranch,
            Pref.methodGet,
            token,
            result => {
              const {businessHours, hasDelivery, freeDelivery} = result.branch;
              branchData = result.branch;
              terminalNumbers = branchData.terminalNumber || '';

              //console.log(branchData);

              const freeS = result.freeServices;
              //console.log(`freeS`, freeS);
              const freeItemS = result.services;
              //count cart data
              const countarray = this.counterservicesArray(val, true);
              const filter = [];
              let dialogtimesShow = 0;
              if (freeS.length > 0) {
                const groupedData = this.groupFreeListServicesArray(freeS, -1);
                dialogtimesShow = groupedData.length - 1;
                if (countarray.length > 0) {
                  Lodash.map(groupedData, gd => {
                    const {data} = gd;
                    const dataList = this.returnFreeServiceArrayShowModal(
                      data,
                      freeItemS,
                      countarray,
                      false,
                      -1,
                    );
                    if (dataList.length > 0) {
                      filter.push(dataList);
                    }
                  });
                }
              }
              const findmaxx = this.findTitleCountMax(filter, oppp);
              let max = Number(findmaxx[0]),
                maxTitle = findmaxx[1];
              //console.log(`findmaxx`, findmaxx);

              this.setState({
                businessHours: businessHours,
                hasDelivery: hasDelivery,
                freeS: freeS,
                freeItemS: freeItemS,
                freeServiceList:
                  filter.length > 0
                    ? this.firstItemfreeClickedshowAllButton(filter[0])
                    : [],
                ogFreeServiceList: filter,
                freeServiceDialogCounter: dialogtimesShow,
                showFreeServiceModal: filter.length > 0 ? true : false,
                showorderButton: true,
                freeDeliveryAmount: freeDelivery,
                maxQuantity: max,
                maxTitle: maxTitle,
              });
            },
            error => {
              //error
              console.log(error);
            },
          );
          this.setState(
            {
              data: oppp,
              totalAmt: sumValue,
              progressView: false,
              cloneData: val,
            },
            () => {
              //this.saveFreeData();
            },
          );
          //test
        }
      });
    });
    Pref.getVal(Pref.citySave, value => {
      this.setState({
        fullcitiesInput: Helper.removeQuotes(value),
      });
    });
  }

  findTitleCountMax = (filter, oppp) => {
    let max = 0,
      maxTitle = '';
    if (filter.length > 0) {
      const fip = filter[0];
      //console.log(`fip`, fip);
      const {quantity, firstservice} = fip[0];
      max = fip[0].quantity;
      const find = Lodash.find(oppp, io => io.serviceid === firstservice);
      if (find !== undefined) {
        maxTitle = find.serviceName;
      }
    }
    return [`${max}`, `${maxTitle}`];
  };

  /**
   *
   * @param {*} data
   * @param {*} freeItemS
   * @param {*} countarray
   * @param {*} iscounter
   * @param {*} requcounter
   */
  returnFreeServiceArrayShowModal = (
    data,
    freeItemS,
    countarray,
    iscounter = false,
    requcounter,
  ) => {
    var dataList = [];
    Lodash.map(data, fs => {
      const {firstservice, quantity, freeservice} = fs;
      let counter = 0;
      if (!iscounter) {
        const find = Lodash.find(countarray, i => i.id === firstservice);
        if (find !== undefined) {
          counter = find.counter;
        }
      } else {
        counter = requcounter;
      }
      if (counter > 0) {
        const firstpos = this.requiredFreeQuantity(counter, quantity);
        if (firstpos > 0) {
          const findsitem = Lodash.filter(freeItemS, io => {
            if (io.idservice === freeservice) {
              io.quantity = Number(firstpos);
              io.ogquantiy = Number(firstpos);
              io.ogquantity = Number(quantity);
              io.firstservice = firstservice;
              io.selected = false;
              io.clicked = false;
              return io;
            }
          });
          if (findsitem.length > 0) {
            dataList.push(findsitem[0]);
          }
        }
      }
      return fs;
    });

    // const merge = Lodash.map(dataList, (io, ind) => {
    //   io.clicked = true;
    //   if (ind === 0) {
    //     io.quantity = 0;
    //   } else {
    //     io.quantity = 0;
    //   }
    //   return io;
    // });

    return dataList;
  };

  /**
   *
   * @param {*} counter
   * @param {*} quantity
   */
  requiredFreeQuantity = (counter, quantity) => {
    let firstpos = '';
    let isMultiplable = Number(counter % quantity);
    if (isMultiplable != 0) {
      if (counter >= quantity) {
        const reduceone = counter - 1;
        isMultiplable = Number(reduceone % quantity);
      }
    }
    if (isMultiplable === 0) {
      const divisible = Number(counter) / Number(quantity);
      if (divisible > 0) {
        const strparse = divisible.toString();
        if (strparse.includes('.')) {
          firstpos = strparse.split('.')[0];
        } else {
          firstpos = strparse;
        }
      }
    }
    return firstpos.length === 0 ? 0 : Number(firstpos);
  };

  /**
   * count services based on id or firstservice
   * @param {*} data
   * @param {*} isFreeMode
   */
  counterservicesArray = (data, isFreeMode = false) => {
    if (data !== undefined && data.length > 0) {
      let countarray = [];
      Lodash.map(data, io => {
        const find = Lodash.find(countarray, b =>
          isFreeMode
            ? b.id === io.idservice
            : b.id === io.idservice && b.firstservice === io.firstservice,
        );
        if (find === undefined) {
          const pushItem = isFreeMode
            ? JSON.parse(
                JSON.stringify({
                  id: io.idservice,
                  counter: 1,
                }),
              )
            : JSON.parse(
                JSON.stringify({
                  id: io.idservice,
                  counter: 1,
                  firstservice: io.firstservice,
                  ogquantiy: io.ogquantiy,
                }),
              );
          countarray.push(pushItem);
        } else {
          const findindex = Lodash.findLastIndex(countarray, b =>
            isFreeMode
              ? b.id === io.idservice
              : b.id === io.idservice && b.firstservice === io.firstservice,
          );
          if (findindex !== -1) {
            let {counter} = find;
            find.counter = counter + 1;
            countarray[findindex] = find;
          }
        }
      });
      return countarray.length > 0 ? countarray : [];
    } else {
      return [];
    }
  };

  /**
   * group free services based on id
   * @param {*} data
   * @param {*} isFreeMode
   */
  groupFreeServicesArray = data => {
    let groupedArray = [];
    Lodash.map(data, io => {
      const find = Lodash.find(groupedArray, b => b.name === io.idservice);
      if (find === undefined) {
        groupedArray.push({
          name: io.idservice,
          data: [io],
        });
      } else {
        const findindex = Lodash.findLastIndex(
          groupedArray,
          b => b.name === io.idservice,
        );
        if (findindex !== -1) {
          let {data} = find;
          data.push(io);
          find.data = data;
          groupedArray[findindex] = find;
        }
      }
    });
    return groupedArray.length > 0 ? groupedArray : [];
  };

  /**
   * group freeList by firstservice free services based on id
   * @param {*} data
   * @param {*} isFreeMode
   */
  groupFreeListServicesArray = (data, specific) => {
    let groupedArray = [];
    Lodash.map(data, (io, ip) => {
      const {firstservice} = io;
      const find = Lodash.find(groupedArray, b => b.name === firstservice);
      if (find === undefined) {
        if (specific === firstservice && specific !== -1) {
          groupedArray.push({
            name: firstservice,
            data: [io],
          });
        } else {
          groupedArray.push({
            name: firstservice,
            data: [io],
          });
        }
      } else {
        const findindex = Lodash.findLastIndex(
          groupedArray,
          b => b.name === firstservice,
        );
        if (findindex !== -1) {
          if (specific === firstservice && specific !== -1) {
            let {data} = find;
            data.push(io);
            find.data = data;
            groupedArray[findindex] = find;
          } else {
            let {data} = find;
            data.push(io);
            find.data = data;
            groupedArray[findindex] = find;
          }
        }
      }
    });
    return groupedArray.length > 0 ? groupedArray : [];
  };

  /**
   * item remove
   * @param {item} item
   * @param {*} iii
   */
  itemRemove = (item, iii) => {
    const itemID = item.idservice;
    const cartData = JSON.parse(JSON.stringify(this.state.data));
    if (item.firstservice !== undefined && item.free === true) {
      cartData.splice(iii, 1);
      this.setState({data: cartData});
      const removeFreeService = Lodash.filter(
        cartData,
        i => i.firstservice === undefined,
      );
      Pref.setVal(Pref.cartItem, removeFreeService);
    } else {
      const amt = this.state.totalAmt - item.price;
      cartData.splice(iii, 1);
      const removeFreeService = Lodash.filter(
        cartData,
        i => i.firstservice === undefined,
      );
      Pref.setVal(Pref.cartTotalAmt, amt);
      Pref.setVal(Pref.cartItem, removeFreeService);
      const serviceData = Lodash.find(
        cartData,
        ix => ix.firstservice !== undefined && ix.firstservice === itemID,
      );
      if (serviceData !== undefined) {
        const fill1 = Lodash.filter(cartData, ix => ix.idservice === itemID);
        const counter = fill1.length;
        const {freeS, freeItemS} = this.state;
        const filter = [];
        if (freeS.length > 0) {
          const groupedData = this.groupFreeListServicesArray(freeS, itemID);
          Lodash.map(groupedData, gd => {
            const {data} = gd;
            const dataList = this.returnFreeServiceArrayShowModal(
              data,
              freeItemS,
              -1,
              true,
              counter,
            );
            if (dataList.length > 0) {
              filter.push(dataList);
            }
          });
        }
        const findmaxx = this.findTitleCountMax(filter, removeFreeService);
        let max = Number(findmaxx[0]),
          maxTitle = findmaxx[1];

        this.setState({
          data: removeFreeService,
          totalAmt: amt,
          freeServiceList:
            filter.length > 0
              ? this.firstItemfreeClickedshowAllButton(filter[0])
              : [],
          freeServiceDialogCounter: -1,
          showFreeServiceModal: filter.length > 0 ? true : false,
          maxQuantity: max,
          maxTitle: maxTitle,
        });
      } else {
        this.setState({
          totalAmt: amt,
          data: removeFreeService,
        });
      }
    }
    if (cartData.length === 0) {
      Pref.setVal(Pref.cartItem, []);
      Pref.setVal(Pref.EditModeEnabled, '');
      NavigationActions.goBack();
    }
  };

  /**
   * item add
   * @param {it} item
   */
  itemAdd(item) {
    const ppop = item.serviceName;
    const cartTime = Moment(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
    item.cartTime = cartTime;
    item.servicenamex = ppop;
    let itemId = item.idservice;
    const data = JSON.parse(JSON.stringify(this.state.data));
    const amt = this.state.totalAmt + item.price;
    data[data.length] = item;
    const removeFreeService = Lodash.filter(
      data,
      i => i.firstservice === undefined,
    );
    Pref.setVal(Pref.cartItem, removeFreeService);
    Pref.setVal(Pref.cartTotalAmt, amt);
    // const serviceData = Lodash.find(
    //   data,
    //   ix => ix.firstservice !== undefined && ix.firstservice === itemId,
    // );
    // if (serviceData !== undefined) {
    const filterOtherItem = Lodash.filter(data, iz => iz.idservice === itemId);
    const counter = filterOtherItem.length;
    const {freeS, freeItemS} = this.state;
    const filter = [];
    if (freeS.length > 0) {
      const groupedData = this.groupFreeListServicesArray(freeS, -1);
      Lodash.map(groupedData, gd => {
        const {data, name} = gd;
        if (name === itemId) {
          const dataList = this.returnFreeServiceArrayShowModal(
            data,
            freeItemS,
            -1,
            true,
            counter,
          );
          if (dataList.length > 0) {
            filter.push(dataList);
          }
        }
      });
    }
    const findmaxx = this.findTitleCountMax(filter, removeFreeService);
    let max = Number(findmaxx[0]),
      maxTitle = findmaxx[1];

    this.setState({
      data: removeFreeService,
      totalAmt: amt,
      freeServiceList:
        filter.length > 0
          ? this.firstItemfreeClickedshowAllButton(filter[0])
          : [],
      freeServiceDialogCounter: -1,
      showFreeServiceModal: filter.length > 0 ? true : false,
      maxQuantity: max,
      maxTitle: maxTitle,
    });
    // } else {
    //   this.setState({
    //     data: removeFreeService,
    //     totalAmt: amt,
    //   });
    // }
  }

  checknogps(fullcitiesInput) {
    const promisreturn = new Promise((resolve, reject) => {
      if (this.state.noLocationEnabled) {
        if (this.state.isDeliveryMode) {
          if (this.state.shownDialogdprice === 0) {
            this.setState({smp: true});
            if (branchData != null) {
              const idbranch = branchData.idbranch;
              const data = JSON.stringify({
                value: fullcitiesInput,
              });

              Helper.networkHelperTokenPost(
                Pref.GetDeliveryPricesNoGpsUrl + idbranch,
                data,
                Pref.methodPost,
                this.state.token,
                result => {
                  //console.log("result", result);
                  if (Helper.checkJson(result)) {
                    const dprice = Number(result.price);
                    let clone = this.state.totalAmt;
                    let totalAmt = this.state.totalAmt;
                    totalAmt += Number(dprice);
                    const cal =
                      Number(this.state.totalAmt) >
                      Number(this.state.freeDeliveryAmount)
                        ? 0
                        : dprice;
                    const caltotal =
                      Number(this.state.totalAmt) >
                      Number(this.state.freeDeliveryAmount)
                        ? clone
                        : totalAmt;

                    //console.log("totalAmt", totalAmt);
                    this.setState({
                      totalAmt: caltotal,
                      //totalAmt: totalAmt,
                      deliveryprices: cal,
                      //deliveryprices: dprice,
                      odeliveryprices: dprice,
                      deliveryCitiesList: [],
                      shownDialogdprice: 1,
                      smp: false,
                    });
                    resolve(dprice);
                  } else {
                    if (
                      result === "this branch doesn't deliver to your place"
                    ) {
                      this.setState({
                        smp: false,
                      });
                      resolve(2);
                    } else {
                      this.setState({
                        smp: false,
                      });
                      resolve(3);
                    }
                  }
                },
                error => {
                  this.setState({smp: false});
                  resolve(4);
                  //////console.log(error);
                },
              );
            }
          } else {
            this.setState({smp: false});
            resolve(0);
          }
        } else {
          this.setState({smp: false});
          resolve(0);
        }
      } else {
        this.setState({smp: false});
        resolve(0);
      }
    });
    return promisreturn;
  }

  pressPayment() {
    const {
      data,
      token,
      fullAddressInput,
      isDeliveryMode,
      selectedMode,
      gpsChecked,
      fullcitiesInput,
      businessHours,
      hasDelivery,
    } = this.state;
    if (isDeliveryMode && fullAddressInput === '' && !gpsChecked) {
      this.setState({
        alertContent: i18n.t(k._24),
        showAlert: true,
      });
    } else {
      if (
        fullAddressInput.includes(':') ||
        fullAddressInput.includes('#') ||
        fullAddressInput.includes('^')
      ) {
        this.setState({
          alertContent: i18n.t(k._25),
          showAlert: true,
        });
      } else {
        this.setState({smp: true});
        Helper.networkHelperToken(
          Pref.ServerTimeUrl,
          Pref.methodGet,
          token,
          value => {
            const convertTime = Moment.utc(value)
              .utcOffset(2, false)
              .format('YYYY/MM/DD HH:mm');
            const checkerDate = new Date(convertTime);
            Helper.networkHelperToken(
              Pref.BranchStatusUrl + branchData.idbranch,
              Pref.methodGet,
              token,
              res => {
                this.setState({
                  smp: false,
                  convertTime: convertTime,
                });
                if (res === 'open') {
                  if (hasDelivery === 0) {
                    this.checknogps(fullcitiesInput).then(value => {
                      //console.log("value", value);
                      if (value === 0) {
                        Alert.alert('', 'האם אתה בטוח שברצונך להזמין?', [
                          {
                            text: 'לא',
                            onPress: () => console.log('Cancel Pressed'),
                          },

                          {
                            text: 'כן',
                            onPress: () => {
                              const geolat = this.state.currentLat;
                              const geolng = this.state.currentLog;
                              // const day = Moment(Date.now()).format(
                              //   "YYYY/MM/DD HH:mm"
                              // );
                              //cgUid
                              //let cgUid = ``;
                              if (selectedMode) {
                                const findCardSelected = Lodash.find(
                                  this.state.cardList,
                                  cardx => cardx.selected === true,
                                );
                                //console.log(`findCardSelected`, findCardSelected)
                                if (findCardSelected !== undefined) {
                                  this.setState({
                                    smp: true,
                                  });
                                  const total = this.state.totalAmt;
                                  let parstotal = '';
                                  if (total.toString().includes('.')) {
                                    parstotal = total
                                      .toString()
                                      .replace('.', '');
                                  } else {
                                    parstotal = `${total.toString()}00`;
                                  }
                                  const datetime = this.state.convertTime;
                                  const terminalNumber =
                                    branchData.terminalNumber;
                                  //console.log(branchData);
                                  const {
                                    cardTempNumber,
                                    cardTempcvv,
                                    cardTempyear,
                                  } = this.state;
                                  let sendXml = '';
                                  // console.log(
                                  //   `findCardSelected`,
                                  //   findCardSelected,
                                  // );
                                  if (findCardSelected.cardId !== '') {
                                    sendXml = `<ashrait><request><version>2000</version><language>ENG</language><dateTime>${datetime}</dateTime><command>doDeal</command><requestId></requestId><doDeal><cardId>${
                                      findCardSelected.cardId
                                    }</cardId><terminalNumber>${terminalNumber}</terminalNumber><cardNo></cardNo><cardExpiration>${
                                      findCardSelected.cardyear
                                    }</cardExpiration><cvv></cvv><total>${parstotal}</total><transactionType>Debit</transactionType><creditType>RegularCredit</creditType><currency>ILS</currency><transactionCode>Phone</transactionCode><validation>AutoCommHold</validation><customerData/></doDeal></request></ashrait>`;
                                  } else {
                                    sendXml = `<ashrait><request><version>2000</version><language>ENG</language><dateTime>${datetime}</dateTime><command>doDeal</command><requestId></requestId><doDeal><terminalNumber>${terminalNumber}</terminalNumber><cardNo>${cardTempNumber}</cardNo><cardExpiration>${cardTempyear}</cardExpiration><cvv>${cardTempcvv}</cvv><total>${parstotal}</total><transactionType>Debit</transactionType><creditType>RegularCredit</creditType><currency>ILS</currency><transactionCode>Phone</transactionCode><validation>AutoCommHold</validation><customerData/></doDeal></request></ashrait>`;
                                  }
                                  //console.log(`sendXml`, sendXml);
                                  const cardurl = `${
                                    Pref.CreditCardUrl
                                  }?int_in=${sendXml}&sessionId=${
                                    this.state.cardSessionID
                                  }`;
                                  //console.log(`sendXml`, sendXml, cardurl);
                                  fetch(cardurl, {
                                    method: Pref.methodPost,
                                  })
                                    .then(response => {
                                      return response.text();
                                    })
                                    .then(out => {
                                      const parsexml = xml2js
                                        .parseStringPromise(out, {
                                          explicitArray: false,
                                        })
                                        .then(result => {
                                          // console.log(
                                          //   `result`,
                                          //   JSON.stringify(result),
                                          // );
                                          const {ashrait} = result;
                                          const {response} = ashrait;
                                          const {
                                            message,
                                            doDeal,
                                            additionalInfo,
                                          } = response;
                                          const {
                                            cardId,
                                            cgUid,
                                            fileNumber,
                                            slaveTerminalNumber,
                                            slaveTerminalSequence,
                                          } = doDeal;
                                          tempCguid = cgUid;
                                          //update card
                                          this.updateCardid(
                                            cardTempNumber,
                                            cardId,
                                          );
                                          let shovar = `${fileNumber}${slaveTerminalNumber}${slaveTerminalSequence}`;
                                          //console.log(`shovar`, shovar);
                                          //cgUid = findCardSelected.cgUid;
                                          const guid = Helper.guid();
                                          const newArr = Lodash.map(
                                            data,
                                            (o, index) => {
                                              o.orderdate = this.state.convertTime;
                                              o.isdelivery = isDeliveryMode;
                                              o.paid = selectedMode;
                                              o.geolat = geolat;
                                              o.geolng = geolng;
                                              o.cgUid = cgUid;
                                              //if (this.state.insertGuid) {
                                              o.guid = guid;
                                              //}
                                              if (this.state.isDeliveryMode) {
                                                if (index == 0) {
                                                  o.deliveryprice = Number(
                                                    this.state.deliveryprices,
                                                  );
                                                }
                                              }
                                              o.address =
                                                isDeliveryMode === true
                                                  ? this.state.fullAddressInput
                                                  : '';
                                              o.shovar = shovar || '';
                                              return o;
                                            },
                                          );
                                          if (
                                            additionalInfo
                                              .toString()
                                              .includes(`SUCCESS`)
                                          ) {
                                            const datax = JSON.stringify(
                                              newArr,
                                            );
                                            this.orderapiCallback(
                                              datax,
                                              newArr,
                                              token,
                                              true,
                                            );
                                          } else {
                                            this.setState({
                                              smp: false,
                                              showAlert: true,
                                              alertContent: `${i18n.t(
                                                k.invalidCard,
                                              )}`,
                                            });
                                          }
                                        });
                                    })
                                    .catch(e => {
                                      this.setState({
                                        smp: false,
                                      });
                                    });
                                } else {
                                  this.setState({
                                    smp: false,
                                    alertContent: `${i18n.t(
                                      k.nocardselectedorder,
                                    )}`,
                                    showAlert: true,
                                  });
                                }
                              } else {
                                this.setState({
                                  smp: true,
                                });
                                const guid = Helper.guid();
                                const newArr = Lodash.map(data, (o, index) => {
                                  o.orderdate = this.state.convertTime;
                                  o.isdelivery = isDeliveryMode;
                                  o.paid = selectedMode;
                                  o.geolat = geolat;
                                  o.geolng = geolng;
                                  o.cgUid = '';
                                  //if (this.state.insertGuid) {
                                  o.guid = guid;
                                  //}
                                  if (this.state.isDeliveryMode) {
                                    if (index == 0) {
                                      o.deliveryprice = Number(
                                        this.state.deliveryprices,
                                      );
                                    }
                                  }
                                  o.address =
                                    isDeliveryMode === true
                                      ? this.state.fullAddressInput
                                      : '';
                                  o.shovar = '';
                                  return o;
                                });
                                const datax = JSON.stringify(newArr);
                                this.orderapiCallback(
                                  datax,
                                  newArr,
                                  token,
                                  false,
                                );
                              }
                            },
                          },
                        ]);
                      } else if (value === 2) {
                        this.setState({
                          alertTitle: i18n.t(k._4),
                          flexChanged: false,
                          alertContent: i18n.t(k._26),
                          showAlert: true,
                        });
                      } else if (value === 3) {
                        this.setState({
                          alertTitle: i18n.t(k._4),
                          flexChanged: false,
                          alertContent: i18n.t(k._27),
                          showAlert: true,
                        });
                      } else if (value === 4) {
                      } else {
                        this.setState({
                          alertTitle: i18n.t(k._4),
                          flexChanged: false,
                          alertContent: `עלות משלוח היא ${value} שקל, האם אתה בטוח שאתה רוצה לסיים את ההזמנה?`,
                          showAlert: true,
                        });
                      }
                    });
                  } else {
                    this.setState({
                      alertTitle: i18n.t(k._4),
                      alertContent: i18n.t(k.deliverynotavailable),
                      showAlert: true,
                      flexChanged: true,
                    });
                  }
                } else {
                  this.setState({
                    smp: false,
                    alertTitle: i18n.t(k._30),
                    alertContent: i18n.t(k._28),
                    showAlert: true,
                    flexChanged: true,
                  });
                }
              },
              e => {
                console.log(e);
              },
            );
          },
          error => {
            this.setState({smp: false});
          },
        );
      }
    }
  }

  orderapiCallback = (datax, newArr, token, paymentmode) => {
    //console.log(`datax`, datax);
    Helper.networkHelperTokenPost(
      Pref.PostOrderUrl,
      datax,
      Pref.methodPost,
      token,
      result => {
        //console.log('tempCguid', tempCguid);
        if (tempCguid !== '') {
          if (
            result ===
              `order didn't went through, invalid prices mismatch detected` ||
            result === "order didn't went through"
          ) {
            Helper.networkHelperToken(
              Pref.GetSessionCardUrl,
              Pref.methodGet,
              token,
              cardSessionID => {
                this.cancelvisapayment(
                  newArr,
                  result,
                  paymentmode,
                  cardSessionID,
                );
              },
              error => {
                //console.log(error);
              },
            );
          } else {
            this.orderDone(newArr, result, paymentmode);
          }
        } else {
          this.orderDone(newArr, result, paymentmode);
        }
      },
      error => {
        this.setState({
          smp: false,
        });
      },
    );
  };

  /**
   * order Done
   * @param {*} newArr
   * @param {*} result
   */
  orderDone = (newArr, result, paymentmode) => {
    this.setState({
      smp: false,
    });
    if (result === "order didn't went through") {
      this.setState({
        smp: false,
        alertContent: result,
        showAlert: true,
        tempCguid: '',
      });
    } else if (result === 'GUID was used by this user, ack not accepted?') {
      Alert.alert(
        ``,
        `זוהתה ניסיון להזמין את אותו הזמנה פעמיים. האם להמשיך? ניתן לבדוק אם ההזמנה קיימת בהזמנות פעילות.`,
        [
          {
            text: 'לא',
            onPress: () => console.log('Cancel Pressed'),
          },
          {
            text: 'כן',
            onPress: () => {
              this.setState(
                {
                  smp: false,
                  insertGuid: true,
                  paymentDoneAlready: paymentmode,
                  tempCguid: '',
                },
                () => {
                  this.pressPayment();
                },
              );
            },
          },
        ],
        {
          cancelable: false,
        },
      );
    } else if (
      result === `order didn't went through, invalid prices mismatch detected`
    ) {
      this.setState({
        smp: false,
        showAlert: true,
        alertContent:
          'מחיר ההזמנה לא תואם למחיר האמיתי של המוצרים, אנא נסה שוב',
        flexChanged: true,
        tempCguid: '',
      });
      Pref.setVal(Pref.cartItem, []);
      Pref.setVal(Pref.EditModeEnabled, '');
      //NavigationActions.goBack();
    } else {
      Pref.setVal(Pref.cartItem, []);
      const {branches, order_Bs} = result;
      const allDatas = Helper.orderData(order_Bs, branches, true);
      NavigationActions.navigate('TrackOrder', {
        item: allDatas,
      });
    }
  };

  cancelvisapayment = (newArr, result, paymentmode, cardSessionID) => {
    const terminalNumber = branchData.terminalNumber;
    if (terminalNumber !== '' && tempCguid !== '') {
      const sendXml = `<ashrait><request><command>cancelDeal</command><requesteId></requesteId><dateTime/><version>2000</version><language>Eng</language><cancelDeal><terminalNumber>${terminalNumber}</terminalNumber><cgUid>${tempCguid}</cgUid></cancelDeal></request></ashrait>`;
      //console.log(`sendXml`, sendXml);
      fetch(
        `${Pref.CreditCardUrl}?int_in=${sendXml}&sessionId=${cardSessionID}`,
        {method: Pref.methodPost},
      )
        .then(response => {
          return response.text();
        })
        .then(out => {
          const parsexml = xml2js
            .parseStringPromise(out, {
              explicitArray: false,
            })
            .then(xxx => {
              const {ashrait} = xxx;
              const {response} = ashrait;
              const {message, cancelDeal, additionalInfo} = response;
              //console.log(`message`, message, additionalInfo);
              if (additionalInfo.toString().includes('SUCCESS')) {
                this.orderDone(newArr, result, paymentmode);
              }
            });
        })
        .catch(e => {
          console.log(`e`, e);
        });
    }
  };

  extraRow(item, index) {
    return (
      <View style={{flexDirection: 'column'}}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          <Title
            styleName="wrap"
            style={{
              color: '#292929',
              fontFamily: 'Rubik',
              fontSize: 16,
              fontWeight: '400',
              paddingHorizontal: 2,
            }}>
            {`${Lodash.capitalize(item.data)} `}
          </Title>
        </View>
      </View>
    );
  }

  editmode = item => {
    Pref.setVal(Pref.EditModeEnabled, '1');
    NavigationActions.navigate('NewBusinessPage', {
      mode: true,
      lol: item,
      item: item.branchData,
    });
  };

  renderRow(item, index) {
    return (
      <View
        style={{
          flexDirection: 'column',
          marginHorizontal: sizeWidth(4),
          marginVertical: sizeHeight(2),
          borderRadius: 4,
          borderColor: '#dedede',
          borderStyle: 'solid',
          borderWidth: 1,
          flex: 0,
        }}>
        <View style={{flexDirection: 'row', flex: 1}}>
          <Card
            elevation={4}
            style={{
              marginHorizontal: sizeWidth(2),
              marginTop: 8,
              borderTopRightRadius: 8,
              borderTopStartRadius: 8,
              borderBottomRightRadius: 8,
              borderBottomStartRadius: 8,
              borderBottomEndRadius: 8,
              borderBottomLeftRadius: 8,
              flexWrap: 'wrap',
              width: 96,
              height: 96,
            }}>
            <Image
              styleName="small"
              source={{
                uri: `${Pref.BASEURL}${item.imageUrl}`,
              }}
              style={{
                width: 96,
                height: 96,
                alignSelf: 'center',
                justifyContent: 'center',
                borderTopEndRadius: 8,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderTopStartRadius: 8,
                borderBottomRightRadius: 8,
                borderBottomStartRadius: 8,
                borderBottomEndRadius: 8,
                borderBottomLeftRadius: 8,
              }}
            />
          </Card>
          <View
            style={{
              flexDirection: 'column',
              flex: 1,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
              }}>
              <Title
                styleName="bold"
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontSize: 16,
                  alignSelf: 'flex-start',
                  fontWeight: '700',
                }}>
                {Helper.subslongText(item.serviceName, 20)}
              </Title>
              <Title
                style={{
                  color: '#B72727',
                  fontFamily: 'Rubik',
                  alignSelf: 'flex-start',
                  fontSize: 16,
                  marginEnd: 8,
                  fontWeight: '700',
                }}>
                {`${i18n.t(k._6)}${item.price}`}
              </Title>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
              <Title
                styleName="wrap"
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontSize: 15,
                  fontWeight: '400',
                  paddingHorizontal: 2,
                  writingDirection: 'ltr',
                }}>
                {`${Lodash.capitalize(item.extraDisplayArray.trim())}`}
              </Title>
            </View>
            {item.message !== '' &&
            item.message !== undefined &&
            item.message !== i18n.t(k.NULL) ? (
              <Title
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  alignSelf: 'flex-start',
                  fontSize: 16,
                }}>
                {`${i18n.t(k._7)} ${item.message}`}
              </Title>
            ) : null}
          </View>
        </View>
        {item.free === undefined || item.free === false ? (
          <>
            <View
              style={{
                backgroundColor: '#d9d9d9',
                height: 1,
                marginHorizontal: sizeWidth(2),
                marginVertical: sizeHeight(2),
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: sizeWidth(1),
                marginBottom: sizeHeight(1),
              }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  // this.setState({ indexToAnimate: index });
                  this.itemRemove(item, index);
                }}>
                <View
                  style={{
                    borderRadius: 1,
                    borderColor: '#D5D5D5',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    color: '#ECECEC',
                    borderRadius: 4,
                    paddingVertical: sizeHeight(0.5),
                    paddingHorizontal: sizeWidth(1),
                    marginHorizontal: sizeWidth(2),
                    width: 64,
                  }}>
                  <Subtitle
                    style={{
                      color: '#555555',
                      fontFamily: 'Rubik',
                      alignSelf: 'center',
                      fontSize: 14,
                      fontWeight: '400',
                    }}>
                    {'מחיקה'}
                  </Subtitle>
                </View>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback onPress={() => this.editmode(item)}>
                <View
                  style={{
                    borderRadius: 1,
                    borderColor: '#D5D5D5',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    color: '#ECECEC',
                    width: 64,
                    borderRadius: 4,
                    marginHorizontal: sizeWidth(2),
                    paddingVertical: sizeHeight(0.5),
                    paddingHorizontal: sizeWidth(1),
                  }}>
                  <Subtitle
                    style={{
                      color: '#555555',
                      fontFamily: 'Rubik',
                      alignSelf: 'center',
                      fontSize: 14,
                      fontWeight: '400',
                    }}>
                    {'עריכה'}
                  </Subtitle>
                </View>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback
                onPress={() => {
                  //this.setState({ indexToAnimate: index });
                  this.itemAdd(item);
                }}>
                <View
                  style={{
                    borderRadius: 1,
                    borderColor: '#D5D5D5',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    color: '#ECECEC',
                    borderRadius: 4,
                    marginHorizontal: sizeWidth(2),
                    paddingVertical: sizeHeight(0.5),
                    paddingHorizontal: sizeWidth(1),
                    width: 64,
                  }}>
                  <Icon
                    name="add"
                    size={24}
                    color={'#292929'}
                    style={{
                      color: '#555555',
                      alignSelf: 'center',
                    }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                backgroundColor: '#d9d9d9',
                height: 1,
                marginHorizontal: sizeWidth(2),
                marginVertical: sizeHeight(2),
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: sizeWidth(1),
                marginBottom: sizeHeight(1),
              }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  // this.setState({ indexToAnimate: index });
                  this.itemRemove(item, index);
                }}>
                <View
                  style={{
                    borderRadius: 1,
                    borderColor: '#D5D5D5',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    color: '#ECECEC',
                    borderRadius: 4,
                    paddingVertical: sizeHeight(0.5),
                    paddingHorizontal: sizeWidth(1),
                    marginHorizontal: sizeWidth(2),
                    width: 64,
                  }}>
                  <Subtitle
                    style={{
                      color: '#555555',
                      fontFamily: 'Rubik',
                      alignSelf: 'center',
                      fontSize: 14,
                      fontWeight: '400',
                    }}>
                    {'מחיקה'}
                  </Subtitle>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </>
        )}
      </View>
    );
  }

  locationOpen = () => {
    let last = this.state.gpsChecked;
    this.setState({gpsChecked: !last});
    const lat = this.state.currentLat;
    const lng = this.state.currentLog;
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

  //card selecte
  cardSelect = (item, index) => {
    const {selected} = item;
    const filter = Lodash.map(this.state.cardList, ix => {
      if (ix.name === item.name) {
        item.selected = !selected;
      } else {
        ix.selected = false;
      }
      return ix;
    });
    this.setState({cardList: filter});
  };

  /**
   *  mode ? plus : minus
   * @param {*} item
   * @param {*} index
   * @param {*} mode
   */
  freeserviceSelect = (item, index, mode) => {
    const {freeServiceList} = this.state;
    let {quantity, ogquantiy} = item;
    if (mode) {
      if (quantity < ogquantiy) {
        item.quantity = quantity + 1;
      }
    } else {
      if (quantity > 0) {
        item.quantity = quantity - 1;
      }
    }
    freeServiceList[index] = item;
    let mapping = freeServiceList;
    let totalselection = 0;
    if (item.quantity === ogquantiy) {
      mapping = Lodash.map(freeServiceList, io => {
        if (item.idservice !== io.idservice) {
          io.quantity = -1;
        }
        return io;
      });
    } else {
      mapping = Lodash.map(freeServiceList, io => {
        if (totalselection === ogquantiy) {
          io.quantity = -1;
        } else {
          totalselection += io.quantity;
          if (io.quantity === -1) {
            io.quantity = 0;
          }
        }
        //console.log(`quantity`, io.quantity);
        return io;
      });
    }
    if (totalselection === ogquantiy) {
      mapping = Lodash.map(freeServiceList, io => {
        if (io.quantity === 0) {
          io.quantity = -1;
        }
        return io;
      });
    }
    //console.log(`totalselection`, totalselection);
    let maxqq = Lodash.sumBy(mapping, xm => xm.quantity);
    //console.log(`maxqq`, maxqq);
    this.setState({
      freeServiceList: mapping,
      //maxQuantity:totalselection === ogquantiy ? 0 : maxqq === 0 ? ogquantiy : maxqq,
    });
  };

  saveFreeData = () => {
    const {
      data,
      freeServiceList,
      ogFreeServiceList,
      freeServiceDialogCounter,
    } = this.state;
    Lodash.map(freeServiceList, findx => {
      const {quantity} = findx;
      if (quantity > 0) {
        for (let index = 0; index < quantity; index++) {
          data.push(this.returnfreeItem(findx));
        }
      }
    });
    if (freeServiceDialogCounter === 0 || freeServiceDialogCounter === -1) {
      this.setState({
        data: data,
        showFreeServiceModal: false,
        freeServiceList: [],
      });
    } else {
      let subtract = freeServiceDialogCounter - 1;
      const findmaxx = this.findTitleCountMax(
        ogFreeServiceList,
        this.state.data,
      );
      let max = Number(findmaxx[0]),
        maxTitle = findmaxx[1];

      this.setState({
        data: data,
        showFreeServiceModal: false,
        freeServiceList:
          ogFreeServiceList[subtract].length > 0
            ? this.firstItemfreeClickedshowAllButton(
                ogFreeServiceList[subtract],
              )
            : [],
        freeServiceDialogCounter: subtract,
        maxQuantity: max,
        maxTitle: maxTitle,
      });
    }
  };

  /**
   * free item
   * @param {} findx
   */
  returnfreeItem = findx => {
    const {checkerDate, currentLat, currentLog, cdata} = this.state;
    const cartTime = Moment(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
    const guid = Helper.guid();
    let day = Moment(checkerDate).format('YYYY/MM/DD HH:mm');
    //console.log(`findx.idservice`, findx.idservice);
    const items = {
      guid: guid,
      cartTime: cartTime,
      fkcustomero: cdata.idcustomer,
      orderdate: day,
      idservice: findx.idservice,
      serviceid: findx.idservice,
      serviceName: findx.name,
      price: 0,
      quantity: 1,
      extras: [],
      isdelivery: false,
      status: 1,
      geolat: currentLat,
      geolng: currentLog,
      fkbrancho: findx.fkbranchS,
      paid: true,
      message: '',
      deliveryprice: 0,
      Customertelephone: cdata.phone,
      branchData: findx.fkbranchSNavigation,
      imageUrl: findx.imageUrl,
      serviceMode: -1,
      circleTab: [],
      selectedCirclePos: -1,
      extraImageItemList: [],
      extraImageItemList1: [],
      extraImageItemList2: [],
      extraImageItemList3: [],
      extraImageItemList4: [],
      extraImageItemList5: [],
      extraImageItemList6: [],
      showCircleExtraData: [],
      freeList: [],
      finishedList: [],
      extraDisplayArray: '',
      free: true,
      firstservice: findx.firstservice,
      ogquantity: findx.ogquantity,
    };
    return items;
  };

  firstItemfreeClicked = (item, index) => {
    const {freeServiceList} = this.state;
    const merge = Lodash.map(freeServiceList, io => {
      const {idservice} = io;
      io.clicked = true;
      if (Number(item.idservice) === Number(idservice)) {
        io.quantity = 0;
      } else {
        io.quantity = 0;
      }
      return io;
    });
    this.setState({freeServiceList: merge});
  };

  firstItemfreeClickedshowAllButton = freeServiceList => {
    const merge = Lodash.map(freeServiceList, io => {
      const {idservice} = io;
      io.clicked = true;
      io.quantity = 0;
      return io;
    });
    return merge;
  };

  /**
   * FreeService
   * @param {free} item
   * @param {*} index
   */
  renderRowFreeServiceList(item, index) {
    return (
      <View>
        <TouchableWithoutFeedback
          onPress={() => {
            // if (!item.clicked) {
            //   this.firstItemfreeClicked(item, index);
            // }
          }}>
          <View
            styleName="space-between"
            style={{
              marginHorizontal: sizeWidth(2),
              flexDirection: 'row-reverse',
              flex: 1,
              borderRadius: 4,
              marginVertical: sizeHeight(1),
              backgroundColor: `white`,
            }}>
            <Image
              source={{
                uri: `${Pref.BASEURL}${item.imageUrl}`,
              }}
              //styleName="small"
              style={{
                flex: 0.2,
                backgroundColor: 'transparent',
                alignSelf: 'center',
                resizeMode: 'contain',
                //width: 72,
                height: 56,
              }}
            />
            <View style={{flex: 0.4}}>
              <View
                style={{
                  flexDirection: 'column-reverse',
                  alignItems: 'flex-end',
                }}>
                <Title
                  styleName="v-end h-end"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                  {`${i18n.t(k._6)}0.0`}
                </Title>
                <Subtitle
                  styleName="v-start h-start"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                  {`${item.name}`}
                </Subtitle>
              </View>
            </View>
            <View
              style={{
                flex: 0.4,
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }}>
              {item.clicked && item.quantity !== -1 ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    marginEnd: 8,
                  }}>
                  {item.quantity < item.ogquantiy &&
                  this.state.maxQuantity !== 0 ? (
                    <TouchableOpacity
                      onPress={() => this.freeserviceSelect(item, index, true)}>
                      <View
                        style={{
                          borderRadius: circleButtonFreeRadius,
                          width: circleButtonFreeWidth,
                          height: circleButtonFreeWidth,
                          borderColor: '#3daccf',
                          borderWidth: 1,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                        }}>
                        <Icon
                          name="add"
                          size={20}
                          color="#75D75E"
                          style={{
                            alignContent: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            backgroundColor: 'transparent',
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        borderRadius: circleButtonFreeRadius,
                        width: circleButtonFreeWidth,
                        height: circleButtonFreeWidth,
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                      }}
                    />
                  )}
                  <Title
                    styleName="bold"
                    style={{
                      color: '#5EBBD7',
                      fontFamily: 'Rubik',
                      fontSize: 17,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      fontWeight: '700',
                      marginStart: 12,
                      marginEnd: 12,
                    }}>
                    {`${item.quantity}`}
                  </Title>

                  {item.quantity <= item.ogquantiy && item.quantity > 0 ? (
                    <TouchableOpacity
                      onPress={() =>
                        this.freeserviceSelect(item, index, false)
                      }>
                      <View
                        style={{
                          borderRadius: circleButtonFreeRadius,
                          width: circleButtonFreeWidth,
                          height: circleButtonFreeWidth,
                          borderColor: '#3daccf',
                          borderWidth: 1,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                        }}>
                        <Icon
                          name="remove"
                          size={20}
                          color="#D75E5E"
                          style={{
                            alignContent: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            backgroundColor: 'transparent',
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        borderRadius: circleButtonFreeRadius,
                        width: circleButtonFreeWidth,
                        height: circleButtonFreeWidth,
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                      }}
                    />
                  )}
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    marginEnd: 8,
                  }}>
                  <View
                    style={{
                      borderRadius: circleButtonFreeRadius,
                      width: circleButtonFreeWidth,
                      height: circleButtonFreeWidth,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                    }}
                  />
                  <Title
                    styleName="bold"
                    style={{
                      fontFamily: 'Rubik',
                      fontSize: 18,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      fontWeight: '700',
                      marginStart: 12,
                      marginEnd: 12,
                    }}>
                    {``}
                  </Title>

                  <View
                    style={{
                      borderRadius: circleButtonFreeRadius,
                      width: circleButtonFreeWidth,
                      height: circleButtonFreeWidth,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
        {index === this.state.freeServiceList.length - 1 ? (
          <View
            style={{
              height: 1,
              backgroundColor: '#dedede',
            }}
          />
        ) : null}
      </View>
    );
  }

  renderRowCardsList(item, index) {
    const image = item.creditCardImage || `${Pref.VisaCardImage}card.png`;
    return (
      <TouchableWithoutFeedback onPress={() => this.cardSelect(item, index)}>
        <View
          style={{
            width: '96%',
            marginStart: 8,
            //marginHorizontal: sizeWidth(1),
            justifyContent: 'space-between',
            flexDirection: 'row',
            flex: 1,
            borderColor: '#dedede',
            borderRadius: 4,
            borderWidth: 0.5,
            marginVertical: sizeHeight(1),
            paddingHorizontal: 4,
            paddingVertical: 6,
            backgroundColor: item.selected ? i18n.t(k.DACCF) : `white`,
          }}>
          <View
            styleName="vertical"
            style={{
              marginStart: 8,
              marginTop: 4,
              marginBottom: 4,
            }}>
            <Title
              styleName="v-start h-start "
              style={{
                color: item.selected ? `white` : 'black',
                fontFamily: 'Rubik',
                fontSize: 15,
                fontWeight: '600',
                alignSelf: 'flex-start',
              }}>
              {`${i18n.t(k.cardsavedtextendwith)}-${item.name}`}
            </Title>
            {!item.checked ? (
              <Subtitle
                styleName="v-start h-start "
                style={{
                  color: item.selected ? `white` : '#646464',
                  fontFamily: 'Rubik',
                  fontSize: 13,
                  fontWeight: '200',
                  alignSelf: 'flex-start',
                  marginTop: -6,
                }}>
                {`${i18n.t(k.notsavedvisacard)}*`}
              </Subtitle>
            ) : null}
          </View>
          <Image
            source={{uri: `${image}`}}
            //name="credit-card"
            //size={32}
            //color={"#646464"}
            style={{
              //tintColor: '#646464',
              padding: 4,
              marginEnd: 8,
              backgroundColor: 'transparent',
              alignSelf: 'center',
              justifyContent: 'center',
              height: 32,
              width: 32,
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  saveCardsData = () => {
    const {cardnumber, cardcvv, cardyear, cardList} = this.state;
    console.log(`cardDetails`, cardnumber, cardcvv, cardyear);
    if (cardnumber === '' || cardcvv === '' || cardyear === '') {
      alert(`${i18n.t(k.carddetailsEmpty)}`);
    } else {
      //this.setState({smp: false});
      const total = this.state.totalAmt;
      let parstotal = '';
      if (total.toString().includes('.')) {
        parstotal = total.toString().replace('.', '');
      } else {
        parstotal = `${total.toString()}00`;
      }
      const datetime = this.state.convertTime;
      const terminalNumber = branchData.terminalNumber;
      // const sendXml = `<ashrait><request><version>2000</version><language>ENG</language><dateTime>${datetime}</dateTime><command>doDeal</command><requestId></requestId><doDeal><terminalNumber>${terminalNumber}</terminalNumber><cardNo>${cardnumber}</cardNo><cardExpiration>${cardyear}</cardExpiration><cvv>${cardcvv}</cvv><total>${parstotal}</total><transactionType>Debit</transactionType><creditType>RegularCredit</creditType><currency>ILS</currency><transactionCode>Phone</transactionCode><validation>AutoCommHold</validation><customerData/></doDeal></request></ashrait>`;
      //console.log(`sendXml`, sendXml)
      //   fetch(
      //     `${Pref.CreditCardUrl}?int_in=${sendXml}&sessionId=${
      //       this.state.cardSessionID
      //     }`,
      //     {method: Pref.methodPost},
      //   )
      //     .then(response => {
      //       return response.text();
      //     })
      //     .then(out => {
      //       this.setState({smp: false});
      //       const parsexml = xml2js
      //         .parseStringPromise(out, {
      //           explicitArray: false,
      //         })
      //         .then(result => {
      //           const {ashrait} = result;
      //           const {response} = ashrait;
      //           const {message, doDeal, additionalInfo} = response;
      //           //console.log(`additionalInfo`, additionalInfo);
      //           if (additionalInfo.toString().includes(`SUCCESS`)) {
      this.setState({showcardAdd: false});
      const sub = cardnumber.toString().slice(cardnumber.length - 4);
      const checked = this.state.cardSave;

      const firsttwo = sub.substr(0, 1);

      const creteid = `${sub}${firsttwo}`;

      const item = {
        id: creteid,
        cardyear: cardyear,
        cardId: '',
        name: `${sub}`,
        checked: checked,
        selected: false,
        terminalNumber: terminalNumber,
        creditCardImage: this.state.creditCardImage,
      };
      cardList.push(item);
      if (checked) {
        Pref.setVal(Pref.cardList, cardList);
      }
      this.setState({
        cardList: cardList,
        showcardAdd: false,
        cardTempNumber: cardnumber,
        cardTempcvv: cardcvv,
        cardTempyear: cardyear,
        cardTempID: creteid,
        cardnumber: '',
        cardcvv: '',
        cardyear: '',
        cardSave: false,
      });
    }
  };

  updateCardid = (cardnumber, cardid) => {
    Pref.getVal(Pref.cardList, value => {
      const val = JSON.parse(value);
      //console.log(`val`, val)
      if (
        val === '' ||
        val === null ||
        (val === undefined && val.length === 0)
      ) {
      } else {
        const {cardTempID} = this.state;
        let find = Lodash.find(val, xmm => xmm.id === cardTempID);
        if (find !== undefined) {
          const index = Lodash.findLastIndex(val, xm => xm.id === cardTempID);
          if (index !== -1) {
            find.cardId = cardid;
            val[index] = find;
            //console.log(`updated`, val);
            Pref.setVal(Pref.cardList, val);
          }
        }
      }
    });
  };

  returnCardImage = cardnumber => {
    let creditCardImage = `${Pref.VisaCardImage}card.png`;
    if (cardnumber.length > 0) {
      if (cardnumber.length === 8) {
        creditCardImage = `${Pref.VisaCardImage}isracart.png`;
      } else {
        const sp = cardnumber.substr(0, 2);
        if (sp === '30' || sp === '36' || sp === '38') {
          creditCardImage = `${Pref.VisaCardImage}DINERS.png`;
        } else if (sp === '37' || sp === '34') {
          creditCardImage = `${Pref.VisaCardImage}AMEX.png`;
        } else if (
          sp === '51' ||
          sp === '52' ||
          sp === '53' ||
          sp === '54' ||
          sp === '55'
        ) {
          creditCardImage = `${Pref.VisaCardImage}MASTERCARD.png`;
        } else {
          const sp = cardnumber.substr(0, 1);
          if (sp === '4') {
            creditCardImage = `${Pref.VisaCardImage}VISA.png`;
          }
        }
      }
    }
    return creditCardImage;
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
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <NavigationBar
            styleName="inline no-border"
            rightComponent={
              <View
                style={{
                  flexDirection: 'row',
                  marginEnd: sizeWidth(5),
                }}
              />
            }
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
                      alignSelf: 'center',
                      backgroundColor: 'transparent',
                    }}
                  />
                </TouchableOpacity>

                <Heading
                  style={{
                    fontSize: 20,
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                    alignSelf: 'center',
                  }}>
                  {i18n.t(k._8)}
                </Heading>
              </View>
            }
          />

          <ScrollView
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps={'handled'}
            showsVerticalScrollIndicator={false}>
            <View
              styleName="vertical"
              style={{
                flex: 1,
              }}>
              <DummyLoader
                visibilty={this.state.progressView}
                center={
                  this.state.data != null &&
                  this.state.data !== undefined ? (
                    <FlatList
                      extraData={this.state}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      data={this.state.data}
                      keyExtractor={(item, index) => `${index}`}
                      renderItem={({item: item, index}) =>
                        this.renderRow(item, index)
                      }
                    />
                  ) : null
                }
              />

              <View
                style={{
                  flexDirection: 'row',
                  borderRadius: 1,
                  borderColor: '#dedede',
                  borderStyle: 'solid',
                  borderWidth: 1,
                  marginTop: sizeHeight(1.5),
                  marginHorizontal: sizeWidth(4),
                  height: sizeHeight(7),
                }}>
                {this.state.isrealDelivery ? (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      if (!this.state.isDeliveryMode) {
                        if (
                          Number(this.state.totalAmt) >
                          Number(this.state.freeDeliveryAmount)
                        ) {
                          this.setState({
                            isDeliveryMode: true,
                          });
                        } else {
                          const dom = this.state.odeliveryprices;
                          const mixtotal = this.state.totalAmt + dom;
                          this.setState({
                            isDeliveryMode: true,
                            totalAmt: mixtotal,
                          });
                        }
                      }
                    }}>
                    <View
                      style={{
                        flex: 0.5,
                        backgroundColor: this.state.isDeliveryMode
                          ? '#5EBBD7'
                          : 'white',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}>
                      {/* <Image source={require('./../res/images/card.png')}
                                        style={{ width: 24, height: 24, marginEnd: 16, }}
                                     /> */}
                      <Title
                        styleName="bold"
                        style={{
                          color: this.state.isDeliveryMode
                            ? 'white'
                            : '#777777',
                          fontFamily: 'Rubik',
                          fontSize: 16,
                          fontWeight: '700',
                          alignContent: 'center',
                          justifyContent: 'center',
                          alignSelf: 'center',
                        }}>
                        {`${i18n.t(k._9)}`}{' '}
                      </Title>
                    </View>
                  </TouchableWithoutFeedback>
                ) : (
                  <View
                    style={{
                      flex: 0.5,
                      backgroundColor: this.state.isDeliveryMode
                        ? '#5EBBD7'
                        : 'white',
                      alignContent: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    {/* <Image source={require('./../res/images/card.png')}
                                        style={{ width: 24, height: 24, marginEnd: 16, }}
                                     /> */}
                    <Title
                      styleName="bold"
                      style={{
                        color: this.state.isDeliveryMode
                          ? 'white'
                          : '#777777',
                        fontFamily: 'Rubik',
                        fontSize: 16,
                        fontWeight: '700',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                      }}>
                      {`${i18n.t(k._10)}`}{' '}
                    </Title>
                  </View>
                )}

                <TouchableWithoutFeedback
                  onPress={() => {
                    if (this.state.isDeliveryMode) {
                      if (
                        Number(this.state.totalAmt) >
                        Number(this.state.freeDeliveryAmount)
                      ) {
                        this.setState({
                          isDeliveryMode: false,
                        });
                      } else {
                        const dom = this.state.odeliveryprices;
                        const mixtotal = this.state.totalAmt - dom;
                        this.setState({
                          isDeliveryMode: false,
                          totalAmt: mixtotal,
                        });
                      }
                    }
                  }}>
                  <View
                    style={{
                      flex: 0.5,
                      flexDirection: 'row',
                      backgroundColor: !this.state.isDeliveryMode
                        ? '#5EBBD7'
                        : 'white',
                      alignContent: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {/* <Image source={require('./../res/images/cash.png')}
                                        style={{ width: 24, height: 24, marginEnd: 16, }}
                                     /> */}
                    <Title
                      styleName="bold"
                      style={{
                        color: !this.state.isDeliveryMode
                          ? 'white'
                          : '#777777',
                        fontFamily: 'Rubik',
                        fontSize: 16,
                        fontWeight: '700',
                      }}>
                      {`${i18n.t(k._11)}`}
                    </Title>
                  </View>
                </TouchableWithoutFeedback>
              </View>

              {this.state.isDeliveryMode ? (
                <View
                  style={{
                    flexDirection: 'column',
                    marginTop: 12,
                  }}>
                  <Subtitle
                    style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      alignSelf: 'flex-start',
                      marginTop: sizeHeight(1),
                      marginStart: sizeWidth(4),
                      fontWeight: '400',
                    }}>
                    {i18n.t(k._12)}
                  </Subtitle>
                  <TextInput
                    mode="flat"
                    placeholder={i18n.t(k._13)}
                    underlineColor="transparent"
                    underlineColorAndroid="transparent"
                    style={styles.inputStyle}
                    placeholderTextColor={i18n.t(k.DEDEDE)}
                    onChangeText={value =>
                      this.setState({
                        fullAddressInput: value,
                      })
                    }
                    value={this.state.fullAddressInput}
                  />

                  <Subtitle
                    style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      alignSelf: 'flex-start',
                      marginTop: sizeHeight(1),
                      marginStart: sizeWidth(4),
                      fontWeight: '400',
                    }}>
                    {`${i18n.t(k._14)}`}
                  </Subtitle>
                  <TextInput
                    mode="flat"
                    placeholder={`${i18n.t(k._15)}`}
                    underlineColor="transparent"
                    underlineColorAndroid="transparent"
                    style={styles.inputStyle}
                    placeholderTextColor={i18n.t(k.DEDEDE)}
                    onChangeText={value => this.filtercities(value)}
                    value={this.state.fullcitiesInput}
                  />

                  {this.state.deliveryCitiesList.length > 0 ? (
                    <FlatList
                      extraData={this.state}
                      data={this.state.deliveryCitiesList}
                      keyExtractor={(item, index) => index.toString()}
                      style={{
                        marginHorizontal: sizeWidth(3),
                      }}
                      keyboardShouldPersistTaps={'handled'}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                      renderItem={({item: item, index}) =>
                        this.renderRowSuggestion(item, index)
                      }
                    />
                  ) : null}

                  <View
                    style={{
                      marginStart: sizeWidth(1.5),
                      flexDirection: 'row',
                      marginTop: 8,
                      alignItems: 'flex-end',
                      alignSelf: 'flex-start',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <Checkbox.Android
                        status={
                          this.state.savedAdd
                            ? i18n.t(k.CHECKED)
                            : i18n.t(k.UNCHECKED)
                        }
                        onPress={() => {
                          const vl = this.state.address;
                          //////console.log('v', vl)
                          this.setState({
                            fullAddressInput: vl,
                            savedAdd: !this.state.savedAdd,
                          });
                        }}
                        color={'#3DACCF'}
                        uncheckedColor={i18n.t(k.DEDEDE1)}
                      />

                      <Subtitle
                        style={{
                          color: '#777777',
                          fontSize: 14,
                          alignSelf: 'center',
                        }}>
                        {i18n.t(k._16)}
                      </Subtitle>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginStart: 8,
                      }}>
                      <Checkbox.Android
                        status={
                          !this.state.gpsChecked
                            ? i18n.t(k.UNCHECKED)
                            : i18n.t(k.CHECKED)
                        }
                        onPress={this.locationOpen}
                        color={'#3DACCF'}
                        uncheckedColor={i18n.t(k.DEDEDE1)}
                      />

                      <Subtitle
                        style={{
                          color: '#777777',
                          fontSize: 14,
                          alignSelf: 'center',
                        }}>
                        {i18n.t(k.GPS)}
                      </Subtitle>
                    </View>
                  </View>
                </View>
              ) : null}
              <View
                style={{
                  backgroundColor: '#d9d9d9',
                  height: 1,
                  marginHorizontal: sizeWidth(2),
                  marginVertical: sizeHeight(2),
                }}
              />

              {this.state.isDeliveryMode ? (
                this.state.isrealDelivery ? (
                  //freeDeliveryAmount
                  Number(this.state.deliveryprices) > 0 ? (
                    <Subtitle
                      style={{
                        color: '#474747',
                        fontSize: 15,
                        alignSelf: 'center',
                        fontWeight: '700',
                      }}>{`${i18n.t(k._17)} ${
                      this.state.deliveryprices
                    } ${i18n.t(k._18)}`}</Subtitle>
                  ) : (
                    <Subtitle
                      style={{
                        color: '#474747',
                        fontSize: 15,
                        alignSelf: 'center',
                        fontWeight: '700',
                      }}>{`${i18n.t(k._17)} ${i18n.t(
                      k.freeDeliveryText,
                    )}`}</Subtitle>
                  )
                ) : null
              ) : null}

              <Title
                style={{
                  color: '#474747',
                  fontSize: 18,
                  alignSelf: 'center',
                  fontWeight: '700',
                }}>{`${i18n.t(k._19)} ${this.state.totalAmt} ${i18n.t(
                k._18,
              )}`}</Title>
              <View
                style={{
                  marginStart: sizeWidth(4),
                  flexDirection: 'row',
                }}>
                <Subtitle
                  style={{
                    color: '#292929',
                    fontSize: 15,
                    alignSelf: 'center',
                    fontWeight: '700',
                  }}>
                  {i18n.t(k._20)}
                </Subtitle>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  borderRadius: 1,
                  borderColor: '#dedede',
                  borderStyle: 'solid',
                  borderWidth: 1,
                  marginTop: sizeHeight(1.5),
                  marginHorizontal: sizeWidth(4),
                  height: sizeHeight(7),
                }}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    if (terminalNumbers !== '') {
                      this.setState({
                        selectedMode: true,
                      });
                    }
                  }}>
                  <View
                    style={{
                      flex: 0.5,
                      backgroundColor: this.state.selectedMode
                        ? '#5EBBD7'
                        : 'white',
                      alignContent: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    <Image
                      source={require('./../res/images/card.png')}
                      style={{
                        width: 24,
                        height: 24,
                        marginEnd: 16,
                        tintColor: '#777777',
                      }}
                    />

                    <Title
                      styleName="bold"
                      style={{
                        color: this.state.selectedMode
                          ? 'white'
                          : '#777777',
                        fontFamily: 'Rubik',
                        fontSize: 16,
                        fontWeight: '700',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                      }}>
                      {terminalNumbers !== ''
                        ? `${i18n.t(k._21)}`
                        : `${i18n.t(k.visaunavailable)}`}
                    </Title>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                  onPress={() =>
                    this.setState({
                      selectedMode: false,
                    })
                  }>
                  <View
                    style={{
                      flex: 0.5,
                      flexDirection: 'row',
                      backgroundColor: !this.state.selectedMode
                        ? '#5EBBD7'
                        : 'white',
                      alignContent: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('./../res/images/cash.png')}
                      style={{
                        width: 24,
                        height: 24,
                        marginEnd: 16,
                      }}
                    />

                    <Title
                      styleName="bold"
                      style={{
                        color: !this.state.selectedMode
                          ? 'white'
                          : '#777777',
                        fontFamily: 'Rubik',
                        fontSize: 16,
                        fontWeight: '700',
                      }}>
                      {`${i18n.t(k._22)}`}
                    </Title>
                  </View>
                </TouchableWithoutFeedback>
              </View>
              {this.state.selectedMode ? (
                <View
                  style={{
                    flexDirection: 'column',
                    marginHorizontal: sizeWidth(4),
                    marginVertical: sizeHeight(2),
                    borderRadius: 4,
                    borderColor: '#dedede',
                    borderStyle: 'solid',
                    borderWidth: 1,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                    }}>
                    <DummyLoader
                      visibilty={this.state.progressView}
                      style={{
                        width: '100%',
                        flexBasis: 1,
                      }}
                      center={
                        this.state.cardList.length > 0 ? (
                          <FlatList
                            extraData={this.state}
                            nestedScrollEnabled={true}
                            style={{
                              marginVertical: 8,
                            }}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={true}
                            data={this.state.cardList}
                            keyExtractor={(item, index) => `${index}`}
                            renderItem={({item, index}) =>
                              this.renderRowCardsList(item, index)
                            }
                          />
                        ) : (
                          <Subtitle
                            styleName="md-gutter"
                            style={{
                              color: '#292929',
                              fontSize: 15,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              paddingVertical: 8,
                              marginVertical: sizeHeight(0.5),
                            }}>
                            {`${i18n.t(k.nosavedcardfound)}`}
                          </Subtitle>
                        )
                      }
                    />
                  </View>
                  <View
                    style={{
                      backgroundColor: '#d9d9d9',
                      height: 1,
                      marginHorizontal: sizeWidth(2),
                      marginVertical: sizeHeight(2),
                    }}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      alignContent: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}>
                    <TouchableWithoutFeedback
                      onPress={() =>
                        this.setState({
                          showcardAdd: true,
                        })
                      }>
                      <View
                        style={{
                          borderRadius: 1,
                          borderColor: i18n.t(k.DACCF),
                          borderStyle: 'solid',
                          borderWidth: 1,
                          backgroundColor: i18n.t(k.DACCF),
                          width: '40%',
                          alignContent: 'center',
                          borderRadius: 4,
                          marginHorizontal: sizeWidth(2),
                          paddingVertical: sizeHeight(0.5),
                          paddingHorizontal: sizeWidth(1),
                          justifyContent: 'center',
                          paddingVertical: 8,
                        }}>
                        <Subtitle
                          style={{
                            color: 'white',
                            fontFamily: 'Rubik',
                            alignSelf: 'center',
                            fontSize: 14,
                            fontWeight: '400',
                          }}>
                          {`${i18n.t(k.creditcardAdd)}`}
                        </Subtitle>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>
          {this.state.smp === false ? (
            this.state.showorderButton === true ? (
              <Button
                style={styles.loginButtonStyle}
                mode="contained"
                dark={true}
                uppercase={true}
                color={'white'}
                onPress={this.pressPayment}
                loading={false}>
                <Subtitle
                  styleName="v-center h-center"
                  style={{
                    color: 'white',
                  }}>
                  {i18n.t(k._23)}
                </Subtitle>
              </Button>
            ) : null
          ) : null}

          <Portal>
            <Modal
              dismissable={true}
              onDismiss={() =>
                this.setState({
                  showcardAdd: false,
                })
              }
              visible={this.state.showcardAdd}
              contentContainerStyle={{
                height: i18n.t(k._5),
              }}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : ''}
                style={{flex: 1}}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    Keyboard.dismiss();
                  }}>
                  <View
                    style={{
                      flex: 1,
                    }}>
                    <View style={{flex: 0.05}} />
                    <View
                      style={{
                        flex: 0.85,
                        marginTop: sizeHeight(4),
                        marginBottom: sizeHeight(8),
                        marginHorizontal: sizeWidth(4),
                        backgroundColor: 'white',
                        flexDirection: 'column',
                        position: 'relative',
                      }}>
                      <View
                        style={{
                          flex: 0.1,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          backgroundColor: 'white',
                          marginTop: 6,
                        }}>
                        <View
                          styleName="horizontal"
                          style={{
                            marginStart: sizeWidth(3),
                            alignItems: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={() =>
                              this.setState({
                                showcardAdd: false,
                              })
                            }>
                            <Icon
                              name="arrow-forward"
                              size={36}
                              color="#292929"
                              style={{
                                alignSelf: 'flex-start',
                                backgroundColor: 'transparent',
                              }}
                            />
                          </TouchableOpacity>
                          <Subtitle
                            style={{
                              color: 'black',
                              fontFamily: 'Rubik',
                              fontSize: 16,
                              alignSelf: 'center',
                              fontWeight: '700',
                              justifyContent: 'center',
                              marginStart: 16,
                            }}>
                            {`${i18n.t(k.cardaddtext)}`}
                          </Subtitle>
                        </View>
                      </View>

                      <View
                        style={{
                          flex: 0.8,
                          backgroundColor: 'white',
                          flexDirection: 'column',
                          alignContent: 'center',
                        }}>
                        <ScrollView
                          keyboardShouldPersistTaps={'handled'}
                          showsHorizontalScrollIndicator={false}
                          showsVerticalScrollIndicator>
                          <View style={{flex: 1}}>
                            <View
                              style={{
                                flex: 0.65,
                                //backgroundColor: 'red',
                                alignItems: 'center',
                                alignContent: 'center',
                              }}>
                              <ImageBackground
                                source={require('../res/images/visacardbg.png')}
                                styleName="large"
                                style={{
                                  width: '100%',
                                  marginTop: -8,
                                  //height:200
                                }}>
                                <View
                                  styleName="fill-parent"
                                  style={{flex: 1,}}>
                                  <View style={{flex: 0.29}} />
                                  <View
                                    style={{
                                      flex: 0.15,
                                      flexDirection: 'row-reverse',
                                      //borderColor: i18n.t(k.DEDEDE1),
                                      //borderStyle: i18n.t(k.SOLID),
                                      //borderWidth: 1,
                                      backgroundColor: 'transparent',
                                      //paddingEnd: 8,
                                      //flex:1,
                                      //borderRadius: 16,
                                      //marginStart: sizeWidth(6),
                                      width:'100%',
                                      //marginEnd: sizeWidth(3),
                                      height: 36,
                                      alignItems: 'center',
                                      alignContent: 'center',
                                      justifyContent:'space-between',
                                      borderRadius: 24,
                                    }}>
                                    <View
                                      style={{
                                        height:36,
                                        flex: 1,
                                        backgroundColor: i18n.t(k.FFFFFF),
                                        borderRadius: 24,
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'space-between',
                                        marginHorizontal:sizeWidth(5)
                                      }}>
                                      <MaskedInput
                                        innerRef={this.cardnumberRef}
                                        onChangeText={(
                                          formatted,
                                          extracted,
                                        ) => {
                                          //console.log(formatted);
                                          let formyear = formatted.split(
                                            ' ',
                                          );
                                          const cardnumber = formyear.join(
                                            '',
                                          );
                                          this.setState({
                                            cardnumber: cardnumber,
                                            creditCardImage: this.returnCardImage(
                                              cardnumber,
                                            ),
                                          });
                                        }}
                                        mask={'0000 0000 0000 0000'}
                                        style={{
                                          height: 36,
                                          flex: 0.85,
                                          //backgroundColor: i18n.t(k.FFFFFF),
                                          color: `black`,
                                          fontFamily: i18n.t(k.RUBIK),
                                          fontSize: 14,
                                          fontWeight: '700',
                                          letterSpacing: 4.5,
                                          paddingEnd: 16,
                                          //borderTopLeftRadius: 16,
                                          //borderBottomLeftRadius: 16,
                                          textAlign: 'left',
                                        }}
                                        placeholder={`xxxx xxxx xxxx xxxx`}
                                        underlineColor="transparent"
                                        underlineColorAndroid="transparent"
                                        keyboardType={'numeric'}
                                        value={this.state.cardnumber}
                                        onSubmitEditing={e => {
                                          if (
                                            this.cardyearRef !== undefined
                                          ) {
                                            this.cardyearRef.current.focus();
                                          }
                                        }}
                                      />

                                      <View
                                        style={{
                                          height: 36,
                                          flex: 0.1,
                                          //backgroundColor: 'white',
                                          //borderTopLeftRadius: 16,
                                          //borderBottomLeftRadius: 16,
                                          alignItems: 'center',
                                          alignContent: 'center',
                                          alignSelf: 'center',
                                          justifyContent: 'flex-start',
                                        }}>
                                        <Image
                                          source={{
                                            uri: `${
                                              this.state.creditCardImage
                                            }`,
                                          }}
                                          style={{
                                            //marginEnd: 4,
                                            marginStart: 16,
                                            width: 24,
                                            height: 24,
                                            marginTop: 5,
                                            //tintColor: '#777777',
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                          }}
                                        />
                                      </View>
                                    </View>
                                  </View>
                                  <View style={{flex: 0.11}} />
                                  <View
                                    style={{
                                      marginTop: 0.5,
                                      flex: 0.32,
                                      flexDirection: 'row',
                                      height: 36,
                                      justifyContent: 'space-between',
                                      //marginStart: 24,
                                      //marginEnd: 24,
                                      marginStart: sizeWidth(6),
                                      marginEnd: sizeWidth(6),
                                    }}>
                                    <MaskedInput
                                      innerRef={this.cardcvvRef}
                                      onChangeText={(
                                        formatted,
                                        extracted,
                                      ) => {
                                        // console.log(formatted);
                                        this.setState({
                                          cardcvv: formatted,
                                        });
                                      }}
                                      mask={'000'}
                                      style={{
                                        flex: 0.75,
                                        height: 36,
                                        borderRadius: 8,
                                        //borderColor: i18n.t(k.DEDEDE1),
                                        //borderStyle: i18n.t(k.SOLID),
                                        //borderWidth: 1,
                                        backgroundColor: i18n.t(k.FFFFFF),
                                        color: `black`,
                                        fontFamily: i18n.t(k.RUBIK),
                                        fontSize: 14,
                                        fontWeight: '700',
                                        letterSpacing: 4.5,
                                        paddingEnd: 8,
                                        textAlign: 'left',

                                        //backgroundColor:'red'
                                      }}
                                      placeholder={`xxx`}
                                      underlineColor="transparent"
                                      underlineColorAndroid="transparent"
                                      keyboardType={'numeric'}
                                      value={this.state.cardcvv}
                                    />
                                    <View style={{flex: 0.18}} />
                                    <MaskedInput
                                      innerRef={this.cardyearRef}
                                      onChangeText={(
                                        formatted,
                                        extracted,
                                      ) => {
                                        let formyear = formatted.replace(
                                          '/',
                                          '',
                                        );
                                        // console.log(
                                        //   `formyear`,
                                        //   formyear,
                                        // );
                                        this.setState({
                                          cardyear: formyear,
                                        });
                                      }}
                                      mask={'00/00'}
                                      style={{
                                        flex: 0.5,
                                        height: 36,
                                        borderRadius: 8,
                                        //borderColor: i18n.t(k.DEDEDE1),
                                        //borderStyle: i18n.t(k.SOLID),
                                        //borderWidth: 1,
                                        backgroundColor: i18n.t(k.FFFFFF),
                                        color: `black`,
                                        fontFamily: i18n.t(k.RUBIK),
                                        fontSize: 14,
                                        fontWeight: '700',
                                        letterSpacing: 4.5,
                                        paddingEnd: 8,
                                        textAlign: 'left',
                                        //paddingStart: 8,
                                        //backgroundColor:'blue'
                                      }}
                                      placeholder={`MM/YY`}
                                      underlineColor="transparent"
                                      underlineColorAndroid="transparent"
                                      keyboardType={'numeric'}
                                      value={this.state.cardyear}
                                      onSubmitEditing={e => {
                                        if (this.cardcvvRef !== undefined) {
                                          this.cardcvvRef.current.focus();
                                        }
                                      }}
                                    />
                                  </View>
                                  <View style={{flex: 0.12}} />
                                </View>
                              </ImageBackground>
                            </View>
                            <View style={{flex: 0.35, marginTop: -36}}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignSelf: 'flex-start',
                                  marginStart: 8,
                                }}>
                                <Checkbox.Android
                                  status={
                                    this.state.cardSave
                                      ? i18n.t(k.CHECKED)
                                      : i18n.t(k.UNCHECKED)
                                  }
                                  onPress={() =>
                                    this.setState({
                                      cardSave: !this.state.cardSave,
                                    })
                                  }
                                  color={'#3DACCF'}
                                  uncheckedColor={i18n.t(k.DEDEDE1)}
                                />
                                <Subtitle
                                  style={{
                                    color: '#292929',
                                    fontSize: 15,
                                    alignSelf: 'center',
                                  }}>
                                  {i18n.t(k.savecardcheckbox)}
                                </Subtitle>
                              </View>
                              <View
                                style={{
                                  alignItems: 'center',
                                  alignContent: 'center',
                                  paddingBottom: 6,
                                  marginTop: 12,
                                }}>
                                <Subtitle
                                  style={{
                                    color: '#646464',
                                    fontSize: 12,
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                  }}>
                                  {`${i18n.t(k.cardsecurity)}`}
                                </Subtitle>
                                <Image
                                  source={require('./../res/images/creditguard.png')}
                                  //styleName="medium-wide"
                                  style={{
                                    width: '40%',
                                    height: 32,
                                    marginTop: 4,
                                    //tintColor: '#777777',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    padding: 8,
                                  }}
                                />
                              </View>
                            </View>
                          </View>
                        </ScrollView>
                      </View>
                      <View
                        style={{
                          flex: 0.1,
                          backgroundColor: 'white',
                          flexDirection: 'column',
                          marginTop: 4,
                        }}>
                        <View
                          style={{
                            position: 'absolute',
                            width: '100%',
                            bottom: 0,
                            backgroundColor: 'white',
                          }}>
                          <TouchableOpacity
                            styleName="flexible"
                            onPress={this.saveCardsData}>
                            <View
                              style={styles.buttonStyle}
                              // mode="contained"
                              // dark={true}
                              // onPress={() => this.finalorders(false)}
                              loading={false}>
                              <Subtitle
                                style={{
                                  color: 'white',
                                  fontFamily: 'Rubik',
                                  fontSize: 18,
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                }}>
                                {`${i18n.t(k.cardconfirmfinal)}`}
                              </Subtitle>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <View style={{flex: 0.1}} />
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </Modal>
          </Portal>

          <Portal>
            <Modal
              dismissable={true}
              visible={this.state.showFreeServiceModal}
              onDismiss={() =>
                this.setState({
                  showFreeServiceModal: false,
                })
              }
              contentContainerStyle={{
                height: i18n.t(k._5),
              }}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : ''}
                style={{flex: 1}}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    Keyboard.dismiss();
                  }}>
                  <View style={{flex: 1}}>
                    <View style={{flex: 0.05}} />
                    <View
                      style={{
                        flex: 0.8,
                        marginTop: sizeHeight(4),
                        marginBottom: sizeHeight(8),
                        marginHorizontal: sizeWidth(4),
                        backgroundColor: 'white',
                        flexDirection: 'column',
                        position: 'relative',
                      }}>
                      <View
                        style={{
                          flex: 0.15,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          backgroundColor: 'white',
                          marginTop: 6,
                        }}>
                        <View
                          styleName="horizontal"
                          style={{
                            marginStart: sizeWidth(3),
                            alignItems: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={() =>
                              this.setState({
                                showFreeServiceModal: false,
                              })
                            }>
                            <Icon
                              name="arrow-forward"
                              size={36}
                              color="#292929"
                              style={{
                                alignSelf: 'flex-start',
                                backgroundColor: 'transparent',
                              }}
                            />
                          </TouchableOpacity>
                          <Subtitle
                            style={{
                              color: 'black',
                              fontFamily: 'Rubik',
                              fontSize: 16,
                              alignSelf: 'center',
                              fontWeight: '700',
                              justifyContent: 'center',
                              marginStart: 16,
                            }}>
                            {`${i18n.t(k.freeServiceTextHeader1)} ${
                              this.state.maxQuantity
                            } ${i18n.t(k.freeServiceTextHeader)}!`}
                          </Subtitle>
                        </View>
                      </View>
                      <FlatList
                        extraData={this.state}
                        nestedScrollEnabled={true}
                        style={{flex: 0.7}}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={true}
                        data={this.state.freeServiceList}
                        keyExtractor={(item, index) => `${index}`}
                        renderItem={({item, index}) =>
                          this.renderRowFreeServiceList(item, index)
                        }
                        ItemSeparatorComponent={() => (
                          <View
                            style={{
                              height: 1,
                              backgroundColor: '#dedede',
                            }}
                          />
                        )}
                      />
                      <View
                        style={{
                          flex: 0.15,
                          backgroundColor: 'white',
                          flexDirection: 'column',
                          marginTop: 4,
                        }}>
                        <View
                          style={{
                            position: 'absolute',
                            width: '100%',
                            bottom: 0,
                            backgroundColor: 'white',
                          }}>
                          <TouchableOpacity
                            styleName="flexible"
                            onPress={this.saveFreeData}>
                            <View
                              style={styles.buttonStyle}
                              // mode="contained"
                              // dark={true}
                              // onPress={() => this.finalorders(false)}
                              loading={false}>
                              <Subtitle
                                style={{
                                  color: 'white',
                                  fontFamily: 'Rubik',
                                  fontSize: 18,
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                }}>
                                {`${i18n.t(k.freeServiceButton)}`}
                              </Subtitle>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <View style={{flex: 0.15}} />
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </Modal>
          </Portal>
          {this.state.showAlert ? (
            <AlertDialog
              isShow={true}
              title={this.state.alertTitle}
              content={this.state.alertContent}
              flexChanged={this.state.flexChanged}
              callbacks={() =>
                this.setState(
                  {
                    showAlert: false,
                    flexChanged: false,
                  },
                  () => {
                    Pref.getVal(Pref.cartItem, value => {
                      const val = JSON.parse(value);
                      //console.log('orders', val);
                      if (
                        val === undefined ||
                        val === null ||
                        val.length === 0 ||
                        val === ''
                      ) {
                        NavigationActions.goBack();
                      }
                    });
                  },
                )
              }
            />
          ) : null}
          <Loader isShow={this.state.smp} />
        </Screen>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  inputStyle: {
    height: sizeHeight(8),
    borderRadius: 2,
    borderColor: i18n.t(k.DEDEDE1),
    borderStyle: i18n.t(k.SOLID),
    borderWidth: 1,
    backgroundColor: i18n.t(k.FFFFFF),
    marginHorizontal: sizeWidth(4),
    color: i18n.t(k._2),
    fontFamily: i18n.t(k.RUBIK),
    fontSize: 16,
    fontWeight: i18n.t(k._31),
  },

  inputStyle1: {
    height: sizeHeight(8),
    borderRadius: 2,
    borderColor: i18n.t(k.DEDEDE1),
    borderStyle: i18n.t(k.SOLID),
    borderWidth: 1,
    backgroundColor: i18n.t(k.FFFFFF),
    marginHorizontal: sizeWidth(4),
    marginVertical: sizeHeight(2),
    color: i18n.t(k._2),
    fontFamily: i18n.t(k.RUBIK),
    fontSize: 16,
    fontWeight: i18n.t(k._31),
  },

  submitButton: {
    color: i18n.t(k.WHITE),
    bottom: 0,
    paddingVertical: 6,
    width: i18n.t(k._5),
    backgroundColor: i18n.t(k.DACCF),
    textAlign: 'center',
  },

  loginButtonStyle: {
    color: i18n.t(k.WHITE),
    bottom: 0,
    paddingVertical: sizeWidth(1.5),
    marginHorizontal: sizeWidth(4),
    marginBottom: sizeHeight(2),
    marginTop: sizeHeight(2),
    backgroundColor: i18n.t(k.DACCF),
    textAlign: 'center',
    bottom: 0,
  },
  buttonStyle: {
    width: i18n.t(k._5),
    height: 48,
    alignItems: i18n.t(k.CENTER),
    backgroundColor: i18n.t(k.DACCF),
    borderRadius: 0,
    alignSelf: i18n.t(k.CENTER),
    justifyContent: i18n.t(k.CENTER),
  },
});
