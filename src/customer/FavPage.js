import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  View,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {
  Heading,
  Image,
  NavigationBar,
  Screen,
  Subtitle,
  Title,
} from '@shoutem/ui';
import DummyLoader from '../util/DummyLoader';
import * as Pref from './../util/Pref';
import * as Helper from './../util/Helper';
import NavigationActions from '../util/NavigationActions';
import {sizeHeight, sizeWidth} from './../util/Size';
import * as Lodash from 'lodash';
import {Card} from 'react-native-paper';
import {EmptyMessage} from './EmptyMessage';
import {SafeAreaView} from 'react-navigation';

var now = new Date().getDay();

/**
 * Fav page
 */
export default class FavPage extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.state = {
      progressView: false,
      searchVisibility: false,
      clone: [],
      favList: [],
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
      (e) => {
        //error
        console.log(e)
      },
    );
  }


  /**
   * Fetch All fav Data
   */
  fetchFavData() {
    Pref.getVal(Pref.favData, value => {
      const parsjson = JSON.parse(value);
      const reverseList = Lodash.reverse(parsjson);
      this.setState({
        progressView: false,
        favList: reverseList,
        clone: reverseList,
      });
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

  renderRow(item) {
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
                      {this.parsetime(item.businessHours)}
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
                    renderItem={({item: item, index}) => this.renderRow(item)}
                  />
                ) : (
                  <EmptyMessage message={i18n.t(k._3)} />
                )
              }
            />
          </View>
        </Screen>
      </SafeAreaView>
    );
  }
}
