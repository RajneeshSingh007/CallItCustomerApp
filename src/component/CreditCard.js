import i18n from 'i18next';
import k from './../i18n/keys';
import React, {createRef} from 'react';
import {
  StyleSheet,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
    Title,
  Image,
  Subtitle,
  TouchableOpacity,
  View,
  ImageBackground,
} from '@shoutem/ui';
import {Checkbox, Portal, Modal} from 'react-native-paper';
import {sizeHeight, sizeWidth} from './../util/Size';
import MaskedInput from 'react-native-masked-input-text';
import DummyLoader from './../util/DummyLoader';

const CreditCard = props => {
  const {
    onDismiss = () => {},
    showcardAdd = false,
    submitBtnClick = () => {},
    checked = false,
    checkboxClick = () => {},
    backBtn = () => {},
    cardNumberChanged = (formatted, extracted) => {},
    cardnumber = '',
    cardyear = '',
    cardyYearChanged = (formatted, extracted) => {},
    cardcvv = '',
    cardCvvChanged = (formatted, extracted) => {},
    creditCardImage = '',
    selectedMode = false,
    terminalNumbers = '',
    cardClick = () => {},
    cashClick = () => {},
    progressView = false,
    cardList = [],
    cardSelect = (item, index) => {},
    showCardAddDialog = () => {},
  } = props;

  const cardyearRef = createRef();
  const cardnumberRef = createRef();
  const cardcvvRef = createRef();

  const renderRowCardsList = (item, index) =>{
    const image = item.creditCardImage || `${Pref.VisaCardImage}card.png`;
    return (
      <TouchableWithoutFeedback onPress={() => cardSelect(item, index)}>
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

  return (
    <>
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
        <TouchableWithoutFeedback onPress={cardClick}>
          <View
            style={{
              flex: 0.5,
              backgroundColor: selectedMode ? '#5EBBD7' : 'white',
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
                color: selectedMode ? 'white' : '#777777',
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
        <TouchableWithoutFeedback onPress={cashClick}>
          <View
            style={{
              flex: 0.5,
              flexDirection: 'row',
              backgroundColor: !selectedMode ? '#5EBBD7' : 'white',
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
                color: !selectedMode ? 'white' : '#777777',
                fontFamily: 'Rubik',
                fontSize: 16,
                fontWeight: '700',
              }}>
              {`${i18n.t(k._22)}`}
            </Title>
          </View>
        </TouchableWithoutFeedback>
      </View>
      {selectedMode ? (
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
              visibilty={progressView}
              style={{
                width: '100%',
                flexBasis: 1,
              }}
              center={
                cardList.length > 0 ? (
                  <FlatList
                    //extraData={this.state}
                    nestedScrollEnabled={true}
                    style={{
                      marginVertical: 8,
                    }}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={true}
                    data={cardList}
                    keyExtractor={(item, index) => `${index}`}
                    renderItem={({item, index}) =>
                      renderRowCardsList(item, index)
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
            <TouchableWithoutFeedback onPress={showCardAddDialog}>
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
      <Portal>
        <Modal
          dismissable={true}
          onDismiss={onDismiss}
          visible={showcardAdd}
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
                      <TouchableOpacity onPress={backBtn}>
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
                            <View styleName="fill-parent" style={{flex: 1}}>
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
                                  width: '100%',
                                  //marginEnd: sizeWidth(3),
                                  height: 36,
                                  alignItems: 'center',
                                  alignContent: 'center',
                                  justifyContent: 'space-between',
                                  borderRadius: 24,
                                }}>
                                <View
                                  style={{
                                    height: 36,
                                    flex: 1,
                                    backgroundColor: i18n.t(k.FFFFFF),
                                    borderRadius: 24,
                                    flexDirection: 'row-reverse',
                                    justifyContent: 'space-between',
                                    marginHorizontal: sizeWidth(5),
                                  }}>
                                  <MaskedInput
                                    innerRef={cardnumberRef}
                                    onChangeText={cardNumberChanged}
                                    mask={'0000 0000 0000 0000'}
                                    style={styles.cardnumber}
                                    placeholder={`xxxx xxxx xxxx xxxx`}
                                    underlineColor="transparent"
                                    underlineColorAndroid="transparent"
                                    keyboardType={'numeric'}
                                    value={cardnumber}
                                    onSubmitEditing={() => {
                                      if (
                                        cardyearRef !== undefined &&
                                        cardyearRef.current !== undefined
                                      ) {
                                        cardyearRef.current.focus();
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
                                        uri: `${creditCardImage}`,
                                      }}
                                      style={styles.cardimage}
                                    />
                                  </View>
                                </View>
                              </View>
                              <View style={{flex: 0.11}} />
                              <View style={styles.secondcontainer}>
                                <MaskedInput
                                  innerRef={cardcvvRef}
                                  onChangeText={cardCvvChanged}
                                  mask={'0000'}
                                  style={styles.cvv}
                                  placeholder={`xxx`}
                                  underlineColor="transparent"
                                  underlineColorAndroid="transparent"
                                  keyboardType={'numeric'}
                                  value={cardcvv}
                                />
                                <View style={{flex: 0.18}} />
                                <MaskedInput
                                  innerRef={cardyearRef}
                                  onChangeText={cardyYearChanged}
                                  mask={'00/00'}
                                  style={styles.year}
                                  placeholder={`MM/YY`}
                                  underlineColor="transparent"
                                  underlineColorAndroid="transparent"
                                  keyboardType={'numeric'}
                                  value={cardyear}
                                  onSubmitEditing={() => {
                                    if (
                                      cardcvvRef !== undefined &&
                                      cardcvvRef.current != undefined
                                    ) {
                                      cardcvvRef.current.focus();
                                    }
                                  }}
                                />
                              </View>
                              <View style={{flex: 0.12}} />
                            </View>
                          </ImageBackground>
                        </View>
                        <View style={{flex: 0.35, marginTop: -36}}>
                          <View style={styles.checkbox}>
                            <Checkbox.Android
                              status={
                                checked
                                  ? i18n.t(k.CHECKED)
                                  : i18n.t(k.UNCHECKED)
                              }
                              onPress={checkboxClick}
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
                          <View style={styles.cards}>
                            <Subtitle style={styles.cardsecurity}>
                              {`${i18n.t(k.cardsecurity)}`}
                            </Subtitle>
                            <Image
                              source={require('./../res/images/creditguard.png')}
                              //styleName="medium-wide"
                              style={styles.bottomimage}
                            />
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                  <View style={styles.btnmaincontainer}>
                    <View style={styles.btncontainer}>
                      <TouchableOpacity
                        styleName="flexible"
                        onPress={submitBtnClick}>
                        <View
                          style={styles.buttonStyle}
                          // mode="contained"
                          // dark={true}
                          // onPress={() => this.finalorders(false)}
                          loading={false}>
                          <Subtitle style={styles.btntext}>
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
    </>
  );
};

export default CreditCard;

const styles = StyleSheet.create({
  cards: {
    alignItems: 'center',
    alignContent: 'center',
    paddingBottom: 6,
    marginTop: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginStart: 8,
  },
  year: {
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
  },
  cvv: {
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
  },
  secondcontainer: {
    marginTop: 0.5,
    flex: 0.32,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'space-between',
    //marginStart: 24,
    //marginEnd: 24,
    marginStart: sizeWidth(6),
    marginEnd: sizeWidth(6),
  },
  cardimage: {
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
  },
  cardnumber: {
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
  },
  cardsecurity: {
    color: '#646464',
    fontSize: 12,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  btnmaincontainer: {
    flex: 0.1,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginTop: 4,
  },
  btntext: {
    color: 'white',
    fontFamily: 'Rubik',
    fontSize: 18,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  btncontainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    backgroundColor: 'white',
  },
  bottomimage: {
    width: '40%',
    height: 32,
    marginTop: 4,
    //tintColor: '#777777',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 8,
  },
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
