import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  ScrollView,
  BackHandler,
  FlatList,
  TouchableWithoutFeedback,
  Linking,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  List,
  TextInput,
  Colors,
  FAB,
  Avatar,
  Button,
  Portal,
  Modal,
  Card,
} from 'react-native-paper';
import {
  Divider,
  Heading,
  Image,
  NavigationBar,
  Screen,
  TouchableOpacity,
  View,
  Subtitle,
  Title,
} from '@shoutem/ui';
import * as Helper from './../util/Helper';
import * as Pref from './../util/Pref';
import {Loader} from './Loader';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import DummyLoader from './../util/DummyLoader';
import NavigationActions from '../util/NavigationActions';
import Lodash from 'lodash';
import {SafeAreaView} from 'react-navigation';

let itemDelete = null;

export default class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.editClick = this.editClick.bind(this);
    this.renderRowSug = this.renderRowSug.bind(this);
    this.renderRowCardsList = this.renderRowCardsList.bind(this);
    this.saveCardsData = this.saveCardsData.bind(this);
    this.backClick = this.backClick.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.state = {
      progressView: false,
      fullNameInput: i18n.t(k._4),
      fullAddressInput: i18n.t(k._4),
      infoResult: [],
      isEdit: true,
      tokenout: '',
      smp: false,
      citiesList: [],
      cloneList: [],
      showCards: false,
      cardList: [],
      showDelete: false,
      langcode: 'HE',
      languageList: [
        {name: i18n.t(k.helang), code: 'he'},
        {name: i18n.t(k.arlang), code: 'ar'},
      ],
      showlanguageList: false,
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
      this.setState({progressView: true});
      this.fetchAllInfo();
    });
  }

  backClick = () => {
    if (this.state.showCards) {
      this.setState({showCards: false, cardList: []});
      return true;
    } else if (this.state.showlanguageList) {
      this.setState({showCards: false, showlanguageList: false});
      return true;
    }
    return false;
  };

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backClick);
    if (this.focusListener !== undefined) {
      this.focusListener.remove();
    }
    if (this.willfocusListener !== undefined) {
      this.willfocusListener.remove();
    }
  }

  /**
   * Fetch All info
   */
  fetchAllInfo() {
    Pref.getVal(Pref.bearerToken, value => {
      const token = Helper.removeQuotes(value);
      Helper.networkHelperToken(
        Pref.GetInfoUrl,
        Pref.methodGet,
        token,
        result => {
          var details = JSON.parse(JSON.stringify(result));
          Pref.setVal(Pref.CustData, details);
          const fullName = result.firstname + ' ' + result.lastname;
          const {address} = result;
          let addressx = '';
          let city = i18n.t(k._4);
          if (address.includes('@')) {
            const sp = address.split('@');
            addressx = sp[0];
            city = sp[1];
          } else {
            addressx = address;
          }
          Pref.getVal(Pref.citySave, value => {
            city = Helper.removeQuotes(value);
            this.setState({
              smp: false,
              isEdit: true,
              progressView: false,
              infoResult: details,
              tokenout: token,
              fullNameInput: fullName,
              fullAddressInput: addressx,
              city: city,
            });
          });
        },
        error => {},
      );
    });

    Pref.getVal(Pref.langCode, code => {
      if (code !== undefined && code !== null && code !== '') {
        const langcode = String(Helper.removeQuotes(code)).toUpperCase();
        if (langcode !== '' && langcode.length > 0) {
          this.setState({langcode: langcode});
        }
      }
    });

    Pref.getVal(Pref.cardList, value => {
      const val = JSON.parse(value);
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

  editClick = () => {
    if (this.state.isEdit) {
      this.setState({smp: true});
      const split = this.state.fullNameInput.split(' ');
      let add = this.state.fullAddressInput;
      if (this.state.city != '') {
        add += '@' + this.state.city;
      }
      const data = JSON.stringify({
        firstname: split[0],
        lastName: split[1],
        address: add,
        lang: this.state.langcode,
      });

      Pref.setVal(Pref.citySave, this.state.city);
      Helper.networkHelperTokenPost(
        Pref.UpdateUserProfile,
        data,
        Pref.methodPut,
        this.state.tokenout,
        result => {
          //alert(result);
          this.fetchAllInfo();
          //this.setState({ smp: false, isEdit: true, });
        },
        error => {
          this.setState({isEdit: true, smp: false});
        },
      );
    } else {
      this.setState({isEdit: true, smp: false});
    }
  };

  fetchCities(value) {
    this.setState({city: value, citiesList: []});
    if (value !== '') {
      Helper.networkHelperTokenPost(
        Pref.GetDeliveryListItemAutoCompleteSearchUrl,
        JSON.stringify({
          input: value,
        }),

        Pref.methodPost,
        this.state.tokenout,
        result => {
          this.setState({citiesList: result});
          console.log(result);
        },
        error => {},
      );
    }
  }

  renderRowSug(item, index) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'flex-start',
          alignSelf: 'flex-start',
          justifyContent: 'flex-start',
          marginVertical: sizeHeight(1),
          marginHorizontal: sizeWidth(6),
          width: '100%',
        }}>
        <TouchableWithoutFeedback
          style={{
            backgroundColor: 'transparent',
          }}
          onPress={() => {
            this.setState({city: item.name, citiesList: []});
          }}>
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

  deleteCard(item, index) {
    itemDelete = item;
    this.setState({showDelete: true});
  }

  saveModal = () => {
    if (itemDelete !== null) {
      const {cardList} = this.state;
      //console.log(`itemDelete`, itemDelete)
      const find = Lodash.find(cardList, ix => ix.id === itemDelete.id);
      if (find !== undefined) {
        const filter = Lodash.filter(cardList, io => io.id !== itemDelete.id);
        //console.log(`filter`, filter)
        this.setState({showDelete: false, cardList: filter}, () => {
          Pref.setVal(Pref.cardList, filter);
          itemDelete = null;
        });
      }
    }
  };

  renderRowCardsList(item, index) {
    const image = item.creditCardImage || `${Pref.VisaCardImage}card.png`;
    return (
      <View
        styleName="horizontal space-between"
        style={{marginHorizontal: sizeWidth(3)}}>
        <View
          style={{
            flexDirection: 'row',
            alignContent: 'flex-start',
            alignSelf: 'flex-start',
            justifyContent: 'flex-start',
            marginVertical: sizeHeight(1),
            marginStart: sizeWidth(2),
            borderColor: '#dedede',
            borderWidth: 0.5,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 4,
          }}>
          <Title
            styleName="v-start h-start "
            style={{
              color: 'black',
              fontFamily: 'Rubik',
              fontSize: 15,
              fontWeight: '400',
              alignSelf: 'center',
            }}>
            {`${i18n.t(k.cardsavedtextendwith)}-${item.name}`}
          </Title>
          <Image
            source={{uri: `${image}`}}
            //name="credit-card"
            //size={32}
            //color={"#646464"}
            style={{
              //tintColor: '#646464',
              padding: 4,
              marginStart: 8,
              backgroundColor: 'transparent',
              alignSelf: 'center',
              justifyContent: 'center',
              height: 24,
              width: 24,
            }}
          />
          {/* <Icon
            name="credit-card"
            size={24}
            color={"#646464"}
            style={{
              marginStart: 8,
              padding: 4,
              backgroundColor: "transparent",
            }}
          /> */}
        </View>
        <TouchableWithoutFeedback onPress={() => this.deleteCard(item, index)}>
          <Image
            source={require('./../res/images/delete.png')}
            style={{
              width: 14,
              height: 17,
              tintColor: Colors.red500,
              alignSelf: 'center',
              marginEnd: sizeWidth(2),
            }}
          />
        </TouchableWithoutFeedback>
      </View>
    );
  }

  saveCardsData = () => {
    this.setState({
      showCards: false,
      //cardList: [],
    });
  };

  changelang = item => {
    const {code} = item;
    this.setState(
      {showlanguageList: false, langcode: String(code).toUpperCase()},
      () => {
        this.editClick();
        Pref.setVal(Pref.langCode, code);
        i18n.changeLanguage(code);
      },
    );
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
            rightComponent={
              <TouchableWithoutFeedback
                onPress={() => this.setState({showlanguageList: true})}>
                <Subtitle
                  styleName={i18n.t(k.V_CENTER_H_CENTER)}
                  style={{
                    fontSize: 18,
                    marginEnd: 16,
                  }}>
                  {`שינוי שפה`}
                </Subtitle>
              </TouchableWithoutFeedback>
            }
            leftComponent={
              <View
                styleName="horizontal space-between"
                style={{marginStart: 12}}>
                {/* <TouchableOpacity
                onPress={() => Helper.itemClick(this.props, "Home")}
               >
                <Icon
                  name="arrow-forward"
                  size={24}
                  color="black"
                  style={{
                    padding: 4,
                    backgroundColor: "transparent"
                  }}
                />
                פרופיל
               </TouchableOpacity> */}
                <Heading
                  style={{
                    fontSize: 20,
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                  }}>
                  {`${i18n.t(k._84)}`}
                </Heading>
              </View>
            }
          />

          <ScrollView
            keyboardShouldPersistTaps={'handled'}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <DummyLoader
              visibilty={this.state.progressView}
              center={
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : ''}
                  style={{flex: 1}}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      Keyboard.dismiss();
                    }}>
                    <View
                      styleName="vertical"
                      style={{marginHorizontal: sizeWidth(1)}}>
                      <Subtitle
                        style={{
                          color: '#292929',
                          fontSize: 14,
                          alignSelf: 'flex-start',
                          marginHorizontal: sizeWidth(4),
                        }}>
                        {i18n.t(k._85)}
                      </Subtitle>
                      <TextInput
                        style={[
                          styles.inputStyle,
                          {
                            marginBottom: sizeHeight(1),
                          },
                        ]}
                        mode={'flat'}
                        password={false}
                        onChangeText={text =>
                          this.setState({fullNameInput: text})
                        }
                        value={this.state.fullNameInput}
                        returnKeyType="next"
                        numberOfLines={1}
                        underlineColor={'transparent'}
                        underlineColorAndroid={'transparent'}
                      />

                      <Subtitle
                        style={{
                          color: '#292929',
                          fontSize: 14,
                          alignSelf: 'flex-start',
                          marginHorizontal: sizeWidth(4),
                        }}>
                        {i18n.t(k._52)}
                      </Subtitle>
                      <TextInput
                        style={[
                          styles.inputStyle,
                          {
                            marginVertical: sizeHeight(1),
                          },
                        ]}
                        mode={'flat'}
                        disabled={!this.state.isEdit}
                        password={false}
                        onChangeText={text =>
                          this.setState({fullAddressInput: text})
                        }
                        value={this.state.fullAddressInput}
                        returnKeyType="done"
                        numberOfLines={1}
                        underlineColor={'transparent'}
                        underlineColorAndroid={'transparent'}
                      />

                      <Subtitle
                        style={{
                          color: '#292929',
                          fontSize: 14,
                          alignSelf: 'flex-start',
                          marginHorizontal: sizeWidth(4),
                        }}>{`${i18n.t(k._14)}`}</Subtitle>
                      <TextInput
                        style={[
                          styles.inputStyle,
                          {
                            marginVertical: sizeHeight(1),
                          },
                        ]}
                        mode={'flat'}
                        password={false}
                        value={this.state.city}
                        onChangeText={value => this.fetchCities(value)}
                        returnKeyType="done"
                        numberOfLines={1}
                        underlineColor={'transparent'}
                        underlineColorAndroid={'transparent'}
                      />

                      {this.state.citiesList.length > 0 ? (
                        <View
                          style={{
                            flexGrow: 1,
                            flexWrap: 'wrap',
                            marginVertical: sizeHeight(2),
                          }}>
                          <FlatList
                            //extraData={this.state}
                            showsVerticalScrollIndicator={true}
                            showsHorizontalScrollIndicator={false}
                            data={this.state.citiesList}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps={'handled'}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item: item, index}) =>
                              this.renderRowSug(item, index)
                            }
                          />
                        </View>
                      ) : null}

                      <Subtitle
                        style={{
                          color: '#292929',
                          fontSize: 14,
                          alignSelf: 'flex-start',
                          marginHorizontal: sizeWidth(4),
                        }}>
                        {i18n.t(k._51)}
                      </Subtitle>
                      <TextInput
                        style={[
                          styles.inputStyle,
                          {
                            marginVertical: sizeHeight(1),
                          },
                        ]}
                        mode={'flat'}
                        editable={false}
                        password={false}
                        disabled={true}
                        value={this.state.infoResult.phone}
                        returnKeyType="done"
                        numberOfLines={1}
                        underlineColor={'transparent'}
                        underlineColorAndroid={'transparent'}
                      />

                      <View
                        style={{
                          marginTop: sizeHeight(2),
                          flexDirection: 'column',
                        }}>
                        <TouchableWithoutFeedback
                          onPress={() => this.setState({showCards: true})}>
                          <View
                            style={{
                              width: '40%',
                              marginStart: 16,
                              paddingVertical: 8,
                              backgroundColor: i18n.t(k.DACCF),
                              borderRadius: 0,
                              alignItems: 'center',
                              alignContent: 'center',
                              borderRadius: 4,
                            }}>
                            <Subtitle
                              style={{
                                color: 'white',
                                fontSize: 14,
                                alignSelf: 'center',
                                padding: 4,
                                justifyContent: 'center',
                              }}>
                              {`${i18n.t(k.methodsofPayment)}`}
                            </Subtitle>
                          </View>
                        </TouchableWithoutFeedback>
                      </View>

                      <View
                        style={{
                          marginVertical: sizeHeight(2),
                          flexDirection: 'column',
                        }}>
                        <Subtitle
                          styleName="md-gutter"
                          style={{
                            color: '#292929',
                            fontSize: 14,
                            alignSelf: 'flex-start',
                            marginVertical: sizeHeight(0.5),
                          }}>
                          {`${i18n.t(k._86)}`}
                        </Subtitle>
                        <TouchableWithoutFeedback
                          onPress={() =>
                            Linking.openURL('https://bit.ly/callittos')
                          }>
                          <Subtitle
                            styleName="md-gutter"
                            style={{
                              color: Colors.blue500,
                              fontSize: 14,
                              alignSelf: 'flex-start',
                              marginVertical: sizeHeight(0),
                              textDecorationLine: 'underline',
                            }}>{`${i18n.t(k._87)}`}</Subtitle>
                        </TouchableWithoutFeedback>
                      </View>

                      {/* <View style={{
                  height: 1,
                  backgroundColor: '#dedede', marginVertical: sizeHeight(2), marginHorizontal: sizeWidth(4)
                 }} />
                 <Subtitle style={{ color: '#292929', fontSize: 14, alignSelf: 'flex-start', marginHorizontal: sizeWidth(4) }}>Card Name</Subtitle>
                 <TextInput
                  style={[styles.inputStyle, {
                    marginVertical: sizeHeight(1),
                  }]}
                  mode={"flat"}
                  password={false}
                  returnKeyType="next"
                  numberOfLines={1}
                  underlineColor={"transparent"}
                  underlineColorAndroid={"transparent"}
                 />
                  <Subtitle style={{ color: '#292929', fontSize: 14, alignSelf: 'flex-start', marginHorizontal: sizeWidth(4) }}>Card Number</Subtitle>
                 <TextInput
                  style={[styles.inputStyle, {
                    marginVertical: sizeHeight(1),
                  }]}
                  mode={"flat"}
                  password={false}
                  returnKeyType="next"
                  numberOfLines={1}
                  underlineColor={"transparent"}
                  underlineColorAndroid={"transparent"}
                 />
                  <Subtitle style={{ color: '#292929', fontSize: 14, alignSelf: 'flex-start', marginHorizontal: sizeWidth(4) }}>CVV Number</Subtitle>
                  <TextInput
                  style={[styles.inputStyle, {
                    marginTop: sizeHeight(1),
                  }]}
                  mode={"flat"}
                  password={true}
                  secureTextEntry={true}
                  returnKeyType="next"
                  numberOfLines={1}
                  underlineColor={"transparent"}
                  underlineColorAndroid={"transparent"}
                 /> */}
                    </View>
                  </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
              }
            />
          </ScrollView>

          <Portal>
            <Modal
              dismissable={true}
              onDismiss={() =>
                this.setState({
                  showCards: false,
                  //cardList: [],
                })
              }
              visible={this.state.showCards}
              contentContainerStyle={{
                height: i18n.t(k._5),
              }}>
              <View
                style={{
                  flex: 1,
                }}>
                {/* <ScrollView contentContainerStyle={{ flexGrow: 1}}> */}
                <View style={{flex: 0.1}} />
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
                            showCards: false,
                            //cardList: [],
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
                        styleName="md-gutter"
                        style={{
                          color: '#292929',
                          fontSize: 16,
                          alignSelf: 'center',
                          fontWeight: '700',
                        }}>
                        {`${i18n.t(k.cardreturnprofile)}`}
                      </Subtitle>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 0.75,
                      backgroundColor: 'white',
                      flexDirection: 'column',
                      marginTop: 4,
                    }}>
                    <DummyLoader
                      visibilty={this.state.progressView}
                      style={{width: '100%', flexBasis: 1}}
                      center={
                        this.state.cardList.length > 0 ? (
                          <FlatList
                            extraData={this.state}
                            nestedScrollEnabled={true}
                            style={{
                              marginStart: sizeWidth(3),
                              backgroundColor: 'white',
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
                              fontSize: 14,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              marginVertical: sizeHeight(0.5),
                            }}>
                            {`${i18n.t(k.nosavedcardfound)}`}
                          </Subtitle>
                        )
                      }
                    />
                    {this.state.cardList.length > 0 ? (
                      <View
                        style={{marginTop: 4}}
                        styleName="v-center h-center">
                        <Subtitle
                          style={{
                            color: '#646464',
                            fontSize: 12,
                            alignSelf: 'center',
                            marginVertical: sizeHeight(0.5),
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
                            marginTop: 2,
                            //tintColor: '#777777',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            padding: 8,
                          }}
                        />
                      </View>
                    ) : null}
                  </View>
                  <View style={{flex: 0.05, backgroundColor: 'white'}} />
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
                            {`${i18n.t(k.savecardsbutton)}`}
                          </Subtitle>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{flex: 0.1}} />
              </View>
            </Modal>
          </Portal>

          <Portal>
            <Modal
              dismissable={true}
              visible={this.state.showDelete}
              onDismiss={() => this.setState({showDelete: false})}>
              <View
                styleName="vertical sm-gutter"
                style={{
                  backgroundColor: 'white',
                  marginHorizontal: sizeWidth(6),
                  flexDirection: 'column',
                }}>
                <Subtitle
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    alignSelf: 'center',
                    fontSize: 15,
                    fontWeight: '700',
                    paddingVertical: 16,
                  }}>{`${i18n.t(k.deletecardsure)}`}</Subtitle>
                <Button
                  styleName=" muted border"
                  mode={'contained'}
                  uppercase={true}
                  dark={true}
                  style={[
                    styles.loginButtonStyle,
                    {marginVertical: 0, marginHorizontal: sizeWidth(3)},
                  ]}
                  onPress={this.saveModal}>
                  <Subtitle style={{color: 'white'}}>{`${i18n.t(
                    k.cardyes,
                  )}`}</Subtitle>
                </Button>
                <TouchableWithoutFeedback
                  onPress={() => this.setState({showDelete: false})}>
                  <Subtitle
                    style={{
                      marginTop: sizeHeight(1.5),
                      color: '#292929',
                      fontFamily: 'Rubik',
                      alignSelf: 'center',
                      fontSize: 15,
                      paddingBottom: 8,
                    }}>{`${i18n.t(k.cardno)}`}</Subtitle>
                </TouchableWithoutFeedback>
              </View>
            </Modal>
          </Portal>
          <Button
            styleName=" muted border"
            mode={'contained'}
            uppercase={true}
            dark={true}
            loading={false}
            style={[styles.loginButtonStyle]}
            onPress={this.editClick}>
            <Subtitle
              style={{
                color: 'white',
              }}>
              {i18n.t(k._88)}
            </Subtitle>
          </Button>
          <Loader isShow={this.state.smp} />
          {this.state.showlanguageList === true ? (
            <Card
              elevation={3}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                marginTop: sizeHeight(7),
                paddingEnd: 16,
                marginStart: 16,
                marginEnd: 16,
                width: '40%',
                minHeight: 106,
                justifyContent: 'flex-start',
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
    height: sizeHeight(8),
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: i18n.t(k.FFFFFF),
    marginHorizontal: sizeWidth(4),
    color: i18n.t(k._2),
    fontFamily: i18n.t(k.RUBIK),
    fontSize: 16,
    fontWeight: i18n.t(k._31),
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
  listservicedivider: {
    height: 0.8,
    backgroundColor: '#dedede',
    width: '100%',
  },
});
