import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  FlatList,
  StatusBar,
  View,
  AppState,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {
  Heading,
  NavigationBar,
  Row,
  Screen,
  Subtitle,
  Title,
} from '@shoutem/ui';
import {Card} from 'react-native-paper';
import DummyLoader from '../util/DummyLoader';
import NavigationActions from '../util/NavigationActions';
import * as Pref from './../util/Pref';
import * as Helper from './../util/Helper';
import {sizeHeight, sizeWidth} from './../util/Size';
import PushNotificationAndroid from 'react-native-push-android';
import Lodash from 'lodash';
import {EmptyMessage} from './EmptyMessage';
import {SafeAreaView} from 'react-navigation';
import {Notifications} from 'react-native-notifications';

export default class OrdersPage extends React.Component {
  constructor(props) {
    super(props);
    this.findBranchName = this.findBranchName.bind(this);
    this._notificationEvent = null;
    this.renderRow = this.renderRow.bind(this);
    this.extraRow = this.extraRow.bind(this);
    this.state = {
      selectedTab: 0,
      selected: 0,
      progressView: false,
      tabNames: ['History', 'Orders'],
      eachTabData: [],
      historyData: [],
      clonedata: [],
      selectedMode: true,
      branches: [],
      appstate: AppState.currentState,
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this.willfocusListener = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({progressView: true});
      },
    );
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.setState({progressView: true});
      this.fetchAllOrder();
    });

    if (Platform.OS === 'ios') {
      Notifications.registerRemoteNotifications();

      Notifications.events().registerNotificationReceivedForeground(
        (notification, completion) => {
          this.fetchAllOrder();
          completion({alert: false, sound: true, badge: false});
        },
      );

      Notifications.events().registerNotificationOpened(
        (notification, completion) => {
          this.fetchAllOrder();
          completion();
        },
      );
    } else {
      PushNotificationAndroid.getInitialNotification().then(() => {
        ////console.log("getInitialNotification => ", initial);
      });
      this._notificationEvent = PushNotificationAndroid.addEventListener(
        'notification',
        details => {
          console.log('notifyOrder', details);
          PushNotificationAndroid.notify(details);
          this.fetchAllOrder();
        },
      );
    }
  }

  _handleAppStateChange = async nextAppState => {
    const {appState} = this.state;
    if (appState === 'active') {
      // do this
    } else if (appState === 'background') {
      // do that
      this.setState({progressView: true});
      this.fetchAllOrder();
    } else if (appState === 'inactive') {
      // do that other thing
    }

    this.setState({appState: nextAppState});
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    if (this.focusListener !== undefined) {
      this.focusListener.remove();
    }
    if (this.willfocusListener !== undefined) {
      this.willfocusListener.remove();
    }
    if (this._notificationEvent !== undefined) {
      this._notificationEvent.remove();
    }
  }

  backClick = () => {
    //////console.log('back', 'OrdersPage');
    NavigationActions.goBack();
    return false;
  };

  setTab = selectedTab => {
    this.setState({selectedTab});
  };

  /**
   * Fetch All Order
   */
  fetchAllOrder() {
    Pref.getVal(Pref.bearerToken, value => {
      const token = Helper.removeQuotes(value);
      Helper.networkHelperToken(
        Pref.GetOrdersUrl,
        Pref.methodGet,
        token,
        result => {
          const sumclone = result.order_Bs;
          const sumcloneH = result.order_history;
          const branches = result.branches;
          let boolm = this.state.selectedMode;
          const opFinalOrders = Helper.orderData(sumclone, branches, true);
          const opFinalOrdersHistory = Helper.orderData(
            sumcloneH,
            branches,
            false,
          );
          this.setState({
            branches: result.branches,
            progressView: false,
            eachTabData: boolm ? opFinalOrders : opFinalOrdersHistory,
            historyData: opFinalOrdersHistory,
            clonedata: opFinalOrders,
          });
        },
        () => {
          this.setState({progressView: false});
        },
      );
    });
  }

  findBranchName = val => {
    const ty = Lodash.find(this.state.branches, {idbranch: val});
    if (ty != null && ty !== undefined) {
      return ty.name;
    } else {
      return '';
    }
  };

  extraRow(eachTabData) {
    return (
      <Row styleName="vertical" styleName="small">
        <View styleName="vertical">
          <View styleName="horizontal space-between">
            <Title
              styleName="bold"
              style={{
                color: '#292929',
                fontFamily: 'Rubik',
                fontSize: 16,
                fontWeight: '400',
                lineHeight: 20,
              }}>
              {Lodash.capitalize(eachTabData.category)}
            </Title>
            <Title
              styleName="bold"
              style={{
                color: '#292929',
                fontFamily: 'Rubik',
                fontSize: 16,
                fontWeight: '700',
                lineHeight: 20,
              }}>
              {eachTabData.price}
              {i18n.t(k._66)}
            </Title>
          </View>
          <View styleName="horizontal space-between">
            <Subtitle
              styleName="multiline"
              style={{
                color: '#292929',
                fontFamily: 'Rubik',
                fontSize: 14,
                fontWeight: '400',
                lineHeight: 20,
              }}>
              {Lodash.capitalize(eachTabData.name)}
            </Subtitle>
          </View>
        </View>
      </Row>
    );
  }

  renderRow(item) {
    return (
      <View
        style={{
          flexDirection: 'column',
          marginHorizontal: sizeWidth(5),
          marginVertical: sizeHeight(2),
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            let oo = item;
            //	oo.businessName = this.findBranchName(item.fkbranchO);
            const arry = [];
            arry.push(oo);
            //Pref.setVal(Pref.DummyLoaderData, arry);
            NavigationActions.navigate('TrackOrder', {item: arry});
          }}>
          <Card
            style={{
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
            {/* <Image
                     styleName="medium-square"
                     //source={{ uri: `http://192.236.162.188/${item.imageurl}` }}
                     source={{ uri: 'https://picsum.photos/700' }}
                     style={{
                     	width:'100%',
                     	borderTopLeftRadius: 8,
                     	borderTopEndRadius: 8,
                     	borderTopRightRadius: 8,
                     	borderTopStartRadius: 8,
                     }}
                     /> */}
            <View
              style={{
                flexDirection: 'column',
                marginTop: 8,
                marginStart: 8,
                marginBottom: 8,
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
                {item.title}
              </Title>
              <View style={{flexDirection: 'column', flex: 1}}>
                {item.data !== null &&
                item.data !== undefined &&
                item.data.length > 0
                  ? item.data.map((ele, index) => {
                      return index < 3 ? (
                        <Subtitle
                          styleName="bold"
                          style={{
                            color: '#292929',
                            fontFamily: 'Rubik',
                            fontSize: 15,
                            alignSelf: 'flex-start',
                            fontWeight: '400',
                          }}>
                          {`${Lodash.capitalize(ele.serviceName)}  ${
                            ele.quantity
                          }x`}
                        </Subtitle>
                      ) : null;
                    })
                  : null}
              </View>
              {/* {item.extras != null && item.extras !== undefined && item.extras.length > 0 ? <List.Accordion title={'Extras'} titleStyle={{
                        fontFamily: 'Rubik',
                        fontSize: 16,
                        fontWeight: '400',
                        marginHorizontal: 1,
                        }} style={{ marginVertical: -12, marginHorizontal: -12 }} >
                        <FlatList
                        extraData={this.state}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        data={item.extras}
                        nestedScrollEnabled={true}
                        ItemSeparatorComponent={() => {
                        	return <View style={{
                        		backgroundColor: '#d9d9d9',
                        		height: 1,
                        	}} />
                        }}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item: eachTabData, index }) =>
                        	this.extraRow(eachTabData, index)
                        }
                        />
                        </List.Accordion> : null} */}
              {/* <Title styleName='bold' style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        fontSize: 14,
                        marginTop: 8,
                        marginHorizontal: sizeWidth(3),
                        alignSelf: 'flex-start',
                        fontWeight: '400',
                        }}>{`${item.quantity} :Quantity`}</Title>
                        {item.extras != null && item.extras !== undefined && item.extras.length > 0 ? <Title styleName='bold' style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        fontSize: 14,
                        marginHorizontal: sizeWidth(3),
                        alignSelf: 'flex-start',
                        fontWeight: '400',
                        }}>{`${item.extras.length} :Extra Quantity`}</Title> : null} */}
              {/* {item.message !== "" && item.message !== null && item.message !== undefined ?<Subtitle style={{
                        color: '#292929',
                        fontFamily: 'Rubik',
                        alignSelf: 'flex-start',
                        fontSize: 14,
                        }}>{`${item.message} :Message`}</Subtitle> : null} */}
              <Subtitle
                style={{
                  color: '#292929',
                  fontFamily: 'Rubik',
                  alignSelf: 'flex-start',
                  fontSize: 14,
                  fontWeight: '400',
                }}>
                {`${i18n.t(k._74)} `}
                <Subtitle
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    alignSelf: 'flex-start',
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                  {`${i18n.t(k._6)}${item.totalPrice}`}
                </Subtitle>
              </Subtitle>
              <Subtitle
                style={{
                  color: '#6DC124',
                  fontFamily: 'Rubik',
                  alignSelf: 'flex-start',
                  fontSize: 14,
                }}>
                {item.paid !== 0 ? `${i18n.t(k._75)}` : `${i18n.t(k._76)}`}
              </Subtitle>
              <View
                style={{
                  height: 1,
                  marginEnd: 6,
                  backgroundColor: '#dedede',
                  marginVertical: sizeHeight(0.5),
                }}
              />

              <Subtitle
                style={{
                  color: '#C18D24',
                  fontFamily: 'Rubik',
                  alignSelf: 'flex-start',
                  fontSize: 12,
                  paddingVertical: 2,
                }}>
                {item.status === -1
                  ? `${i18n.t(k.cancelText)}`
                  : item.status === 1
                  ? `${i18n.t(k._77)}`
                  : item.status === 2
                  ? i18n.t(k._78)
                  : item.status === 3
                  ? item.isdelivery === 0
                    ? `${i18n.t(k.difff)}`
                    : `${i18n.t(k.deliveryText)}`
                  : `${i18n.t(k.orderdoneText)}`}
              </Subtitle>
            </View>
          </Card>
        </TouchableWithoutFeedback>
      </View>
    );
  }

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
          <NavigationBar
            styleName="inline no-border"
            leftComponent={
              <View style={{marginStart: 12}}>
                <Heading
                  style={{
                    fontSize: 20,
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                  }}>
                  {i18n.t(k._79)}
                </Heading>
              </View>
            }
            // rightComponent={
            // 	<View style={{ flexDirection: 'row', marginEnd: sizeWidth(1) }}>
            // 		<TouchableOpacity onPress={() =>{}}>
            // 			<Image source={require('./../res/images/search.png')}
            // 				style={{ width: 24, height: 24, marginEnd: 16, }}
            // 			/>
            // 		</TouchableOpacity>
            // 		{/* <TouchableOpacity onPress={() => {}}>
            // 			<Image source={require('./../res/images/menu.png')}
            // 				style={{ width: 24, height: 24, }}
            // 			/>
            // 		</TouchableOpacity> */}
            // 	</View>
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
          />

          <View
            style={{
              flexDirection: 'row',
              borderRadius: 1,
              borderColor: '#dedede',
              borderStyle: 'solid',
              borderWidth: 1,
              marginTop: sizeHeight(1.5),
              marginHorizontal: sizeWidth(5),
              height: sizeHeight(9),
            }}>
            <TouchableWithoutFeedback
              onPress={() =>
                this.setState({
                  selectedMode: true,
                  eachTabData: this.state.clonedata,
                })
              }>
              <View
                style={{
                  flex: 0.5,
                  backgroundColor: this.state.selectedMode
                    ? '#5EBBD7'
                    : 'white',
                  alignContent: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Title
                  styleName="bold"
                  style={{
                    color: this.state.selectedMode ? 'white' : '#777777',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    fontWeight: '700',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                  }}>
                  {`${i18n.t(k._80)}`}
                </Title>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              onPress={() =>
                this.setState({
                  selectedMode: false,
                  eachTabData: this.state.historyData,
                })
              }>
              <View
                style={{
                  flex: 0.5,
                  backgroundColor: !this.state.selectedMode
                    ? '#5EBBD7'
                    : 'white',
                  alignContent: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Title
                  styleName="bold"
                  style={{
                    color: !this.state.selectedMode ? 'white' : '#777777',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                  {`${i18n.t(k._81)}`}
                </Title>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View
            style={{
              flex: 1,
              marginTop: sizeHeight(1),
            }}>
            <DummyLoader
              visibilty={this.state.progressView}
              center={
                this.state.eachTabData !== null &&
                this.state.eachTabData.length > 0 ? (
                  <FlatList
                    extraData={this.state}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    data={this.state.eachTabData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item: item}) => this.renderRow(item)}
                  />
                ) : (
                  <EmptyMessage
                    name={require(`./../res/images/choices.png`)}
                    message={
                      this.state.selectedMode ? i18n.t(k._82) : i18n.t(k._83)
                    }
                  />
                )
              }
            />
          </View>
        </Screen>
      </SafeAreaView>
    );
  }
}
