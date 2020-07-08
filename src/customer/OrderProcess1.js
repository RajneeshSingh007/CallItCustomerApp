import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  SectionList,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  UIManager,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Button,
  Card,
  Chip,
  Colors,
  Surface,
  List,
  TextInput,
  Checkbox,
  Modal,
  Portal,
  Provider,
} from 'react-native-paper';
import {
  View,
  Caption,
  Divider,
  Heading,
  Image,
  NavigationBar,
  Row,
  Screen,
  Subtitle,
  Title,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from '@shoutem/ui';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import {Loader} from './Loader';
import * as Lodash from 'lodash';
import NavigationActions from '../util/NavigationActions';
import Moment from 'moment';
import {sizeHeight, sizeWidth, sizeFont} from '../util/Size';
import PropType from 'prop-types';
import DummyLoader from '../util/DummyLoader';
import {AlertDialog} from './../util/AlertDialog';
import {PropTypes} from 'mobx-react';
import AccordationItem from './AccordationItem';
import AccordItem from './AccordItem';

const circleWidth = 224;
const circleHeight = circleWidth;
const circleRadius = circleWidth / 2;
const querterWidth = circleWidth / 4;
const extraItemWidth = 27;
const extraItemHeight = 27;
let selectedCirclePos = -1;
let backTrackCounter = 0;
let prevCircleTab = 0;
let freeList = [];
let finishedList = [];
let currentCat = '';

export default class OrderProcess1 extends React.Component {
  static propTypes = {
    branchid: PropType.any,
    tabNames: PropType.array,
    eachTabData: PropType.array,
    orderInc: PropType.func,
    deliveryPrice: PropType.string,
    customerdt: PropType.string,
    namexx: PropType.number,
    currentNames: PropType.number,
    hasDelivery: PropTypes.number,
    checkerDate: PropTypes.Object,
  };

  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      // tslint:disable-next-line:no-unused-expression
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    this.renderExcatItemRow = this.renderExcatItemRow.bind(this);
    this.renderExcatDItemRow = this.renderExcatDItemRow.bind(this);
    this.backClick = this.backClick.bind(this);
    this.chipClick = this.chipClick.bind(this);
    this.selectedColors = this.selectedColors.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.circleTabClick = this.circleTabClick.bind(this);
    this.hideAlert = this.hideAlert.bind(this);
    this.finishDough = this.finishDough.bind(this);
    this.circlextrapickerBack = this.circlextrapickerBack.bind(this);
    this.finishCirclePos = this.finishCirclePos.bind(this);
    this.eachCirclePartClick = this.eachCirclePartClick.bind(this);
    this.menuItemClicked = this.menuItemClicked.bind(this);
    //this.accordClick = this.accordClick.bind(this);
    const day = Moment(Date.now()).format('YYYY/MM/DD HH:mm');
    this.state = {
      branchid: 0,
      progressView: false,
      selectedTab: 0,
      tabNames: [],
      eachTabData: [],
      serviceDetail: [],
      serviceExtra: [],
      serviceCat: [],
      visibility: 0,
      mainBaseCount: 1,
      mainBaseAmount: 0,
      totalAmount: 0,
      cartDetails: [],
      cartItemCounter: 0,
      cartTotalAmount: 0,
      cartStatus: false,
      cartExArray: [],
      checkChip: false,
      multiArr: [],
      multiArrItems: [],
      scrollHide: true,
      date: day,
      currentLog: 0,
      currentLat: 0,
      majorFilteredData: [],
      type: 'relative',
      clickitem: null,
      message: i18n.t(k._4),
      deliveryPrice: '',
      customerdt: null,
      token: '',
      countercart: 0,
      showOrderNo: false,
      mode: false,
      lol: null,
      lessamtss: 0,
      okkkk: false,
      showAlert: false,
      alertContent: i18n.t(k._4),
      alertTitle: i18n.t(k._29),
      selectionData: [],
      flexChanged: false,
      servicemode: 0,
      circleTab: 1,
      showCircleExtraSelection: false,
      circleExtras: [],
      circleProgressView: true,
      originalExtras: [],
      extraReset: false,
      showCircleExtraData: [],
      untouchedExtras: [],
      extraImageItemList: [],
      extraImageItemList1: [],
      extraImageItemList2: [],
      extraImageItemList3: [],
      extraImageItemList4: [],
      extraImageItemList5: [],
      extraImageItemList6: [],
      pizzaImageList: null,
      tillDoughPrice: 0,
      clickedItemPos: 0,
      clickedPos: 0,
      backClicked: false,
    };
    Pref.getVal(Pref.bearerToken, value => {
      const token = Helper.removeQuotes(value);
      this.setState({token: token});
    });
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backClick);
    //const { mode } = this.props;
    //this.setState({mode:mode});
    //////console.log(this.props.mode);
    Pref.getVal(Pref.EditModeEnabled, value => {
      ////console.log('editmode', value);
      if (value !== undefined && value !== '' && value !== null) {
        const {lol} = this.props;
        let ooo = 0;
        if (lol !== undefined && lol !== null) {
          const tu = Lodash.map(lol.extras, element => {
            if (element !== null && element !== undefined) {
              ooo += element.price;
            }
          });
          const valuex = Helper.removeQuotes(value) === '1' ? true : false;
          //console.log('lol', lol);
          selectedCirclePos = lol.selectedCirclePos;
          const circleTab = lol.circleTab;
          freeList = lol.freeList;
          finishedList = lol.finishedList;
          this.setState(
            {
              mode: valuex,
              orderMore: true,
              lessamtss: ooo,
              lol: lol,
              cartExArray: lol.extras,
              message: lol.message,
              totalAmount: lol.price,
              servicemode: lol.serviceMode,
              circleTab: circleTab,
              showCircleExtraData: lol.showCircleExtraData,
              extraImageItemList: lol.extraImageItemList,
              extraImageItemList1: lol.extraImageItemList1,
              extraImageItemList2: lol.extraImageItemList2,
              extraImageItemList3: lol.extraImageItemList3,
              extraImageItemList4: lol.extraImageItemList4,
              extraImageItemList5: lol.extraImageItemList5,
              extraImageItemList6: lol.extraImageItemList6,
            },
            () => {
              this.onItemClicks(true, lol);
            },
          );
        }
      }
    });

    this.menuServicesSetup();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backClick);
  }

  componentDidUpdate(prevProp, nextState) {
    if (nextState.backClicked) {
      this.setState({
        clickedItemPos: nextState.clickedItemPos,
        backClicked: false,
        clickedPos: nextState.clickedPos,
      });
    }
  }

  menuServicesSetup = () => {
    if (this.props.tabNames !== null && this.props.tabNames.length > 0) {
      const list = [];
      Lodash.map(this.props.tabNames, (item, index) => {
        // const {data} = item;
        // const itemList = [];
        // Lodash.map(data, (eachTabData,i) =>{
        //   const Itemx = (
        //     <View>
        //       <AccordItem
        //         eachTabData={eachTabData}
        //         index={i}
        //         clickedItem={(itemx, i) =>
        //           this.menuItemClicked(item, itemx, i)
        //         }
        //         priceStyle={{
        //           color:
        //             eachTabData.available === 1 ? '#292929' : 'red',
        //           fontFamily: 'Rubik',
        //           fontSize: 16,
        //           fontWeight: '700',
        //           lineHeight: 20,
        //         }}
        //       />
        //       <View style={styles.listserviceItemDivider} />
        //     </View>
        //   );
        //   itemList.push(Itemx);
        // })

        //   const items = Lodash.map(itemList, ix => {
        //     return ix;
        //   });

        const dataparse = (
          <AccordationItem
            index={index}
            item={item}
            //itemList={items}
            size={this.props.tabNames.length}
            clickedItem={this.menuItemClicked}
            clickedItemPos={this.state.clickedItemPos}
            currentCategory={currentCat === item.cat ? currentCat : ''}
          />
        );
        list.push(dataparse);
      });
      this.setState({selectionData: list});
    }
  };

  backClick = () => {
    this.backk();
    return true;
  };

  backk() {
    this.props.backClicked();
    this.menuServicesSetup();
    if (
      this.state.visibility === 1 ||
      this.state.servicemode === 1 ||
      this.state.servicemode === 2
    ) {
      this.setState({
        backClicked: true,
        visibility: 66,
        mode: false,
        cartExArray: [],
        servicemode: 20,
        showCircleExtraSelection: false,
        circleTab: 1,
        circleExtras: [],
        circleProgressView: true,
        originalExtras: [],
        extraReset: false,
        showCircleExtraData: [],
        extraImageItemList: [],
        extraImageItemList1: [],
        extraImageItemList2: [],
        extraImageItemList3: [],
        extraImageItemList4: [],
        extraImageItemList5: [],
        extraImageItemList6: [],
        pizzaImageList: [],
      });
      return true;
    }
    Pref.setVal(Pref.EditModeEnabled, '0');
    NavigationActions.goBack();
  }

  finalorders(isOrderMore) {
    if (
      this.state.message.includes(':') ||
      this.state.message.includes('#') ||
      this.state.message.includes('^')
    ) {
      this.setState({
        alertTitle: i18n.t(k._29),
        alertContent: i18n.t(k._25),
        showAlert: true,
      });
    } else {
      const checkSelected = this.showalertmin();
      if (checkSelected) {
        //ignored
      } else {
        const itemTotal = this.state.totalAmount;
        console.log('amt', itemTotal);
        const totalx = itemTotal + this.state.cartTotalAmount;
        const counterInc = this.state.cartItemCounter + 1;

        const repeats = this.state.mainBaseCount;

        let day = Moment(this.props.checkerDate).format('YYYY/MM/DD HH:mm');

        const cartTime = Moment(Date.now()).format('YYYY/MM/DD HH:mm:ss.SSS');
        const guid = Helper.guid();
        //console.log(`guidguid`, guid)
        for (let index = 0; index < repeats; index++) {
          this.state.cartDetails.push({
            guid: guid,
            cartTime: cartTime,
            fkcustomero: this.props.customerdt.idcustomer,
            orderdate: day,
            idservice: this.state.serviceDetail.idservice,
            serviceid: this.state.serviceDetail.idservice,
            serviceName: this.state.serviceDetail.name,
            price: itemTotal,
            //quantity: this.state.mainBaseCount,
            quantity: 1,
            extras: this.state.cartExArray,
            isdelivery: false,
            status: 1,
            geolat: this.props.currentLat,
            geolng: this.props.currentLog,
            fkbrancho: this.state.serviceDetail.fkbranchS,
            paid: false,
            message: this.state.message,
            deliveryprice: this.props.deliveryPrice,
            Customertelephone: this.props.customerdt.phone,
            branchData: this.props.item,
            imageUrl: this.state.serviceDetail.imageUrl,
            serviceMode: this.state.serviceDetail.serviceMode,
            circleTab: this.state.circleTab,
            selectedCirclePos: selectedCirclePos,
            extraImageItemList: this.state.extraImageItemList,
            extraImageItemList1: this.state.extraImageItemList1,
            extraImageItemList2: this.state.extraImageItemList2,
            extraImageItemList3: this.state.extraImageItemList3,
            extraImageItemList4: this.state.extraImageItemList4,
            extraImageItemList5: this.state.extraImageItemList5,
            extraImageItemList6: this.state.extraImageItemList6,
            showCircleExtraData: this.state.showCircleExtraData,
            freeList: freeList,
            finishedList: finishedList,
          });
        }
        let tyy = this.state.cartDetails;
        Pref.getVal(Pref.cartItem, value => {
          if (value !== undefined && value !== null) {
            let cartData = JSON.parse(value);
            if (
              cartData === undefined ||
              cartData === null ||
              cartData === ''
            ) {
              let carxxx = [];
              Lodash.map(tyy, ele => {
                carxxx.push(ele);
              });
              Pref.setVal(Pref.cartItem, carxxx);
              this.props.orderInc();
              //////console.log('firstSave', carxxx);
            } else {
              if (this.state.mode) {
                const iit = Lodash.findLastIndex(cartData, {
                  cartTime: this.state.lol.cartTime,
                });
                //console.log("modexxx", tyy[0].cartTime, this.state.lol.cartTime, iit);
                if (iit !== -1) {
                  cartData[iit] = tyy[0];
                }
                //cartData.splice(iit, 1, tyy[0]);
                ////console.log('cartDatax', iit);
              } else {
                Lodash.map(tyy, ele => {
                  cartData.push(ele);
                });
                //////console.log('cartData', cartData);
              }
              Pref.setVal(Pref.cartItem, cartData);
              this.props.orderInc();
            }
          } else {
            Pref.setVal(Pref.cartItem, tyy);
            this.props.orderInc();
          }
        });
        this.setState({
          cartTotalAmount: totalx,
          totalAmount: 0,
          mainBaseAmount: 0,
          mainBaseCount: 1,
          cartExArray: [],
          cartDetails: [],
          visibility: 3,
          orderMore: false,
        });

        Pref.setVal(Pref.EditModeEnabled, '0');
        if (this.state.mode || !isOrderMore) {
          NavigationActions.navigate('FinalOrder');
        } else {
          if (this.state.servicemode === 0) {
            this.props.backClicked();
          }
        }
      }
    }
  }

  /**
   *
   * @param {on Each service click} val
   */
  onItemClicks(mode, val) {
    //this.props.isVis(true);
    const {currentNames, namexx, businessclosedornot, hasDelivery} = this.props;
    //console.log("product", val);
    if (businessclosedornot) {
      if (Number(currentNames) === Number(namexx) || Number(namexx) === 0) {
        if (hasDelivery === 0) {
          let kkk = [];
          let msg = '';
          if (mode) {
            kkk = this.state.cartExArray;
            msg = this.state.message;
          }

          this.setState(
            {
              message: mode ? msg : '',
              visibility: 1,
              cartExArray: mode ? kkk : [],
              mainBaseCount: !mode ? 1 : val.quantity,
              mainBaseAmount: 0,
              progressView: true,
              type: 'absolute',
              clickitem: val,
              servicemode: val.serviceMode,
            },
            () => {
              if (val.serviceMode === 1) {
                //http://djangoman123-001-site1.btempurl.com/api/GetImagesForPizza
                Helper.networkHelperToken(
                  Pref.PizzImageUrl,
                  Pref.methodGet,
                  this.state.token,
                  result => {
                    this.setState({
                      pizzaImageList: result,
                      //servicemode: 2,
                    });
                  },
                  error => {},
                );
              }
            },
          );

          //////console.log('cartExtra', this.state.cartExArray);
          this.fetchServiceDetail(mode, val);
        } else {
          this.setState({
            alertTitle: i18n.t(k._4),
            alertContent: `לקוחות יקרים, שימו לב:
בעקבות עומס בהזמנות אצל בית העסק - כרגע לא ניתן לבצע הזמנות חדשות.
נשמח שתנסו שוב בעוד כמה רגעים. 
סליחה ותודה.`,
            showAlert: true,
            flexChanged: true,
          });
        }
      } else if (Number(currentNames) !== Number(namexx)) {
        this.setState({
          alertTitle: i18n.t(k._29),
          alertContent: i18n.t(k._72),
          showAlert: true,
        });
      }
    } else {
      this.setState({
        alertTitle: i18n.t(k._30),
        alertContent: i18n.t(k._28),
        showAlert: true,
      });
    }
  }

  /**
   * Fetch service
   */
  fetchServiceDetail(mode, val) {
    //const { state } = this.props.navigation;
    //state.params.serviceid
    Helper.networkHelperToken(
      Pref.ServiceUrl + val.idservice,
      Pref.methodGet,
      this.state.token,
      result => {
        //console.log("servicesResult", result);
        //console.log('serviceCat', JSON.stringify(result["extras"]));
        const parseService = result['service'];
        const parseExtra = result['extras'];
        const untouchedEx = JSON.parse(JSON.stringify(parseExtra));
        let issextrass = Lodash.map(parseExtra, (el, index) => {
          el.isselectedex = false;
          el.priceChanged = false;
          if (mode) {
            const tuext = Lodash.findIndex(this.state.cartExArray, {
              id: el.id,
            });
            el.isselectedex = tuext !== -1;
          }
          return el;
        });
        let groupedExtra = Lodash.groupBy(issextrass, function(exData) {
          return exData.category_name;
        });
        const serviceCat = Object.keys(groupedExtra).map(key => ({
          title: key,
          data: groupedExtra[key],
          minselect: mode ? 0 : groupedExtra[key][0].minimumSelect || 0,
          counter: 0,
        }));

        let op = !mode ? parseService.price : val.price;
        let opp = !mode ? parseService.price : val.price - this.state.lessamtss;

        let extraFilteredData = [];
        //filter dough, sessam etc...
        const gotDatas = Lodash.map(serviceCat, item => {
          let data = item.data;
          const filterData = Lodash.filter(data, ele => ele.catType === 7);
          if (filterData.length > 0) {
            item.data = filterData;
            return item;
          }
        });
        if (gotDatas.length > 0) {
          //remove undefined...
          const filterExtras = Lodash.filter(
            gotDatas,
            item => item !== undefined,
          );
          if (filterExtras.length > 0) {
            extraFilteredData = filterExtras;
          } else {
            extraFilteredData = serviceCat;
          }
        } else {
          extraFilteredData = serviceCat;
        }
        //console.log(`extraFilteredData`, extraFilteredData);
        this.setState({
          progressView: false,
          untouchedExtras: untouchedEx,
          //servicemode: parseService.serviceMode,
          //multiArr: removeNoReqData,
          //serviceCat: serviceCat,
          serviceCat: extraFilteredData,
          originalExtras: serviceCat,
          serviceDetail: parseService,
          serviceExtra: groupedExtra,
          mainBaseAmount: opp,
          totalAmount: op,
        });
        //alert(JSON.stringify(this.state.serviceExtra));
      },
      error => {
        this.setState({progressView: false});
      },
    );
  }

  /**
   * if multipliable === 0, then select only one
   * if multipliable === 1, then select any number of extra
   *  if multipliable > 1, then select extra exactly from cat
   */
  chipClick = (serviceExtrax, index, sectiontitle, secindex) => {
    const cloneExtrass = JSON.parse(JSON.stringify(serviceExtrax));
    const freeListItem = JSON.parse(JSON.stringify(serviceExtrax));
    const pushObject = JSON.parse(
      JSON.stringify({
        catType: serviceExtrax.catType,
        id: serviceExtrax.id,
        category: serviceExtrax.category_name,
        name: serviceExtrax.name,
        price: serviceExtrax.price,
        imageNum: serviceExtrax.imageNum,
      }),
    );
    let singless = false;
    let total = 0;
    const kkk = Lodash.findIndex(this.state.cartExArray, {
      id: serviceExtrax.id,
    });
    if (kkk !== -1) {
      this.state.cartExArray.splice(kkk, 1);
      total = this.state.totalAmount - freeListItem.price;
      if (
        cloneExtrass.finished !== undefined &&
        cloneExtrass.finished === true
      ) {
        finishedList.push(cloneExtrass);
      }
      if (serviceExtrax.isFree === 1) {
        const kkuu = Lodash.findIndex(freeList, {
          id: serviceExtrax.id,
        });
        if (kkuu !== -1) {
          freeList.splice(kkuu, 1);
        }
      }
    } else {
      total = this.state.totalAmount + freeListItem.price;
      const isfind = Lodash.findIndex(this.state.cartExArray, {
        category: serviceExtrax.category_name,
      });
      if (serviceExtrax.multipliable === 0) {
        if (isfind === -1) {
          this.state.cartExArray.push(pushObject);
          if (serviceExtrax.isFree === 1) {
            const checkexistence = Lodash.find(
              freeList,
              k => k.name === serviceExtrax.name,
            );
            if (checkexistence === undefined) {
              freeList.push(pushObject);
            }
          }
        } else {
          singless = true;
        }
      } else {
        if (serviceExtrax.multipliable > 1) {
          const countExtra = Lodash.filter(this.state.cartExArray, {
            category: serviceExtrax.category_name,
          }).length;
          if (countExtra === serviceExtrax.multipliable) {
            this.setState({
              alertTitle: i18n.t(k._30),
              alertContent: `יש לבחור עד ${Number(serviceExtrax.multipliable)}`,
              showAlert: true,
            });
            return false;
          }
        }
        this.state.cartExArray.push(pushObject);
        if (serviceExtrax.isFree === 1) {
          const checkexistence = Lodash.find(
            freeList,
            k => k.name === serviceExtrax.name,
          );
          if (checkexistence === undefined) {
            freeList.push(pushObject);
          }
        }
      }
    }
    if (singless) {
      //console.log(`singless`, singless);
      const isfindxx = Lodash.findLastIndex(this.state.cartExArray, {
        category: serviceExtrax.category_name,
      });
      //console.log(`isfind`, isfindxx);
      if (isfindxx !== -1) {
        const find = Lodash.find(this.state.cartExArray, {
          category: serviceExtrax.category_name,
        });
        //console.log(`find`, find);
        let totalx = total;
        total = totalx - find.price;

        this.state.cartExArray.splice(isfindxx, 1);
        this.state.cartExArray.push(pushObject);
        //console.log(this.state.cartExArray);
      }
      // this.setState({
      //   alertTitle: i18n.t(k._30),
      //   alertContent: i18n.t(k._73),
      //   showAlert: true,
      // });
    }
    //else {
    //console.log(`old`, total);
    const {serviceMode} = this.state.serviceDetail;
    //console.log(serviceMode)
    const untouched = JSON.parse(JSON.stringify(this.state.originalExtras));
    //console.log('untouched', untouched)
    const catcat = this.state.serviceCat;
    //this.getActiveExtrasList();
    const findcatindex = Lodash.findIndex(catcat, {
      title: serviceExtrax.category_name,
    });
    const findcatindexuntouched = Lodash.findIndex(untouched, {
      title: cloneExtrass.category_name,
    });

    const {data} = catcat[findcatindex];
    const ogmin = untouched[findcatindexuntouched].minselect;
    //console.log("ogmin", ogmin);
    let minselect = catcat[findcatindex].minselect;
    let counter = catcat[findcatindex].counter;
    //console.log("minselect", minselect, cloneExtrass.isselectedex);
    const hh = data[index];
    if (serviceMode === 0 || serviceMode === 1) {
      //selected chip
      if (!cloneExtrass.isselectedex) {
        if (minselect > 0) {
          minselect -= 1;
        }
        counter += 1;
      } else {
        if (ogmin > 0) {
          if (counter <= ogmin) {
            minselect += 1;
          }
        }
        counter -= 1;
      }
    }
    //console.log("minselectchanged", minselect, counter);
    const {isselectedex} = hh;
    hh.isselectedex = !isselectedex;
    data[index] = hh;
    catcat[findcatindex].minselect = minselect;
    catcat[findcatindex].counter = counter;
    //catcat.data = data;
    //console.log(`total`, total);
    //console.log(`freeList`, freeList);
    //console.log(`catcat`, catcat)
    this.setState({
      totalAmount: total,
      serviceCat: catcat,
    });
    //}
  };

  /**
   * return active extralist based on servicemode
   */
  getActiveExtrasList() {
    return this.state.servicemode === 2
      ? this.state.circleExtras
      : this.state.serviceCat;
  }

  /**
   *
   */
  checkMinSelectedExtras() {
    const catcatx = this.state.serviceCat;
    const filter = Lodash.filter(catcatx, item => {
      const data = item.data;
      const firstPos = data[0];
      if (firstPos.catType === selectedCirclePos) {
        return item.minselect > 0;
      }
    });
    return filter.length > 0 ? filter : [];
  }

  /**
   * show alert of minimum less
   */
  showalertmin() {
    const checkSelected = this.checkMinSelectedExtras();
    if (checkSelected.length > 0) {
      const firstPos = checkSelected[0];
      const {title, minselect} = firstPos;
      this.setState({
        showAlert: true,
        alertContent: `${title}:\n${minselect} נא לבחור לפחות עוד`,
        flexChanged: false,
      });
      return true;
    } else {
      return false;
    }
  }

  /**
   * selected chip color
   */
  selectedColors = serviceExtrax => {
    const values = Lodash.findIndex(this.state.cartExArray, {
      id: serviceExtrax.id,
    });

    if (values !== -1) {
      return '#3DACCF';
    } else {
      return 'transparent';
    }
  };

  /**
   * isSelected chip
   */
  isSelected = serviceExtrax => {
    const values = Lodash.find(this.state.cartExArray, {
      id: serviceExtrax.id,
    });
    if (values !== undefined) {
      return true;
    } else {
      return false;
    }
  };

  /**
   *
   * @param {*} serviceExtra
   */
  renderExcatItemRow(serviceExtrax, index, sectiontitle, secindex) {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (serviceExtrax.extraAvailable === 1) {
            this.chipClick(serviceExtrax, index, sectiontitle, secindex);
          }
        }}>
        <View
          //selected={false}
          //selectedColor={serviceExtrax.isselectedex ? '#3daccf' : 'transparent'}
          //mode={"outlined"}
          style={{
            marginTop: 4,
            marginEnd: 4,
            borderColor: '#dedede',
            borderWidth: 0.5,
            borderTopRightRadius: 16,
            borderTopLeftRadius: 16,
            borderTopStartRadius: 16,
            borderTopEndRadius: 16,
            borderBottomRightRadius: 16,
            borderBottomLeftRadius: 16,
            borderBottomStartRadius: 16,
            borderBottomEndRadius: 16,
            alignContent: 'center',
            justifyContent: 'center',
            paddingVertical: 3,
            paddingHorizontal: 8,
            marginHorizontal: 5,
            marginVertical: 3,
            backgroundColor:
              serviceExtrax.extraAvailable === 1
                ? this.isSelected(serviceExtrax)
                  ? '#3daccf'
                  : 'transparent'
                : '#dedede',
          }}>
          <Subtitle
            styleName={
              serviceExtrax.extraAvailable === 1
                ? ''
                : i18n.t(k.LINE_THROUGH)
            }
            style={{
              color: this.isSelected(serviceExtrax) ? 'white' : '#292929',
              fontFamily: 'Rubik',
              fontSize: 14,
              alignSelf: 'flex-start',
              fontWeight: '700',
            }}>
            {`${i18n.t(k._64)}${serviceExtrax.price}${i18n.t(k._65)}`}{' '}
            <Subtitle
              styleName={
                serviceExtrax.extraAvailable === 1
                  ? ''
                  : i18n.t(k.LINE_THROUGH)
              }
              style={{
                color: this.isSelected(serviceExtrax) ? 'white' : '#292929',
                fontFamily: 'Rubik',
                fontSize: 14,
                alignSelf: 'flex-start',
                fontWeight: '400',
              }}
              styleName="wrap">
              {`${Lodash.capitalize(serviceExtrax.name)}`}{' '}
            </Subtitle>
          </Subtitle>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  /**
   *
   */
  renderExcatDItemRow(dExtra, index) {
    return (
      <Card
        elevation={1}
        style={{
          marginStart: 4,
          marginEnd: 4,
          marginTop: 4,
          marginBottom: 4,
        }}>
        <Card.Content>
          <View styleName="horizontal">
            <Title
              styleName="bold"
              style={{
                color: Colors.orange500,
              }}>
              {Lodash.capitalize(dExtra.name)}
            </Title>
            <Subtitle
              styleName="bold"
              style={{
                alignSelf: 'center',
                padding: 2,
                marginStart: 16,
              }}>
              {dExtra.price}
              {i18n.t(k._66)}
            </Subtitle>
          </View>
        </Card.Content>
        <Card.Content>
          <View styleName="horizontal sm-gutter">
            <TouchableOpacity
              onPress={() => {
                let clones = this.state.multiArrItems;
                const data = clones[index].counter + 1;
                const moreAmt = this.state.cartTotalAmount + dExtra.price;
                clones.splice(index, 1, {
                  counter: data,
                });
                const ind = Lodash.findIndex(this.state.cartDetails, {
                  id: dExtra.id,
                });

                if (ind != -1) {
                  this.state.cartDetails.splice(ind, 1, {
                    quantity: data,
                    id: dExtra.id,
                    category_name: dExtra.category_name,
                    name: dExtra.name,
                    price: dExtra.price,
                  });
                } else {
                  this.state.cartDetails.push({
                    quantity: data,
                    id: dExtra.id,
                    category_name: dExtra.category_name,
                    name: dExtra.name,
                    price: dExtra.price,
                  });
                }
                this.setState({
                  cartTotalAmount: moreAmt,
                  multiArrItems: [...this.state.multiArrItems, ...clones],
                  scrollHide: false,
                });
              }}>
              <View
                style={{
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: '#d6d7da',
                }}>
                <Icon
                  name="add"
                  size={24}
                  color="black"
                  style={{
                    padding: 2,
                    alignSelf: 'center',
                    backgroundColor: 'transparent',
                  }}
                />
              </View>
            </TouchableOpacity>
            <Subtitle
              style={{
                marginEnd: 8,
                marginStart: 8,
                alignSelf: 'center',
                fontSize: 20,
              }}>
              {this.state.multiArrItems[index].counter}
            </Subtitle>
            <TouchableOpacity
              onPress={() => {
                let clones = this.state.multiArrItems;
                if (clones[index].counter > 0) {
                  const data = clones[index].counter - 1;
                  const lessAmt = this.state.cartTotalAmount - dExtra.price;
                  clones.splice(index, 1, {
                    counter: data,
                  });
                  const ind = Lodash.findIndex(this.state.cartDetails, {
                    id: dExtra.id,
                  });

                  if (ind !== -1) {
                    if (clones[index].counter > 0) {
                      this.state.cartDetails.splice(ind, 1, {
                        quantity: data,
                        id: dExtra.id,
                        category_name: dExtra.category_name,
                        name: dExtra.name,
                        price: dExtra.price,
                      });
                    } else {
                      this.state.cartDetails.splice(ind, 1);
                    }
                  }
                  this.setState({
                    cartTotalAmount: lessAmt,
                    multiArrItems: [...this.state.multiArrItems, ...clones],
                    scrollHide: false,
                  });
                }
              }}>
              <View
                style={{
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: '#d6d7da',
                }}>
                <Icon
                  name="remove"
                  size={24}
                  color="black"
                  style={{
                    padding: 2,
                    alignSelf: 'center',
                    backgroundColor: 'transparent',
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  }

  renderCircleSelectedData(item, index) {
    return (
      <View
        style={{
          marginTop: 8,
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}>
        {item.number != 0 ? (
          <Title
            styleName="wrap"
            style={{
              marginHorizontal: 1,
              fontSize: 13,
              fontFamily: 'Rubik',
              fontWeight: '700',
              flexWrap: 'wrap',
            }}>{` -${item.number}`}</Title>
        ) : null}
        <Title
          styleName="wrap"
          style={{
            marginHorizontal: 1,
            fontSize: 13,
            fontFamily: 'Rubik',
            fontWeight: '400',
            flexWrap: 'wrap',
            flex: 1,
            writingDirection: 'ltr',
          }}>{`${item.name}`}</Title>
      </View>
    );
  }

  circleTabClick(tabno) {
    if (this.state.circleTab === tabno) {
      return false;
    }
    if (tabno === 2) {
      prevCircleTab = 1;
    } else if (tabno === 3) {
      prevCircleTab = 2;
    } else {
      prevCircleTab = 0;
    }

    const currentTab = this.state.circleTab;
    //console.log(`tabno`, currentTab, prevCircleTab, tabno);

    const {cartExArray} = this.state;
    const check1 = currentTab === 3 && prevCircleTab === 0;
    const check2 = currentTab === 3 && prevCircleTab === 1;
    const check3 = currentTab === 2 && prevCircleTab === 0;
    const check4 = currentTab === 2 && prevCircleTab === 2;

    if (check1 || check2 || check3) {
      let filterFull = this.returnCircleBasedData();
      if (filterFull.length === 0) {
        this.setState({circleTab: tabno});
      } else {
        Alert.alert(
          ``,
          `${i18n.t(k.resetExtrasMsg)}`,
          [
            {
              text: `${i18n.t(k.NO)}`,
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: `${i18n.t(k.YES)}`,
              onPress: () => {
                const result = Lodash.filter(this.state.cartExArray, ele => {
                  return !Lodash.find(
                    filterFull,
                    element => element.catType === ele.catType,
                  );
                });
                // const result = Lodash.filter(this.state.cartExArray, ele => {
                //   return (
                //     ele.catType !== 0 ||
                //     ele.catType !== 1 ||
                //     ele.catType !== 2 ||
                //     ele.catType !== 3 ||
                //     ele.catType !== 4 ||
                //     ele.catType !== 5 ||
                //     ele.catType !== 6
                //   );
                // });
                //console.log(`result`, result)
                const og = JSON.parse(
                  JSON.stringify(this.state.originalExtras),
                );
                freeList = [];
                const servicePrice = this.state.tillDoughPrice;
                //console.log(`servicePrice`, servicePrice)
                this.setState({
                  extraImageItemList: [],
                  extraImageItemList1: [],
                  extraImageItemList2: [],
                  extraImageItemList3: [],
                  extraImageItemList4: [],
                  extraImageItemList5: [],
                  extraImageItemList6: [],
                  serviceCat: og,
                  circleTab: tabno,
                  cartExArray: result,
                  circleExtras: [],
                  extraReset: true,
                  showCircleExtraData: [],
                  totalAmount: servicePrice,
                });
              },
            },
          ],
          {
            cancelable: false,
          },
        );
      }
      return false;
    }

    if (prevCircleTab === 1 && tabno === 2) {
      if (cartExArray.length > 0) {
        let filterFull = [];
        const serviceCatName = JSON.parse(
          JSON.stringify(this.state.untouchedExtras),
        );
        Lodash.map(cartExArray, item => {
          const {catType} = item;
          let element = JSON.parse(JSON.stringify(item));
          let element1 = JSON.parse(JSON.stringify(item));
          if (catType === 0) {
            const findcatName = Lodash.find(
              serviceCatName,
              findname => findname.catType === 1,
            );
            element.catType = 1;
            element.category = findcatName.category_name;
            const findcatName1 = Lodash.find(
              serviceCatName,
              findname => findname.catType === 2,
            );
            element1.catType = 2;
            element1.category = findcatName1.category_name;
            filterFull.push(element);
            filterFull.push(element1);
          } else {
            filterFull.push(element);
          }
        });
        const {extraImageItemList} = this.state;
        const extraImageItemList1 = [];
        const extraImageItemList2 = [];
        for (let index = 0; index < extraImageItemList.length; index++) {
          const element = extraImageItemList[index];
          if (index < 8) {
            extraImageItemList1.push(element);
          } else {
            extraImageItemList2.push(element);
          }
        }
        console.log(`filterFull`, filterFull);
        this.setState({
          cartExArray: filterFull,
          extraImageItemList: [],
          extraImageItemList1: extraImageItemList1,
          extraImageItemList2: extraImageItemList2,
        });
      }
    } else if (prevCircleTab === 2 && currentTab === 2) {
      if (cartExArray.length > 0) {
        const serviceCatName = JSON.parse(
          JSON.stringify(this.state.untouchedExtras),
        );
        let filterFull = [];
        Lodash.map(cartExArray, item => {
          const {catType} = item;
          let element = JSON.parse(JSON.stringify(item));
          let element1 = JSON.parse(JSON.stringify(item));
          if (catType === 1 || catType === 2) {
            //element.catType = item.catType === 2 ? 5 : 3;
            //element1.catType = item.catType === 2 ? 6 : 4;
            const findcatName = Lodash.find(serviceCatName, findname =>
              item.catType === 1
                ? findname.catType === 3
                : findname.catType === 6,
            );
            element.catType = item.catType === 1 ? 3 : 6;
            element.category = findcatName.category_name;
            const findcatName1 = Lodash.find(serviceCatName, findname =>
              item.catType === 2
                ? findname.catType === 5
                : findname.catType === 4,
            );
            element1.catType = item.catType === 2 ? 5 : 4;
            element1.category = findcatName1.category_name;
            filterFull.push(element);
            filterFull.push(element1);
          } else {
            filterFull.push(element);
          }
        });
        const {extraImageItemList1, extraImageItemList2} = this.state;
        const extraImageItemList3 = [];
        const extraImageItemList4 = [];
        const extraImageItemList5 = [];
        const extraImageItemList6 = [];
        for (let index = 0; index < extraImageItemList1.length; index++) {
          const element = extraImageItemList1[index];
          if (index < 4) {
            extraImageItemList3.push(element);
          } else {
            extraImageItemList4.push(element);
          }
        }
        for (let index = 0; index < extraImageItemList2.length; index++) {
          const element = extraImageItemList2[index];
          if (index < 4) {
            extraImageItemList5.push(element);
          } else {
            extraImageItemList6.push(element);
          }
        }
        console.log(`filterFullconv`, filterFull);
        this.setState({
          cartExArray: filterFull,
          extraImageItemList1: [],
          extraImageItemList2: [],
          extraImageItemList3: extraImageItemList3,
          extraImageItemList4: extraImageItemList4,
          extraImageItemList5: extraImageItemList5,
          extraImageItemList6: extraImageItemList6,
        });
      }
    } else if (prevCircleTab === 2 && tabno === 3) {
      if (cartExArray.length > 0) {
        let filterFull = [];
        Lodash.map(cartExArray, item => {
          const {catType} = item;
          let element = JSON.parse(JSON.stringify(item));
          let element1 = JSON.parse(JSON.stringify(item));
          let element2 = JSON.parse(JSON.stringify(item));
          let element3 = JSON.parse(JSON.stringify(item));
          if (catType === 0) {
            element.catType = 3;
            element1.catType = 4;
            element2.catType = 5;
            element3.catType = 6;
            filterFull.push(element);
            filterFull.push(element1);
            filterFull.push(element2);
            filterFull.push(element3);
          } else {
            filterFull.push(element);
          }
        });
        this.setState({cartExArray: filterFull});
      }
    }
    this.setState({circleTab: tabno}, () => {
      let showExtraData = this.returncircletext(this.state.circleTab);
      this.setState({
        showCircleExtraData: showExtraData,
      });
    });
    //console.log(`cartExArray`, this.state.cartExArray);
  }

  hideAlert() {
    this.setState({
      showAlert: false,
      flexChanged: false,
    });
  }

  eachCirclePartClick(value) {
    selectedCirclePos = value;
    this.filterExtraServiceCircle();
    console.log(`,totalAmount`, this.state.totalAmount);
  }

  renderdesignCircle() {
    return (
      <View
        style={{
          // flex: 0.49,
          backgroundColor: 'white',
          flexDirection: 'column',
          marginTop: 10,
          justifyContent: 'center',
        }}>
        <View
          style={{
            backgroundColor: 'white',
            flex: 0.2,
            alignItems: 'center',
            alignContent: 'center',
          }}>
          <View
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              borderRadius: 2,
              borderColor: '#dedede',
              borderStyle: 'solid',
              borderWidth: 1,
              backgroundColor: '#ffffff',
              marginHorizontal: sizeWidth(6),
              height: sizeHeight(6),
              flexWrap: 'wrap',
            }}>
            <TouchableWithoutFeedback onPress={() => this.circleTabClick(1)}>
              <View
                style={{
                  flex: 0.5,
                  flexDirection: 'row',
                  height: '100%',
                  backgroundColor:
                    this.state.circleTab === 1 ? '#3DACCF' : 'white',
                  alignSelf: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}>
                <Title
                  styleName="bold"
                  style={{
                    color: this.state.circleTab === 1 ? 'white' : '#777777',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    alignSelf: 'center',
                    fontWeight: '400',
                    justifyContent: 'center',
                  }}>
                  {`${i18n.t(k.full)}`}
                </Title>
              </View>
            </TouchableWithoutFeedback>
            <View
              style={{
                width: 1,
                borderColor: '#dedede',
                borderStyle: 'solid',
                borderRightWidth: 1,
                alignSelf: 'center',
                height: '100%',
              }}
            />

            <TouchableWithoutFeedback onPress={() => this.circleTabClick(2)}>
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
                    this.state.circleTab === 2 ? '#3DACCF' : 'white',
                }}>
                <Title
                  styleName="bold h-center v-center center"
                  style={{
                    color: this.state.circleTab === 2 ? 'white' : '#777777',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    fontWeight: '400',
                  }}>
                  {`${i18n.t(k.halves)}`}
                </Title>
              </View>
            </TouchableWithoutFeedback>
            <View
              style={{
                width: 1,
                borderColor: '#dedede',
                borderStyle: 'solid',
                borderRightWidth: 1,
                alignSelf: 'center',
                height: '100%',
              }}
            />

            <TouchableWithoutFeedback onPress={() => this.circleTabClick(3)}>
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
                    this.state.circleTab === 3 ? '#3DACCF' : 'white',
                }}>
                <Title
                  styleName="bold h-center v-center center"
                  style={{
                    color: this.state.circleTab === 3 ? 'white' : '#777777',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    fontWeight: '400',
                  }}>
                  {`${i18n.t(k.quarter)}`}
                </Title>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View
          styleName="v-center h-center"
          style={{
            backgroundColor: 'white',
            flex: 0.8,
            marginTop: 12,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
          }}>
          {this.state.circleTab === 1 ? (
            <View styleName="vertical">
              <View
                styleName="horizontal v-center h-center"
                style={{
                  borderRadius: circleRadius,
                  width: circleWidth,
                  height: circleHeight,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}>
                <ImageBackground
                  styleName="fill-parent"
                  source={{
                    uri: `${Pref.BASEURL}${
                      this.state.pizzaImageList.pizzafull
                    }`,
                  }}
                  style={{
                    borderRadius: circleRadius,
                    width: circleWidth,
                    height: circleHeight,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    //borderColor: "black",
                    //borderWidth: 0.5,
                    backgroundColor: 'transparent',
                  }}>
                  <TouchableWithoutFeedback
                    onPress={() => this.eachCirclePartClick(0)}>
                    <View>
                      <View
                        styleName="v-center h-center"
                        style={{
                          borderRadius: circleRadius,
                          width: circleWidth,
                          height: circleHeight,
                          //backgroundColor: this.returnCircleSelecionColor(0),
                          alignSelf: 'center',
                          justifyContent: 'center',
                          //borderColor: "black",
                          //borderWidth: 0.5,
                        }}
                      />

                      {this.state.extraImageItemList.length > 0 ? (
                        <View
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            flex: 1,
                            flexDirection: 'row',
                          }}>
                          <View
                            styleName="vertical"
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              flex: 0.5,
                              //backgroundColor: 'red'
                            }}>
                            <View style={{flex: 0.3}} />
                            <View
                              style={{
                                flex: 0.2,
                                marginStart: sizeWidth(2),
                                justifyContent: 'flex-end',
                              }}>
                              <View
                                styleName="fill-parent"
                                style={{
                                  alignContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  flex: 1,
                                }}>
                                <View
                                  style={{
                                    flex: 0.2,
                                  }}
                                />
                                <View
                                  style={{
                                    flex: 0.6,
                                    marginEnd: sizeWidth(2.5),
                                    justifyContent: 'space-between',
                                    //backgroundColor:'red',
                                  }}>
                                  <Animated.Image
                                    style={{
                                      //backgroundColor: "blue",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                      transform: [
                                        {
                                          rotate: '45deg',
                                        },
                                      ],
                                      marginStart: 20,
                                      marginBottom: 6,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[0]
                                      }`,
                                    }}
                                  />
                                  <Image
                                    style={{
                                      //backgroundColor: 'orange',
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                      marginTop: 4,
                                      marginStart: 18,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[1]
                                      }`,
                                    }}
                                  />
                                  <Image
                                    style={{
                                      //backgroundColor: 'black',
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                      marginTop: 4,
                                      marginStart: 18,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[2]
                                      }`,
                                    }}
                                  />
                                  <Animated.Image
                                    style={{
                                      //backgroundColor: "grey",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                      transform: [
                                        {
                                          rotate: '45deg',
                                        },
                                      ],
                                      marginStart: 20,
                                      marginBottom: 6,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[3]
                                      }`,
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    flex: 0.2,
                                  }}
                                />
                              </View>
                            </View>
                            <View
                              style={{
                                flex: 0.4,
                                marginEnd: 8,
                              }}>
                              <View
                                styleName="fill-parent"
                                style={{
                                  marginTop: sizeHeight(3),
                                  marginStart: 16,
                                  alignContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  flex: 1,
                                }}>
                                <View
                                  style={{
                                    flex: 0.1,
                                  }}
                                />
                                <View
                                  style={{
                                    flex: 0.7,
                                    justifyContent: 'space-between',
                                  }}>
                                  <Image
                                    style={{
                                      //backgroundColor: "orange",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[4]
                                      }`,
                                    }}
                                  />
                                  <View
                                    style={{
                                      marginVertical: 4,
                                    }}>
                                    <Image
                                      style={{
                                        //backgroundColor: "green",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        marginVertical: 8,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList[5]
                                        }`,
                                      }}
                                    />
                                    <Image
                                      style={{
                                        //backgroundColor: "yellow",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        marginVertical: 8,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList[6]
                                        }`,
                                      }}
                                    />
                                  </View>
                                  <Image
                                    style={{
                                      //backgroundColor: "grey",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[7]
                                      }`,
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    flex: 0.1,
                                  }}
                                />
                              </View>
                            </View>
                          </View>

                          <View
                            styleName="vertical"
                            style={{
                              flexDirection: 'row-reverse',
                              justifyContent: 'space-between',
                              flex: 0.5,
                            }}>
                            <View style={{flex: 0.3}} />
                            <View
                              style={{
                                flex: 0.2,
                                marginStart: sizeWidth(1),
                                justifyContent: 'flex-start',
                              }}>
                              <View
                                styleName="fill-parent"
                                style={{
                                  alignContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  flex: 1,
                                  //backgroundColor: 'red'
                                }}>
                                <View
                                  style={{
                                    flex: 0.2,
                                  }}
                                />
                                <View
                                  style={{
                                    flex: 0.6,
                                    marginStart: sizeWidth(2.5),
                                    justifyContent: 'space-between',
                                  }}>
                                  <Animated.Image
                                    style={{
                                      //backgroundColor: "blue",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                      transform: [
                                        {
                                          rotate: '-30deg',
                                        },
                                      ],
                                      marginEnd: 34,
                                      marginBottom: 6,
                                      marginTop: 4,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[8]
                                      }`,
                                    }}
                                  />
                                  <Image
                                    style={{
                                      //backgroundColor: "orange",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                      marginTop: 4,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[9]
                                      }`,
                                    }}
                                  />
                                  <Image
                                    style={{
                                      //backgroundColor: "black",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                      marginTop: 4,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[10]
                                      }`,
                                    }}
                                  />
                                  <Animated.Image
                                    style={{
                                      //backgroundColor: "grey",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                      transform: [
                                        {
                                          rotate: '90deg',
                                        },
                                      ],
                                      marginEnd: 20,
                                      marginTop: 6,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[11]
                                      }`,
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    flex: 0.2,
                                  }}
                                />
                              </View>
                            </View>
                            <View
                              style={{
                                flex: 0.4,
                                marginEnd: 8,
                              }}>
                              <View
                                styleName="fill-parent"
                                style={{
                                  marginTop: sizeHeight(3),
                                  marginStart: 4,
                                  alignContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  flex: 1,
                                }}>
                                <View
                                  style={{
                                    flex: 0.1,
                                  }}
                                />
                                <View
                                  style={{
                                    flex: 0.7,
                                    justifyContent: 'space-between',
                                  }}>
                                  <Image
                                    style={{
                                      //backgroundColor: "orange",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[12]
                                      }`,
                                    }}
                                  />
                                  <View
                                    style={{
                                      marginVertical: 4,
                                    }}>
                                    <Image
                                      style={{
                                        //backgroundColor: "green",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        marginVertical: 8,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList[13]
                                        }`,
                                      }}
                                    />
                                    <Image
                                      style={{
                                        //backgroundColor: "yellow",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        marginVertical: 8,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList[14]
                                        }`,
                                      }}
                                    />
                                  </View>
                                  <Image
                                    style={{
                                      //backgroundColor: "grey",
                                      width: extraItemWidth,
                                      resizeMode: 'contain',
                                      height: extraItemHeight,
                                    }}
                                    source={{
                                      uri: `${
                                        this.state.extraImageItemList[15]
                                      }`,
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    flex: 0.1,
                                  }}
                                />
                              </View>
                            </View>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  </TouchableWithoutFeedback>
                </ImageBackground>
              </View>
            </View>
          ) : this.state.circleTab === 2 ? (
            <View styleName="vertical">
              <View styleName="horizontal v-center h-center">
                <Subtitle
                  style={{
                    marginEnd: 16,
                    fontSize: 16,
                    fontFamily: 'Rubik',
                    fontWeight: '400',
                  }}>{`2`}</Subtitle>
                <View
                  styleName="v-center h-center"
                  style={{
                    borderRadius: circleRadius,
                    width: circleWidth,
                    height: circleHeight,
                    backgroundColor: 'white',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                  }}>
                  <ImageBackground
                    styleName="fill-parent"
                    source={{
                      uri: `${Pref.BASEURL}${
                        this.state.pizzaImageList.pizzahalves2
                      }`,
                      resizeMode: 'contain',
                    }}
                    style={{
                      borderRadius: circleRadius,
                      width: circleWidth,
                      height: circleHeight,
                      backgroundColor: 'white',
                      alignSelf: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <>
                      <TouchableWithoutFeedback
                        onPress={() => this.eachCirclePartClick(2)}>
                        <View>
                          <View
                            styleName="v-center h-center"
                            style={{
                              borderTopRightRadius: querterWidth,
                              borderBottomRightRadius: querterWidth,
                              borderTopEndRadius: 0,
                              borderBottomEndRadius: 0,
                              borderRadius: circleRadius,
                              //backgroundColor: this.returnCircleSelecionColor(1),
                              width: circleRadius,
                              height: circleHeight,
                              //borderEndColor: "black",
                              //borderWidth: 0.5,
                            }}
                          />
                          {this.state.extraImageItemList2.length > 0 ? (
                            <View
                              styleName="vertical"
                              style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                flex: 1,
                              }}>
                              <View
                                style={{
                                  flex: 0.4,
                                  marginStart: 8,
                                }}>
                                <View
                                  styleName="fill-parent"
                                  style={{
                                    marginStart: 20,
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    flex: 1,
                                  }}>
                                  <View
                                    style={{
                                      flex: 0.2,
                                    }}
                                  />
                                  <View
                                    style={{
                                      flex: 0.6,
                                      justifyContent: 'space-between',
                                    }}>
                                    <Animated.Image
                                      style={{
                                        //backgroundColor: "blue",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        transform: [
                                          {
                                            rotate: '30deg',
                                          },
                                        ],
                                        marginStart: 38,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList2[0]
                                        }`,
                                      }}
                                    />
                                    <Image
                                      style={{
                                        //backgroundColor: "orange",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        marginStart: 30,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList2[1]
                                        }`,
                                      }}
                                    />
                                    <Image
                                      style={{
                                        //backgroundColor: "black",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        marginStart: 30,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList2[2]
                                        }`,
                                      }}
                                    />
                                    <Animated.Image
                                      style={{
                                        //backgroundColor: "grey",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        transform: [
                                          {
                                            rotate: '-30deg',
                                          },
                                        ],
                                        marginStart: 38,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList2[3]
                                        }`,
                                      }}
                                    />
                                  </View>
                                  <View
                                    style={{
                                      flex: 0.2,
                                    }}
                                  />
                                </View>
                              </View>
                              <View
                                style={{
                                  flex: 0.1,
                                }}
                              />
                              <View
                                style={{
                                  flex: 0.4,
                                  marginEnd: 8,
                                }}>
                                <View
                                  styleName="fill-parent"
                                  style={{
                                    marginStart: 16,
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    flex: 1,
                                  }}>
                                  <View
                                    style={{
                                      flex: 0.1,
                                    }}
                                  />
                                  <View
                                    style={{
                                      flex: 0.7,
                                      justifyContent: 'space-between',
                                    }}>
                                    <Image
                                      style={{
                                        //backgroundColor: "orange",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList2[4]
                                        }`,
                                      }}
                                    />
                                    <View>
                                      <Image
                                        style={{
                                          //backgroundColor: "green",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          marginVertical: 8,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList2[5]
                                          }`,
                                        }}
                                      />
                                      <Image
                                        style={{
                                          //backgroundColor: "yellow",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          marginVertical: 8,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList2[6]
                                          }`,
                                        }}
                                      />
                                    </View>
                                    <Image
                                      style={{
                                        //backgroundColor: "grey",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList2[7]
                                        }`,
                                      }}
                                    />
                                  </View>
                                  <View
                                    style={{
                                      flex: 0.1,
                                    }}
                                  />
                                </View>
                              </View>
                            </View>
                          ) : null}
                        </View>
                      </TouchableWithoutFeedback>

                      <TouchableWithoutFeedback
                        onPress={() => this.eachCirclePartClick(1)}>
                        <View>
                          <View
                            styleName="v-center h-center"
                            style={{
                              borderTopLeftRadius: querterWidth,
                              borderBottomLeftRadius: querterWidth,
                              borderTopStartRadius: 0,
                              borderBottomStartRadius: 0,
                              borderRadius: circleRadius,
                              //backgroundColor: this.returnCircleSelecionColor(2),
                              width: circleRadius,
                              height: circleHeight,
                              //borderEndColor: "black",
                              //borderWidth: 0.5,
                            }}
                          />

                          {this.state.extraImageItemList1.length > 0 ? (
                            <View
                              styleName="vertical"
                              style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                flexDirection: 'row-reverse',
                                justifyContent: 'space-between',
                                flex: 1,
                              }}>
                              <View
                                style={{
                                  flex: 0.4,
                                  marginStart: 8,
                                }}>
                                <View
                                  styleName="fill-parent"
                                  style={{
                                    marginEnd: 20,
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    flex: 1,
                                  }}>
                                  <View
                                    style={{
                                      flex: 0.2,
                                    }}
                                  />
                                  <View
                                    style={{
                                      flex: 0.6,
                                      justifyContent: 'space-between',
                                    }}>
                                    <Animated.Image
                                      style={{
                                        //backgroundColor: "blue",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        transform: [
                                          {
                                            rotate: '30deg',
                                          },
                                        ],
                                        marginEnd: 30,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList1[0]
                                        }`,
                                      }}
                                    />
                                    <Image
                                      style={{
                                        //backgroundColor: "orange",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList1[1]
                                        }`,
                                      }}
                                    />
                                    <Image
                                      style={{
                                        //backgroundColor: "black",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList1[2]
                                        }`,
                                      }}
                                    />
                                    <Animated.Image
                                      style={{
                                        //backgroundColor: "grey",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                        transform: [
                                          {
                                            rotate: '30deg',
                                          },
                                        ],
                                        marginEnd: 36,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList1[3]
                                        }`,
                                      }}
                                    />
                                  </View>
                                  <View
                                    style={{
                                      flex: 0.2,
                                    }}
                                  />
                                </View>
                              </View>
                              <View
                                style={{
                                  flex: 0.1,
                                }}
                              />
                              <View
                                style={{
                                  flex: 0.4,
                                  marginEnd: 8,
                                }}>
                                <View
                                  styleName="fill-parent"
                                  style={{
                                    marginStart: 16,
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    flex: 1,
                                  }}>
                                  <View
                                    style={{
                                      flex: 0.1,
                                    }}
                                  />
                                  <View
                                    style={{
                                      flex: 0.7,
                                      justifyContent: 'space-between',
                                    }}>
                                    <Image
                                      style={{
                                        //backgroundColor: "orange",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList1[4]
                                        }`,
                                      }}
                                    />
                                    <View>
                                      <Image
                                        style={{
                                          //backgroundColor: "green",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          marginVertical: 8,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList1[5]
                                          }`,
                                        }}
                                      />
                                      <Image
                                        style={{
                                          //backgroundColor: "yellow",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          marginVertical: 8,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList1[6]
                                          }`,
                                        }}
                                      />
                                    </View>
                                    <Image
                                      style={{
                                        //backgroundColor: "grey",
                                        width: extraItemWidth,
                                        resizeMode: 'contain',
                                        height: extraItemHeight,
                                      }}
                                      source={{
                                        uri: `${
                                          this.state.extraImageItemList1[7]
                                        }`,
                                      }}
                                    />
                                  </View>
                                  <View
                                    style={{
                                      flex: 0.1,
                                    }}
                                  />
                                </View>
                              </View>
                            </View>
                          ) : null}
                        </View>
                      </TouchableWithoutFeedback>
                    </>
                  </ImageBackground>
                </View>
                <Subtitle
                  style={{
                    marginStart: 16,
                    fontSize: 16,
                    fontFamily: 'Rubik',
                    fontWeight: '400',
                  }}>{`1`}</Subtitle>
              </View>
            </View>
          ) : this.state.circleTab === 3 ? (
            <View styleName="vertical">
              <View styleName="horizontal v-center h-center">
                <View styleName="space-between" style={{marginEnd: 16}}>
                  <Subtitle
                    style={{
                      marginVertical: sizeHeight(4),
                      fontSize: 16,
                      fontFamily: 'Rubik',
                      fontWeight: '400',
                    }}>{`3`}</Subtitle>
                  <Subtitle
                    style={{
                      marginVertical: sizeHeight(4),
                      fontSize: 16,
                      fontFamily: 'Rubik',
                      fontWeight: '400',
                    }}>{`4`}</Subtitle>
                </View>
                <View
                  styleName="v-center h-center"
                  style={{
                    borderRadius: circleRadius,
                    width: circleWidth,
                    height: circleHeight,
                    backgroundColor: 'white',
                    flexDirection: 'column',
                  }}>
                  <ImageBackground
                    styleName="fill-parent"
                    source={{
                      uri: `${Pref.BASEURL}${
                        this.state.pizzaImageList.pizzaquarters2
                      }`,
                    }}
                    style={{
                      borderRadius: circleRadius,
                      width: circleWidth,
                      height: circleHeight,
                      backgroundColor: 'white',
                      flexDirection: 'column',
                    }}>
                    <>
                      <View
                        style={{
                          flexDirection: 'row',
                          width: circleWidth,
                          height: circleRadius,
                          borderTopEndRadius: circleRadius,
                          borderTopStartRadius: circleRadius,
                          flex: 0.5,
                        }}>
                        <TouchableWithoutFeedback
                          onPress={() => this.eachCirclePartClick(6)}>
                          <View
                            style={{
                              borderTopStartRadius: circleRadius,
                              borderTopLeftRadius: circleRadius,
                              //backgroundColor: this.returnCircleSelecionColor(3),
                              width: '100%',
                              height: circleRadius,
                              flex: 0.5,
                              //borderEndColor: "black",
                              //borderWidth: 0.5,
                              //	backgroundColor: 'red'
                            }}>
                            {this.state.extraImageItemList6.length > 0 ? (
                              <View
                                style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  flex: 1,
                                }}>
                                <View
                                  styleName="vertical"
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flex: 0.5,
                                  }}>
                                  <View
                                    styleName="fill-parent"
                                    style={{
                                      marginStart: 20,
                                      alignContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      flex: 1,
                                    }}>
                                    <View
                                      style={{
                                        flex: 0.4,
                                      }}
                                    />
                                    <View
                                      style={{
                                        flex: 0.3,
                                        justifyContent: 'space-between',
                                      }}>
                                      <Animated.Image
                                        style={{
                                          //backgroundColor: "blue",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          transform: [
                                            {
                                              rotate: '30deg',
                                            },
                                          ],
                                          marginStart: 24,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList6[0]
                                          }`,
                                        }}
                                      />

                                      <Animated.Image
                                        style={{
                                          //backgroundColor: "grey",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          transform: [
                                            {
                                              rotate: '30deg',
                                            },
                                          ],
                                          marginStart: 24,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList6[1]
                                          }`,
                                        }}
                                      />
                                    </View>
                                    <View
                                      style={{
                                        flex: 0.2,
                                      }}
                                    />
                                  </View>
                                </View>
                                <View
                                  styleName="vertical"
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flex: 0.5,
                                  }}>
                                  <View
                                    styleName="fill-parent"
                                    style={{
                                      marginStart: 16,
                                      alignContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      flex: 1,
                                    }}>
                                    <View
                                      style={{
                                        flex: 0.3,
                                      }}
                                    />
                                    <View
                                      style={{
                                        flex: 0.5,
                                        justifyContent: 'space-between',
                                      }}>
                                      <Image
                                        style={{
                                          //backgroundColor: "orange",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList6[2]
                                          }`,
                                        }}
                                      />
                                      <View>
                                        <Image
                                          style={{
                                            //backgroundColor: "green",
                                            width: extraItemWidth,
                                            resizeMode: 'contain',
                                            height: extraItemHeight,
                                          }}
                                          source={{
                                            uri: `${
                                              this.state.extraImageItemList6[3]
                                            }`,
                                          }}
                                        />
                                      </View>
                                    </View>
                                    <View
                                      style={{
                                        flex: 0.2,
                                      }}
                                    />
                                  </View>
                                </View>
                              </View>
                            ) : null}
                          </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback
                          onPress={() => this.eachCirclePartClick(3)}>
                          <View
                            style={{
                              borderTopEndRadius: circleRadius,
                              borderTopRightRadius: circleRadius,
                              //backgroundColor: this.returnCircleSelecionColor(6),
                              width: '100%',
                              height: circleRadius,
                              flex: 0.5,
                              //borderEndColor: "black",
                              //borderWidth: 0.5,
                              //backgroundColor:'blue'
                            }}>
                            {this.state.extraImageItemList3.length > 0 ? (
                              <View
                                style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  flexDirection: 'row-reverse',
                                  justifyContent: 'space-between',
                                  flex: 1,
                                }}>
                                <View
                                  styleName="vertical"
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flex: 0.5,
                                  }}>
                                  <View
                                    styleName="fill-parent"
                                    style={{
                                      marginEnd: 20,
                                      alignContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      flex: 1,
                                    }}>
                                    <View
                                      style={{
                                        flex: 0.3,
                                      }}
                                    />
                                    <View
                                      style={{
                                        flex: 0.5,
                                        justifyContent: 'space-between',
                                      }}>
                                      <Animated.Image
                                        style={{
                                          //backgroundColor: "blue",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          transform: [
                                            {
                                              rotate: '-30deg',
                                            },
                                          ],
                                          marginEnd: 32,
                                          marginTop: 8,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList3[0]
                                          }`,
                                        }}
                                      />

                                      <Animated.Image
                                        style={{
                                          //backgroundColor: "grey",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          transform: [
                                            {
                                              rotate: '-30deg',
                                            },
                                          ],
                                          marginEnd: 24,
                                          marginTop: 12,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList3[1]
                                          }`,
                                        }}
                                      />
                                    </View>
                                    <View
                                      style={{
                                        flex: 0.2,
                                      }}
                                    />
                                  </View>
                                </View>
                                <View
                                  styleName="vertical"
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flex: 0.5,
                                  }}>
                                  <View
                                    styleName="fill-parent"
                                    style={{
                                      marginEnd: 16,
                                      alignContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      flex: 1,
                                    }}>
                                    <View
                                      style={{
                                        flex: 0.3,
                                      }}
                                    />
                                    <View
                                      style={{
                                        flex: 0.5,
                                        justifyContent: 'space-between',
                                      }}>
                                      <Image
                                        style={{
                                          //backgroundColor: "orange",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList3[2]
                                          }`,
                                        }}
                                      />
                                      <View>
                                        <Image
                                          style={{
                                            //backgroundColor: "green",
                                            width: extraItemWidth,
                                            resizeMode: 'contain',
                                            height: extraItemHeight,
                                          }}
                                          source={{
                                            uri: `${
                                              this.state.extraImageItemList3[3]
                                            }`,
                                          }}
                                        />
                                      </View>
                                    </View>
                                    <View
                                      style={{
                                        flex: 0.2,
                                      }}
                                    />
                                  </View>
                                </View>
                              </View>
                            ) : null}
                          </View>
                        </TouchableWithoutFeedback>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          width: circleWidth,
                          height: circleRadius,
                          borderBottomEndRadius: circleRadius,
                          borderBottomStartRadius: circleRadius,
                          flex: 0.5,
                        }}>
                        <TouchableWithoutFeedback
                          onPress={() => this.eachCirclePartClick(5)}>
                          <View
                            style={{
                              borderBottomStartRadius: circleRadius,
                              borderBottomLeftRadius: circleRadius,
                              //backgroundColor: this.returnCircleSelecionColor(4),
                              width: '100%',
                              height: circleRadius,
                              flex: 0.5,
                              //borderEndColor: "black",
                              //borderWidth: 0.5,
                              //backgroundColor: 'yellow'
                            }}>
                            {this.state.extraImageItemList5.length > 0 ? (
                              <View
                                style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  flex: 1,
                                }}>
                                <View
                                  styleName="vertical"
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flex: 0.5,
                                  }}>
                                  <View
                                    styleName="fill-parent"
                                    style={{
                                      marginStart: 20,
                                      alignContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      flex: 1,
                                    }}>
                                    <View
                                      style={{
                                        flex: 0.1,
                                      }}
                                    />
                                    <View
                                      style={{
                                        flex: 0.4,
                                        justifyContent: 'space-between',
                                      }}>
                                      <Animated.Image
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList5[0]
                                          }`,
                                        }}
                                        style={{
                                          //backgroundColor: "blue",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          transform: [
                                            {
                                              rotate: '-27deg',
                                            },
                                          ],
                                          marginStart: 30,
                                        }}
                                      />

                                      <Animated.Image
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList5[1]
                                          }`,
                                        }}
                                        style={{
                                          //backgroundColor: "grey",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          transform: [
                                            {
                                              rotate: '-90deg',
                                            },
                                          ],
                                          marginStart: 36,
                                          marginBottom: 12,
                                        }}
                                      />
                                    </View>
                                    <View
                                      style={{
                                        flex: 0.4,
                                      }}
                                    />
                                  </View>
                                </View>

                                <View
                                  styleName="vertical"
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flex: 0.5,
                                  }}>
                                  <View
                                    styleName="fill-parent"
                                    style={{
                                      marginStart: 16,
                                      alignContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      flex: 1,
                                    }}>
                                    <View
                                      style={{
                                        flex: 0.1,
                                      }}
                                    />
                                    <View
                                      style={{
                                        flex: 0.5,
                                        justifyContent: 'space-between',
                                      }}>
                                      <Image
                                        style={{
                                          //backgroundColor: "orange",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList5[2]
                                          }`,
                                        }}
                                      />
                                      <View>
                                        <Image
                                          style={{
                                            //backgroundColor: "green",
                                            width: extraItemWidth,
                                            resizeMode: 'contain',
                                            height: extraItemHeight,
                                          }}
                                          source={{
                                            uri: `${
                                              this.state.extraImageItemList5[3]
                                            }`,
                                          }}
                                        />
                                      </View>
                                    </View>
                                    <View
                                      style={{
                                        flex: 0.4,
                                      }}
                                    />
                                  </View>
                                </View>
                              </View>
                            ) : null}
                          </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback
                          onPress={() => this.eachCirclePartClick(4)}>
                          <View
                            style={{
                              borderBottomEndRadius: circleRadius,
                              borderBottomRightRadius: circleRadius,
                              //backgroundColor: this.returnCircleSelecionColor(5),
                              width: '100%',
                              height: circleRadius,
                              flex: 0.5,
                              //borderEndColor: "black",
                              //borderWidth: 0.5,
                            }}>
                            {this.state.extraImageItemList4.length > 0 ? (
                              <View
                                style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  flexDirection: 'row-reverse',
                                  justifyContent: 'space-between',
                                  flex: 1,
                                }}>
                                <View
                                  styleName="vertical"
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flex: 0.5,
                                  }}>
                                  <View
                                    styleName="fill-parent"
                                    style={{
                                      marginEnd: 20,
                                      alignContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      flex: 1,
                                    }}>
                                    <View
                                      style={{
                                        flex: 0.1,
                                      }}
                                    />
                                    <View
                                      style={{
                                        flex: 0.6,
                                        justifyContent: 'space-between',
                                      }}>
                                      <Animated.Image
                                        style={{
                                          //backgroundColor: "blue",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          transform: [
                                            {
                                              rotate: '-90deg',
                                            },
                                          ],
                                          marginStart: 12,
                                          marginBottom: 12,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList4[0]
                                          }`,
                                        }}
                                      />

                                      <Animated.Image
                                        style={{
                                          //backgroundColor: "grey",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                          transform: [
                                            {
                                              rotate: '-90deg',
                                            },
                                          ],
                                          marginEnd: 36,
                                          marginBottom: 24,
                                          marginTop: -10,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList4[1]
                                          }`,
                                        }}
                                      />
                                    </View>
                                    <View
                                      style={{
                                        flex: 0.3,
                                      }}
                                    />
                                  </View>
                                </View>
                                <View
                                  styleName="vertical"
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    flex: 0.5,
                                  }}>
                                  <View
                                    styleName="fill-parent"
                                    style={{
                                      marginEnd: 16,
                                      alignContent: 'center',
                                      alignItems: 'center',
                                      alignSelf: 'center',
                                      flex: 1,
                                    }}>
                                    <View
                                      style={{
                                        flex: 0.1,
                                      }}
                                    />
                                    <View
                                      style={{
                                        flex: 0.4,
                                        justifyContent: 'space-between',
                                      }}>
                                      <Image
                                        style={{
                                          //backgroundColor: "orange",
                                          width: extraItemWidth,
                                          resizeMode: 'contain',
                                          height: extraItemHeight,
                                        }}
                                        source={{
                                          uri: `${
                                            this.state.extraImageItemList4[2]
                                          }`,
                                        }}
                                      />
                                      <View>
                                        <Image
                                          source={{
                                            uri: `${
                                              this.state.extraImageItemList4[3]
                                            }`,
                                          }}
                                          style={{
                                            //backgroundColor: "green",
                                            width: extraItemWidth,
                                            resizeMode: 'contain',
                                            height: extraItemHeight,
                                          }}
                                        />
                                      </View>
                                    </View>
                                    <View
                                      style={{
                                        flex: 0.5,
                                      }}
                                    />
                                  </View>
                                </View>
                              </View>
                            ) : null}
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    </>
                  </ImageBackground>
                </View>
                <View styleName="space-between" style={{marginStart: 16}}>
                  <Subtitle
                    style={{
                      marginVertical: sizeHeight(4),
                      fontSize: 16,
                      fontFamily: 'Rubik',
                      fontWeight: '400',
                    }}>{`1`}</Subtitle>
                  <Subtitle
                    style={{
                      marginVertical: sizeHeight(4),
                      fontSize: 16,
                      fontFamily: 'Rubik',
                      fontWeight: '400',
                    }}>{`2`}</Subtitle>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  renderCircleView() {
    return (
      <Portal>
        <Modal
          dismissable={false}
          onDismiss={() =>
            this.setState({
              visibility: 66,
              mode: false,
              cartExArray: [],
            })
          }
          visible={this.state.visibility === 1}
          contentContainerStyle={{
            height: i18n.t(k._5),
          }}>
          <View
            style={{
              flex: 1,
            }}>
            {/* <ScrollView contentContainerStyle={{ flexGrow: 1}}> */}
            <View
              style={{
                flex: 1,
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
                  styleName="horizontal space-between"
                  style={{
                    marginStart: sizeWidth(3),
                    justifyContent: 'space-between',
                    flex: 1,
                    flexDirection: 'row',
                  }}>
                  <View
                    styleName="horizontal space-between"
                    style={{
                      marginBottom: 2,
                      marginTop: 4,
                    }}>
                    <TouchableOpacity onPress={() => this.backk()}>
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

                    <Title
                      styleName="bold"
                      style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        fontSize: 18,
                        marginStart: 8,
                        alignSelf: 'center',
                        fontWeight: '700',
                      }}>
                      {Lodash.capitalize(this.state.serviceDetail.name)}
                    </Title>
                  </View>
                  {!this.state.mode ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        alignSelf: 'flex-end',
                        marginTop: 8,
                        marginEnd: 8,
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          const moreItem = this.state.mainBaseCount + 1;
                          this.setState({
                            mainBaseCount: moreItem,
                          });
                        }}>
                        <View
                          style={{
                            borderRadius: 24,
                            width: 48,
                            height: 48,
                            borderColor: '#3daccf',
                            borderWidth: 1,
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                          <Icon
                            name="add"
                            size={24}
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

                      <Title
                        styleName="bold"
                        style={{
                          color: '#5EBBD7',
                          fontFamily: 'Rubik',
                          fontSize: 22,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                          fontWeight: '700',
                          marginStart: 16,
                          marginEnd: 16,
                        }}>
                        {this.state.mainBaseCount}
                      </Title>

                      <TouchableOpacity
                        onPress={() => {
                          if (this.state.mainBaseCount > 1) {
                            const lessItem = this.state.mainBaseCount - 1;
                            this.setState({
                              mainBaseCount: lessItem,
                            });
                          }
                        }}>
                        <View
                          style={{
                            borderRadius: 24,
                            width: 48,
                            height: 48,
                            borderColor: '#3daccf',
                            borderWidth: 1,
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                          <Icon
                            name="remove"
                            size={24}
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
                    </View>
                  ) : null}
                </View>
                {/* <Image
									source={{
										uri: `${Pref.BASEURL}${this.state.clickitem.imageUrl}`,
									}}
									style={{
										width: 96,
										height: 96,
										marginTop: 4,
										marginStart: 8,
										marginEnd: 8,
										borderTopEndRadius: 8,
										borderTopLeftRadius: 8,
										borderTopRightRadius: 8,
										borderTopStartRadius: 8,
										borderBottomRightRadius: 8,
										borderBottomStartRadius: 8,
										borderBottomEndRadius: 8,
										borderBottomLeftRadius: 8,
									}}
								/> */}
              </View>
              <View
                style={{
                  flex: 0.59,
                  backgroundColor: 'white',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  marginTop: 4,
                }}>
                <ScrollView
                  contentContainerStyle={{
                    flexGrow: 1,
                  }}>
                  <View styleName="vertical" style={{}}>
                    {this.renderdesignCircle()}
                    {this.state.showCircleExtraData.length > 0 ? (
                      <FlatList
                        extraData={this.state}
                        nestedScrollEnabled={true}
                        style={{
                          marginVertical: 8,
                          marginHorizontal: 12,
                          flex: 1,
                        }}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        data={this.state.showCircleExtraData}
                        keyExtractor={(item, index) => `${index}${item.name}`}
                        renderItem={({item, index}) =>
                          this.renderCircleSelectedData(item, index)
                        }
                      />
                    ) : null}
                  </View>
                </ScrollView>
              </View>
              <View
                style={{
                  flex: 0.31,
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
                  <Title
                    styleName="bold v-center h-center"
                    style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      alignSelf: 'flex-start',
                      fontSize: 16,
                      marginStart: sizeWidth(4.5),
                      fontWeight: '700',
                      backgroundColor: 'white',
                    }}>
                    {`${i18n.t(k._67)}`}
                  </Title>
                  <TextInput
                    mode="flat"
                    label={i18n.t(k._68)}
                    underlineColor="transparent"
                    underlineColorAndroid="transparent"
                    style={[
                      styles.inputStyle,
                      {
                        marginStart: sizeWidth(4.5),
                      },
                    ]}
                    placeholderTextColor={i18n.t(k.DEDEDE)}
                    placeholder={i18n.t(k._68)}
                    onChangeText={value =>
                      this.setState({
                        message: value,
                      })
                    }
                    value={this.state.message}
                  />

                  {!this.state.mode ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginBottom: sizeHeight(1),
                      }}>
                      <TouchableWithoutFeedback
                        onPress={() => this.finalorders(true)}>
                        <Subtitle
                          styleName="bold v-center h-center"
                          style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: '700',
                          }}>
                          {`${i18n.t(k._69)}`}
                        </Subtitle>
                      </TouchableWithoutFeedback>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    styleName="flexible"
                    onPress={() => this.finalorders(false)}>
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
                        {this.state.mode ? i18n.t(k._70) : i18n.t(k._71)}
                      </Subtitle>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    );
  }

  filterExtraServiceCircle() {
    this.setState({circleProgressView: true});
    const cartArray = JSON.parse(JSON.stringify(this.state.cartExArray));
    const gotDatas = Lodash.map(this.state.serviceCat, item => {
      const filterData = Lodash.filter(item.data, ele => {
        if (this.state.extraReset) {
          ele.isselectedex = false;
        }
        return ele.catType === selectedCirclePos;
      });
      if (filterData.length > 0) {
        item.data = filterData;
        return item;
      }
    });
    if (gotDatas && gotDatas.length > 0) {
      const unooo = JSON.parse(JSON.stringify(this.state.untouchedExtras));
      freeList = [];
      for (let index = 0; index < cartArray.length; index++) {
        const uui = cartArray[index];
        const find = Lodash.find(unooo, xx => xx.id === uui.id);
        if (find !== undefined && find.isFree === 1) {
          const checkexistence = Lodash.find(
            freeList,
            k => k.name === uui.name,
          );
          if (checkexistence === undefined) {
            freeList.push(uui);
          }
        }
      }
      console.log(`freeList`, freeList);
      const mmm = JSON.parse(JSON.stringify(freeList));
      const filterExtras = Lodash.filter(gotDatas, item => {
        if (item !== undefined) {
          const data = Lodash.filter(item.data, oop => {
            if (oop.isFree === 1) {
              const findcarts = Lodash.find(
                mmm,
                freeAdded => freeAdded.name === oop.name,
              );
              if (findcarts !== undefined) {
                if (findcarts.id !== oop.id && oop.name === findcarts.name) {
                  oop.price = 0;
                } else {
                }
              } else {
                const findexistencex = Lodash.find(
                  unooo,
                  freeAdded => freeAdded.id === oop.id,
                );
                const findcas = Lodash.find(
                  cartArray,
                  freeAdded => freeAdded.id === oop.id,
                );
                if (findcas !== undefined) {
                  oop.price = findexistencex.price;
                  findcas.price = findexistencex.price;
                  const findcasin = Lodash.findIndex(
                    cartArray,
                    freeAdded => freeAdded.id === oop.id,
                  );
                  this.state.cartExArray[findcasin] = findcas;
                } else {
                  oop.price = findexistencex.price;
                }
              }
            }

            return oop;
          });
          if (data.length > 0) {
            item.data = data;
          }
          return item;
        }
      });
      this.setState({
        extraReset: false,
        circleExtras: filterExtras,
        showCircleExtraSelection: true,
        circleProgressView: false,
      });
    }
    //console.log(this.state.totalAmount)
  }

  returnCircleSelecionColor(pos) {
    const findpos = Lodash.filter(
      this.state.cartExArray,
      item => item.catType === pos,
    );
    return findpos.length === 0 ? false : true;
  }

  returnCircleData(pos) {
    const cartArray = JSON.parse(JSON.stringify(this.state.cartExArray));
    const filterData = Lodash.filter(
      cartArray,
      item => item.catType === pos && item.finished === true,
    );
    return filterData.length === 0 ? 0 : filterData;
  }

  returnCircleExtraNameData(filterFull) {
    let mergeString = ``;
    const lastpos = filterFull.length - 1;
    Lodash.map(filterFull, (io, index) => {
      //const com = index === 0 ? `` : `,`;
      //mergeString += `${com} ${io.name}`;
      if (index === lastpos) {
        mergeString += `${io.name}`;
      } else {
        mergeString += `${io.name}, `;
      }
    });
    return mergeString;
  }

  finishDough() {
    if (!this.showalertmin()) {
      const price = this.state.totalAmount;
      //console.log(price)
      //console.log(this.state.cartExArray)
      this.setState({
        servicemode: 2,
        serviceCat: JSON.parse(JSON.stringify(this.state.originalExtras)),
        tillDoughPrice: price,
        //showCircleExtraData: [],
      });
    }
  }

  /**
   * continue circle button click
   */
  continueClick() {
    const checker = this.showalertmin();
    if (!checker) {
      if (this.state.circleTab === 2) {
        if (backTrackCounter < 1) {
          selectedCirclePos = selectedCirclePos === 1 ? 2 : 1;
          this.filterExtraServiceCircle();
        }
        backTrackCounter += 1;
      } else if (this.state.circleTab === 3) {
        if (backTrackCounter < 3) {
          if (selectedCirclePos < 6) {
            selectedCirclePos += 1;
          } else if (selectedCirclePos === 6) {
            selectedCirclePos = 3;
          }
          this.filterExtraServiceCircle();
        }
        backTrackCounter += 1;
      } else {
        //ignore
      }
    }
    //console.log(`backTrackCounterInc`, backTrackCounter, selectedCirclePos);
  }

  returnCircleBasedData() {
    const currentTab = this.state.circleTab;
    const {cartExArray} = this.state;
    let filterFull = [];
    if (currentTab === 1) {
      filterFull = Lodash.filter(cartExArray, item => item.catType === 0);
    } else if (currentTab === 2) {
      filterFull = Lodash.filter(
        cartExArray,
        item => item.catType === 1 || item.catType === 2,
      );
    } else if (currentTab === 3) {
      filterFull = Lodash.filter(
        cartExArray,
        item =>
          item.catType === 3 ||
          item.catType === 4 ||
          item.catType === 5 ||
          item.catType === 6,
      );
    }
    return filterFull;
  }

  finishCirclePos() {
    if (!this.showalertmin()) {
      const {circleTab, pizzaImageList} = this.state;
      const imagelist = JSON.parse(JSON.stringify(pizzaImageList));
      console.log(`imagelist`, imagelist);
      backTrackCounter = 0;
      let imageNumList = [];
      let extraImageItemList = [];
      let extraImageItemList1 = [];
      let extraImageItemList2 = [];
      let extraImageItemList3 = [];
      let extraImageItemList4 = [];
      let extraImageItemList5 = [];
      let extraImageItemList6 = [];
      let filterFulldata = this.returnCircleBasedData();

      Lodash.map(filterFulldata, ok => {
        const {imageNum, catType} = ok;
        const key = `${imageNum}`;
        var valueobject = imagelist[key];
        if (valueobject !== undefined) {
          const value = `${Pref.BASEURL}${valueobject}`;
          if (
            this.state.circleTab === 1 ||
            this.state.circleTab === 2 ||
            this.state.circleTab === 3
          ) {
            if (catType === 0) {
              extraImageItemList.push(value);
            } else if (catType === 1) {
              extraImageItemList1.push(value);
            } else if (catType === 2) {
              extraImageItemList2.push(value);
            } else if (catType === 3) {
              extraImageItemList3.push(value);
            } else if (catType === 4) {
              extraImageItemList4.push(value);
            } else if (catType === 5) {
              extraImageItemList5.push(value);
            } else if (catType === 6) {
              extraImageItemList6.push(value);
            }
          }
        }
        return ok;
      });
      if (circleTab === 1) {
        const size = extraImageItemList.length;
        //console.log(`size`, size);
        if (size > 0 && size < 17) {
          if (size % 2 === 0) {
            let remaining = size < 16 ? 16 - size : size;
            for (let index = 0; index < remaining; index++) {
              const element = extraImageItemList[index];
              extraImageItemList.push(element);
            }
          } else {
            const needtoinsert = 16 - size;
            const randompos = Helper.randomNumber(0, size - 1);
            const data = extraImageItemList[randompos];
            for (let index = 0; index < needtoinsert; index++) {
              extraImageItemList.push(data);
            }
          }
        }
      } else if (circleTab === 2) {
        const size = extraImageItemList2.length;
        if (size > 0 && size < 9) {
          if (size % 2 === 0) {
            let remaining = size < 8 ? 8 - size : size;
            for (let index = 0; index < remaining; index++) {
              const element = extraImageItemList2[index];
              extraImageItemList2.push(element);
            }
          } else {
            const needtoinsert = 8 - size;
            const randompos = Helper.randomNumber(0, size - 1);
            const data = extraImageItemList2[randompos];
            for (let index = 0; index < needtoinsert; index++) {
              extraImageItemList2.push(data);
            }
          }
        }

        const size1 = extraImageItemList1.length;
        //console.log(`size`, size, size1);
        if (size1 > 0 && size1 < 9) {
          if (size1 % 2 === 0) {
            let remaining = size1 < 8 ? 8 - size1 : size1;
            for (let index = 0; index < remaining; index++) {
              const element = extraImageItemList1[index];
              extraImageItemList1.push(element);
            }
          } else {
            const needtoinsert = 8 - size1;
            const randompos = Helper.randomNumber(0, size1 - 1);
            const data = extraImageItemList1[randompos];
            for (let index = 0; index < needtoinsert; index++) {
              extraImageItemList1.push(data);
            }
          }
        }
      } else if (circleTab === 3) {
        const size = extraImageItemList3.length;
        if (size > 0 && size < 5) {
          if (size % 2 === 0) {
            const data = extraImageItemList3[0];
            extraImageItemList3.push(data);
            const data1 = extraImageItemList3[1];
            extraImageItemList3.push(data1);
          } else {
            const needtoinsert = 4 - size;
            const randompos = Helper.randomNumber(0, size - 1);
            const data = extraImageItemList3[randompos];
            for (let index = 0; index < needtoinsert; index++) {
              extraImageItemList3.push(data);
            }
          }
        }

        const size1 = extraImageItemList4.length;
        if (size1 > 0 && size1 < 5) {
          if (size1 % 2 === 0) {
            const data = extraImageItemList4[0];
            extraImageItemList4.push(data);
            const data1 = extraImageItemList4[1];
            extraImageItemList4.push(data1);
          } else {
            const needtoinsert = 4 - size1;
            const randompos = Helper.randomNumber(0, size1 - 1);
            const data = extraImageItemList4[randompos];
            for (let index = 0; index < needtoinsert; index++) {
              extraImageItemList4.push(data);
            }
          }
        }

        const size2 = extraImageItemList5.length;
        if (size2 > 0 && size2 < 5) {
          if (size2 % 2 === 0) {
            const data = extraImageItemList5[0];
            extraImageItemList5.push(data);
            const data1 = extraImageItemList5[1];
            extraImageItemList5.push(data1);
          } else {
            const needtoinsert = 4 - size2;
            const randompos = Helper.randomNumber(0, size2 - 1);
            const data = extraImageItemList5[randompos];
            for (let index = 0; index < needtoinsert; index++) {
              extraImageItemList5.push(data);
            }
          }
        }

        const size3 = extraImageItemList6.length;
        if (size3 > 0 && size3 < 5) {
          if (size3 % 2 === 0) {
            const data = extraImageItemList6[0];
            extraImageItemList6.push(data);
            const data1 = extraImageItemList6[1];
            extraImageItemList6.push(data1);
          } else {
            const needtoinsert = 4 - size3;
            const randompos = Helper.randomNumber(0, size3 - 1);
            const data = extraImageItemList6[randompos];
            for (let index = 0; index < needtoinsert; index++) {
              extraImageItemList6.push(data);
            }
          }
        }
      }
      const cartttt = JSON.parse(JSON.stringify(this.state.cartExArray));
      const st = JSON.parse(JSON.stringify(this.state.serviceCat));
      let cartExArray = Lodash.map(cartttt, ok => {
        ok.finished = true;
        return ok;
      });
      let catcat = Lodash.map(st, ok => {
        let data = Lodash.map(ok.data, kkk => {
          if (kkk.isselectedex) {
            kkk.finished = true;
          }
          return kkk;
        });
        ok.data = data;
        return ok;
      });
      //console.log('cartExArray', cartExArray)
      this.setState(
        {
          extraImageItemList: extraImageItemList,
          extraImageItemList1: extraImageItemList1,
          extraImageItemList2: extraImageItemList2,
          extraImageItemList3: extraImageItemList3,
          extraImageItemList4: extraImageItemList4,
          extraImageItemList5: extraImageItemList5,
          extraImageItemList6: extraImageItemList6,
          showCircleExtraSelection: false,
          cartExArray: cartExArray,
          serviceCat: catcat,
        },
        () => {
          let showExtraData = this.returncircletext(circleTab);
          //console.log(`showExtraData`, showExtraData)
          this.setState({
            showCircleExtraData: showExtraData,
          });
          finishedList = [];
        },
      );
    }
  }

  circlextrapickerBack() {
    backTrackCounter = 0;
    //if (!this.state.mode) {
    const unooo = JSON.parse(JSON.stringify(this.state.untouchedExtras));
    const st = JSON.parse(JSON.stringify(this.state.serviceCat));
    //console.log('unooo', unooo)

    const cartttt = JSON.parse(JSON.stringify(this.state.cartExArray));

    //console.log('finishedList', finishedList)

    let filterFull2 = Lodash.filter(cartttt, io => io.finished !== undefined);
    if (finishedList.length > 0) {
      const ooojjj = Lodash.map(finishedList, ui => {
        filterFull2.push(ui);
        return ui;
      });
    }
    //console.log('filterFull2', filterFull2)

    const againFill = JSON.parse(JSON.stringify(filterFull2));
    const catcat = Lodash.map(st, ok => {
      //let minSelect = 0;
      const data = Lodash.map(ok.data, fool => {
        const find = Lodash.find(unooo, iiooo => iiooo.id === fool.id);
        if (fool.finished === undefined) {
          fool.isselectedex = false;
          //fool.price = find.price;
        }

        const findfinished = Lodash.find(
          finishedList,
          iiooo => iiooo.id === fool.id,
        );
        if (findfinished !== undefined) {
          fool.isselectedex = true;
          //fool.price = find.price;
        }
        return fool;
      });
      const filterxx = Lodash.filter(againFill, i => i.category === ok.title);
      const find = Lodash.find(
        unooo,
        iiooo => iiooo.category_name === ok.title,
      );
      const oldselect = ok.minselect;
      const findSelect = find.minimumSelect;
      //console.log(`lengthz`, filterxx.length)
      if (filterxx.length === 0) {
        ok.minselect = findSelect;
        ok.counter = 0;
      } else {
        if (filterxx.length >= findSelect) {
          ok.counter = filterxx.length;
          ok.minselect = 0;
        }
        //if (findSelect > filterxx.length){
        //	ok.minselect = findSelect - filterxx.length
        //ok.counter =
        //}
      }
      // if (oldselect === 0 && ok.counter > 0){
      // 	ok.minselect = findSelect;
      // 	ok.counter = 0;
      // }
      //ok.minselect = findSelect;
      ok.data = data;
      return ok;
    });
    //console.log('catcat', catcat)

    //let filterFull3 = Lodash.filter(showExtraData, io => io.finished !== undefined);
    this.setState(
      {
        extraReset: false,
        showCircleExtraSelection: false,
        circleExtras: [],
        serviceCat: catcat,
        cartExArray: filterFull2,
      },
      () => {
        let showExtraData = this.returncircletext(this.state.circleTab);
        //console.log(`showExtraData`, showExtraData)
        this.setState({
          showCircleExtraData: showExtraData,
        });
        finishedList = [];
      },
    );
    // } else {
    // 	this.setState({
    // 		extraReset: false,
    // 		showCircleExtraSelection: false,
    // 		showCircleExtraData: showExtraData,
    // 		circleExtras: [],
    // 		//serviceCat: og,
    // 	});
    // }
  }

  returncircletext(currentTab) {
    let showExtraData = [];
    if (currentTab === 1) {
      let filterFull = this.returnCircleData(0);
      if (filterFull.length > 0) {
        const mergeString = this.returnCircleExtraNameData(filterFull);
        showExtraData.push({
          name: mergeString,
          number: 0,
          type: 0,
        });
      }
    } else if (currentTab === 2) {
      let filterFull = this.returnCircleData(1);
      let filterFull2 = this.returnCircleData(2);
      if (filterFull.length > 0 && filterFull2.length > 0) {
        const mergeString = this.returnCircleExtraNameData(filterFull);
        const mergeString1 = this.returnCircleExtraNameData(filterFull2);
        showExtraData.push(
          {name: mergeString, number: 1, type: 1},
          {
            name: mergeString1,
            number: 2,
            type: 2,
          },
        );
      } else {
        if (filterFull2.length > 0) {
          const mergeString = this.returnCircleExtraNameData(filterFull2);
          showExtraData.push({
            name: mergeString,
            number: 2,
            type: 2,
          });
        }
        if (filterFull.length > 0) {
          const mergeString = this.returnCircleExtraNameData(filterFull);
          showExtraData.push({
            name: mergeString,
            number: 1,
            type: 1,
          });
        }
      }
    } else if (currentTab === 3) {
      let filterFull = this.returnCircleData(3);
      let filterFull2 = this.returnCircleData(4);
      let filterFull3 = this.returnCircleData(5);
      let filterFull4 = this.returnCircleData(6);
      if (
        filterFull.length > 0 &&
        filterFull2.length > 0 &&
        filterFull3.length > 0 &&
        filterFull4.length > 0
      ) {
        const mergeString = this.returnCircleExtraNameData(filterFull);
        const mergeString1 = this.returnCircleExtraNameData(filterFull2);
        const mergeString2 = this.returnCircleExtraNameData(filterFull3);
        const mergeString3 = this.returnCircleExtraNameData(filterFull4);
        showExtraData.push(
          {name: mergeString, number: 1, type: 3},
          {
            name: mergeString1,
            number: 2,
            type: 4,
          },
          {
            name: mergeString2,
            number: 3,
            type: 5,
          },
          {
            name: mergeString3,
            number: 4,
            type: 6,
          },
        );
      } else {
        if (filterFull.length > 0) {
          const mergeString = this.returnCircleExtraNameData(filterFull);
          showExtraData.push({
            name: mergeString,
            number: 1,
            type: 3,
          });
        }
        if (filterFull2.length > 0) {
          const mergeString = this.returnCircleExtraNameData(filterFull2);
          showExtraData.push({
            name: mergeString,
            number: 2,
            type: 4,
          });
        }
        if (filterFull3.length > 0) {
          const mergeString = this.returnCircleExtraNameData(filterFull3);
          showExtraData.push({
            name: mergeString,
            number: 4,
            type: 5,
          });
        }
        if (filterFull4.length > 0) {
          const mergeString = this.returnCircleExtraNameData(filterFull4);
          showExtraData.push({
            name: mergeString,
            number: 3,
            type: 6,
          });
        }
      }
    }
    return showExtraData;
  }

  menuItemClicked = (tabData, itemx, i) => {
    if (itemx.available === 1) {
      currentCat = tabData.cat;
      this.onItemClicks(false, itemx);
      this.setState({
        clickedItemPos: i,
      });
    }
  };

  // accordClick = cat => {
  //   let {currentCat} = this.state;
  //   if (currentCat === cat) {
  //     currentCat = '';
  //   } else {
  //     currentCat = cat;
  //   }
  //   this.setState({
  //     currentCat: currentCat,
  //   });
  // };

  render() {
    return (
      <>
        {this.state.servicemode === 1 ? (
          <Portal>
            <Modal
              dismissable={false}
              onDismiss={() =>
                this.setState({
                  visibility: 66,
                  mode: false,
                  cartExArray: [],
                })
              }
              visible={this.state.visibility === 1}
              contentContainerStyle={{
                height: i18n.t(k._5),
              }}>
              <View
                style={{
                  flex: 1,
                }}>
                {/* <ScrollView contentContainerStyle={{ flexGrow: 1}}> */}
                <View style={{flex: 0.15}} />
                <View
                  style={{
                    flex: 0.7,
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
                      styleName="vertical"
                      style={{
                        marginStart: sizeWidth(3),
                      }}>
                      <TouchableOpacity onPress={() => this.backk()}>
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
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 0.8,
                      backgroundColor: 'white',
                      flexDirection: 'column',
                      marginTop: 4,
                    }}>
                    <DummyLoader
                      visibilty={this.state.progressView}
                      style={{
                        width: '100%',
                        flexBasis: 1,
                      }}
                      center={
                        <SectionList
                          extraData={this.state}
                          //style={{ flex: 0.5 }}
                          showsVerticalScrollIndicator={true}
                          showsHorizontalScrollIndicator={false}
                          sections={this.state.serviceCat}
                          keyExtractor={(item, index) => item.name}
                          renderSectionHeader={({section}) => (
                            <View
                              styleName="vertical space-between"
                              style={{
                                backgroundColor: 'white',
                                marginStart: sizeWidth(3),
                                marginVertical: sizeHeight(1),
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
                                {Lodash.capitalize(section.title)}
                              </Title>
                            </View>
                          )}
                          renderItem={({item, index: secindex, section}) =>
                            secindex == 0 ? (
                              <FlatList
                                numColumns={2}
                                extraData={this.state}
                                nestedScrollEnabled={true}
                                style={{
                                  marginStart: sizeWidth(3),
                                  backgroundColor: 'white',
                                }}
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                data={section.data}
                                keyExtractor={(item, index) => item.name}
                                renderItem={({item: extraItem, index}) =>
                                  this.renderExcatItemRow(
                                    extraItem,
                                    index,
                                    section.title,
                                    secindex,
                                  )
                                }
                              />
                            ) : null
                          }
                        />
                      }
                    />
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
                        onPress={() => this.finishDough()}>
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
                            {`${i18n.t(k.cirfinish)}`}
                          </Subtitle>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{flex: 0.15}} />
              </View>
            </Modal>
          </Portal>
        ) : this.state.visibility === 1 ? (
          this.state.servicemode === 2 ? (
            <View>
              {this.renderCircleView()}
              <Portal>
                <Modal
                  dismissable={false}
                  onDismiss={() =>
                    this.setState({
                      showCircleExtraSelection: false,
                    })
                  }
                  visible={this.state.showCircleExtraSelection}
                  contentContainerStyle={{
                    height: i18n.t(k._5),
                  }}>
                  <View
                    style={{
                      flex: 1,
                    }}>
                    {/* <ScrollView contentContainerStyle={{ flexGrow: 1}}> */}
                    <View
                      style={{
                        flex: 1,
                        marginTop: sizeHeight(4),
                        marginBottom: sizeHeight(8),
                        marginHorizontal: sizeWidth(4),
                        backgroundColor: 'white',
                        flexDirection: 'column',
                        position: 'relative',
                      }}>
                      <View
                        style={{
                          flex: 0.13,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          backgroundColor: 'white',
                          marginTop: 6,
                        }}>
                        <View
                          styleName="vertical space-between"
                          style={{
                            marginStart: sizeWidth(3),
                          }}>
                          <TouchableOpacity
                            onPress={() => this.circlextrapickerBack()}>
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
                          <View
                            styleName="horizontal space-between"
                            style={{
                              marginBottom: 2,
                              marginTop: 4,
                            }}>
                            <Title
                              styleName="bold"
                              style={{
                                color: '#292929',
                                fontFamily: 'Rubik',
                                fontSize: 18,
                                alignSelf: 'flex-start',
                                fontWeight: '700',
                              }}>
                              {Lodash.capitalize(this.state.serviceDetail.name)}
                            </Title>
                          </View>
                        </View>
                      </View>
                      <View
                        style={{
                          flex: 0.72,
                          backgroundColor: 'white',
                          flexDirection: 'column',
                          marginTop: 4,
                        }}>
                        <Divider
                          styleName="line"
                          style={{
                            marginTop: 4,
                            marginBottom: 4,
                          }}
                        />
                        <DummyLoader
                          visibilty={this.state.circleProgressView}
                          center={
                            <SectionList
                              extraData={this.state}
                              //style={{ flex: 0.5 }}
                              showsVerticalScrollIndicator={true}
                              showsHorizontalScrollIndicator={false}
                              sections={this.state.circleExtras}
                              keyExtractor={(item, index) => item.name}
                              renderSectionHeader={({section}) => (
                                <View
                                  styleName="vertical space-between"
                                  style={{
                                    backgroundColor: 'white',
                                    marginStart: sizeWidth(3),
                                    marginVertical: sizeHeight(1),
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
                                    {Lodash.capitalize(section.title)}
                                  </Title>
                                </View>
                              )}
                              renderItem={({item, index: secindex, section}) =>
                                secindex == 0 ? (
                                  <FlatList
                                    numColumns={2}
                                    extraData={this.state}
                                    nestedScrollEnabled={true}
                                    style={{
                                      marginStart: sizeWidth(3),
                                      backgroundColor: 'white',
                                    }}
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    data={section.data}
                                    keyExtractor={(item, index) => item.name}
                                    renderItem={({item: extraItem, index}) =>
                                      this.renderExcatItemRow(
                                        extraItem,
                                        index,
                                        section.title,
                                        secindex,
                                      )
                                    }
                                  />
                                ) : null
                              }
                            />
                          }
                        />
                      </View>
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
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              marginBottom: sizeHeight(1),
                            }}>
                            {this.state.circleTab === 2 &&
                            backTrackCounter < 1 ? (
                              <TouchableWithoutFeedback
                                onPress={() => this.continueClick()}>
                                <Subtitle
                                  styleName="bold v-center h-center"
                                  style={{
                                    color: '#292929',
                                    fontFamily: 'Rubik',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    fontSize: 14,
                                    fontWeight: '700',
                                  }}>
                                  {`${i18n.t(k.circontinue)}`}
                                </Subtitle>
                              </TouchableWithoutFeedback>
                            ) : null}

                            {this.state.circleTab === 3 &&
                            backTrackCounter < 3 ? (
                              <TouchableWithoutFeedback
                                onPress={() => this.continueClick()}>
                                <Subtitle
                                  styleName="bold v-center h-center"
                                  style={{
                                    color: '#292929',
                                    fontFamily: 'Rubik',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    fontSize: 14,
                                    fontWeight: '700',
                                  }}>
                                  {`${i18n.t(k.circontinue)}`}
                                </Subtitle>
                              </TouchableWithoutFeedback>
                            ) : null}
                          </View>
                          <TouchableOpacity
                            styleName="flexible"
                            onPress={() => this.finishCirclePos()}>
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
                                {`${i18n.t(k.cirfinish)}`}
                              </Subtitle>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </Modal>
              </Portal>
            </View>
          ) : (
            <Portal>
              <Modal
                dismissable={false}
                onDismiss={() =>
                  this.setState({
                    visibility: 66,
                    mode: false,
                    cartExArray: [],
                  })
                }
                visible={this.state.visibility === 1}
                contentContainerStyle={{
                  height: i18n.t(k._5),
                }}>
                <View
                  style={{
                    flex: 1,
                  }}>
                  {/* <ScrollView contentContainerStyle={{ flexGrow: 1}}> */}
                  <View
                    style={{
                      flex: 1,
                      marginTop: sizeHeight(4),
                      marginBottom: sizeHeight(8),
                      marginHorizontal: sizeWidth(4),
                      backgroundColor: 'white',
                      flexDirection: 'column',
                      position: 'relative',
                    }}>
                    <View
                      style={{
                        flex: 0.23,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: 'white',
                        marginTop: 6,
                      }}>
                      <View
                        styleName="vertical space-between"
                        style={{
                          marginStart: sizeWidth(3),
                        }}>
                        <TouchableOpacity onPress={() => this.backk()}>
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
                        <View
                          styleName="horizontal space-between"
                          style={{
                            marginBottom: 2,
                            marginTop: 4,
                          }}>
                          <Title
                            styleName="bold"
                            style={{
                              color: '#292929',
                              fontFamily: 'Rubik',
                              fontSize: 18,
                              alignSelf: 'flex-start',
                              fontWeight: '700',
                            }}>
                            {Lodash.capitalize(this.state.serviceDetail.name)}
                          </Title>
                        </View>
                        {!this.state.mode ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              marginTop: 8,
                            }}>
                            <TouchableOpacity
                              onPress={() => {
                                const moreItem = this.state.mainBaseCount + 1;
                                this.setState({
                                  mainBaseCount: moreItem,
                                });
                              }}>
                              <View
                                style={{
                                  borderRadius: 24,
                                  width: 48,
                                  height: 48,
                                  borderColor: '#3daccf',
                                  borderWidth: 1,
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignContent: 'center',
                                }}>
                                <Icon
                                  name="add"
                                  size={24}
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

                            <Title
                              styleName="bold"
                              style={{
                                color: '#5EBBD7',
                                fontFamily: 'Rubik',
                                fontSize: 22,
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                fontWeight: '700',
                                marginStart: 16,
                                marginEnd: 16,
                              }}>
                              {this.state.mainBaseCount}
                            </Title>

                            <TouchableOpacity
                              onPress={() => {
                                if (this.state.mainBaseCount > 1) {
                                  const lessItem = this.state.mainBaseCount - 1;
                                  this.setState({
                                    mainBaseCount: lessItem,
                                  });
                                }
                              }}>
                              <View
                                style={{
                                  borderRadius: 24,
                                  width: 48,
                                  height: 48,
                                  borderColor: '#3daccf',
                                  borderWidth: 1,
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignContent: 'center',
                                }}>
                                <Icon
                                  name="remove"
                                  size={24}
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
                          </View>
                        ) : null}
                      </View>
                      <Image
                        source={{
                          uri: `${Pref.BASEURL}${
                            this.state.clickitem.imageUrl
                          }`,
                        }}
                        style={{
                          width: 96,
                          height: 96,
                          marginTop: 4,
                          marginStart: 8,
                          marginEnd: 8,
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
                    </View>

                    <View
                      style={{
                        flex: 0.46,
                        backgroundColor: 'white',
                        flexDirection: 'column',
                        marginTop: 4,
                      }}>
                      <Divider
                        styleName="line"
                        style={{
                          marginTop: 4,
                          marginBottom: 4,
                        }}
                      />
                      <DummyLoader
                        visibilty={this.state.progressView}
                        center={
                          <SectionList
                            extraData={this.state}
                            //style={{ flex: 0.5 }}
                            showsVerticalScrollIndicator={true}
                            showsHorizontalScrollIndicator={false}
                            sections={this.state.serviceCat}
                            keyExtractor={(item, index) => item.name}
                            renderSectionHeader={({section}) => (
                              <View
                                styleName="vertical space-between"
                                style={{
                                  backgroundColor: 'white',
                                  marginStart: sizeWidth(3),
                                  marginVertical: sizeHeight(1),
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
                                  {Lodash.capitalize(section.title)}
                                </Title>
                              </View>
                            )}
                            renderItem={({item, index: secindex, section}) =>
                              secindex == 0 ? (
                                <FlatList
                                  numColumns={2}
                                  extraData={this.state}
                                  nestedScrollEnabled={true}
                                  style={{
                                    marginStart: sizeWidth(3),
                                    backgroundColor: 'white',
                                  }}
                                  showsHorizontalScrollIndicator={false}
                                  showsVerticalScrollIndicator={false}
                                  data={section.data}
                                  keyExtractor={(item, index) => item.name}
                                  renderItem={({item: extraItem, index}) =>
                                    this.renderExcatItemRow(
                                      extraItem,
                                      index,
                                      section.title,
                                      secindex,
                                    )
                                  }
                                />
                              ) : null
                            }
                          />
                        }
                      />
                    </View>
                    <View
                      style={{
                        flex: 0.31,
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
                        <Title
                          styleName="bold v-center h-center"
                          style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            alignSelf: 'flex-start',
                            fontSize: 16,
                            marginStart: sizeWidth(4.5),
                            fontWeight: '700',
                            backgroundColor: 'white',
                          }}>
                          {`${i18n.t(k._67)}`}
                        </Title>
                        <TextInput
                          mode="flat"
                          label={i18n.t(k._68)}
                          underlineColor="transparent"
                          underlineColorAndroid="transparent"
                          style={[
                            styles.inputStyle,
                            {
                              marginStart: sizeWidth(4.5),
                            },
                          ]}
                          placeholderTextColor={i18n.t(k.DEDEDE)}
                          placeholder={i18n.t(k._68)}
                          onChangeText={value =>
                            this.setState({
                              message: value,
                            })
                          }
                          value={this.state.message}
                        />

                        {!this.state.mode ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              marginBottom: sizeHeight(1),
                            }}>
                            <TouchableWithoutFeedback
                              onPress={() => this.finalorders(true)}>
                              <Subtitle
                                styleName="bold v-center h-center"
                                style={{
                                  color: '#292929',
                                  fontFamily: 'Rubik',
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                  fontSize: 14,
                                  fontWeight: '700',
                                }}>
                                {`${i18n.t(k._69)}`}
                              </Subtitle>
                            </TouchableWithoutFeedback>
                          </View>
                        ) : null}
                        <TouchableOpacity
                          styleName="flexible"
                          onPress={() => this.finalorders(false)}>
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
                              {this.state.mode ? i18n.t(k._70) : i18n.t(k._71)}
                            </Subtitle>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Modal>
            </Portal>
          )
        ) : this.state.visibility === 2 ? (
          <View styleName="fill-parent">
            <NavigationBar
              styleName="inline no-border"
              leftComponent={
                <TouchableOpacity
                  onPress={() =>
                    this.setState({
                      visibility: 0,
                      totalAmount: 0,
                      mainBaseAmount: 0,
                      mainBaseCount: 1,
                    })
                  }>
                  <Icon
                    name="arrow-forward"
                    size={24}
                    color="black"
                    style={{
                      padding: 4,
                      backgroundColor: 'transparent',
                    }}
                  />
                </TouchableOpacity>
              }
              centerComponent={
                <Heading style={{fontSize: 21}}>
                  {' '}
                  {i18n.t(k.YOUR_CART)}{' '}
                </Heading>
              }
            />

            <View>
              <Row
                styleName="vertical sm-gutter"
                style={{
                  padding: 8,
                }}>
                <View styleName="vertical space-between">
                  <View styleName="horizontal space-between">
                    <Title
                      styleName="bold"
                      style={{
                        color: Colors.orange500,
                      }}>
                      {`${this.state.cartItemCounter} ${i18n.t(k.ITEMS)}`}
                    </Title>
                    <Title
                      styleName="bold"
                      style={{
                        alignSelf: 'center',
                        padding: 2,
                      }}>
                      {this.state.cartTotalAmount}
                      {i18n.t(k.TOTAL)}
                    </Title>
                  </View>
                </View>
              </Row>
            </View>
            <Divider styleName="line" />
            <View styleName="horizontal space-between sm-gutter">
              <Subtitle>{i18n.t(k.YOU_MAY_ALSO_LIKE)}</Subtitle>
            </View>
            <View
              styleName="vertical wrap space-between"
              style={{
                flex: 1,
                marginTop: 4,
                marginBottom: 4,
                marginStart: 4,
                marginEnd: 4,
              }}>
              <View styleName="horizontal wrap space-between">
                <FlatList
                  showsHorizontalScrollIndicator={this.state.scrollHide}
                  horizontal
                  extraData={this.state}
                  data={this.state.multiArr}
                  renderItem={({item: dExtra, index}) =>
                    this.renderExcatDItemRow(dExtra, index)
                  }
                  keyExtractor={(item, index) => index}
                />
              </View>

              <Button
                style={styles.buttonStyle}
                mode="contained"
                dark={true}
                onPress={() => {
                  NavigationActions.navigate(i18n.t(k.FINALORDER), {
                    orderData: this.state.cartDetails,
                    id: this.state.branchid,
                  });
                }}
                loading={false}>
                <Subtitle
                  style={{
                    color: 'white',
                  }}>
                  {i18n.t(k.DELIVER_NOW)}
                </Subtitle>
              </Button>
            </View>
          </View>
        ) : (
          <View styleName="fill-parent" style={styles.menuList}>
            {this.props.tabNames.length > 0 ? (
              <View
                styleName="vertical"
                style={{
                  flex: 1,
                }}>
                <DummyLoader
                  visibilty={this.state.progressView}
                  center={
                    // <FlatList
                    //   extraData={this.state}
                    //   data={this.props.tabNames}
                    //   initialScrollIndex={this.state.clickedPos}
                    //   keyExtractor={(item, index) => index.toString()}
                    //   nestedScrollEnabled={true}
                    //   showsHorizontalScrollIndicator={false}
                    //   showsVerticalScrollIndicator={false}
                    //   ItemSeparatorComponent={() => {
                    //     return <View style={styles.listserviceItemDivider} />;
                    //   }}
                    //   renderItem={({item, index}) => (
                    //     <AccordationItem
                    //       index={index}
                    //       item={item}
                    //       size={this.props.tabNames.length}
                    //       clickedItem={this.menuItemClicked}
                    //       clickedCat={this.state.currentCat}
                    //       accordClick={() => this.accordClick(item.cat)}
                    //       clickedItemPos={this.state.clickedItemPos}
                    //     />
                    //   )}
                    // />
                    <View>
                      {this.state.selectionData.length > 0
                        ? this.state.selectionData.map(item => {
                            return item;
                          })
                        : null}
                    </View>
                  }
                />
              </View>
            ) : null}
          </View>
        )}

        {this.state.showAlert ? (
          <AlertDialog
            isShow={true}
            title={this.state.alertTitle}
            content={this.state.alertContent}
            callbacks={() => this.hideAlert()}
            flexChanged={this.state.flexChanged}
          />
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  menuList: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  servicedesc: {
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  servicetitle: {
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  serviceImage: {
    width: 65,
    height: 65,
    borderTopEndRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopStartRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomStartRadius: 8,
    borderBottomEndRadius: 8,
    borderBottomLeftRadius: 8,
  },
  serviceImageCard: {
    marginEnd: sizeWidth(4),
    width: 65,
    height: 65,
    borderTopRightRadius: 8,
    borderTopStartRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomStartRadius: 8,
    borderBottomEndRadius: 8,
    borderBottomLeftRadius: 8,
  },
  listserviceItemDivider: {
    backgroundColor: '#d9d9d9',
    height: 1,
  },
  listserviceacc: {paddingVertical: sizeHeight(1.5)},
  listservicedivider: {
    height: 1,
    backgroundColor: '#dedede',
  },
  listService: {
    fontFamily: i18n.t(k.RUBIK),
    fontSize: 16,
    fontWeight: i18n.t(k._31),
    lineHeight: 20,
    marginStart: sizeWidth(3),
  },
  triangleCorner: {
    position: i18n.t(k.ABSOLUTE),
    right: 0,
    height: sizeHeight(10),
    borderStyle: 'solid',
    borderRightWidth: sizeWidth(16),
    borderBottomWidth: sizeHeight(10),
    borderRightColor: 'red',
    borderBottomColor: 'transparent',
    borderTopEndRadius: 8,
  },

  inputStyle: {
    borderRadius: 2,
    borderColor: i18n.t(k.DEDEDE1),
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: i18n.t(k.FFFFFF),
    color: i18n.t(k._57),
    fontFamily: i18n.t(k.RUBIK),
    fontSize: 24,
    height: 56,
    marginBottom: sizeHeight(2),
    marginHorizontal: sizeWidth(8),
    fontWeight: i18n.t(k._58),
  },

  buttonStyle: {
    //position:'absolute',
    //flex:1,
    width: i18n.t(k._5),
    height: 48,
    alignItems: i18n.t(k.CENTER),
    backgroundColor: i18n.t(k.DACCF),
    borderRadius: 0,
    alignSelf: i18n.t(k.CENTER),
    justifyContent: i18n.t(k.CENTER),
  },
});
