import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import {Button, Snackbar, TextInput, Colors, Card} from 'react-native-paper';
import {
  NavigationBar,
  Screen,
  Title,
  View,
  Subtitle,
  Heading,
} from '@shoutem/ui';
import * as Pref from './../util/Pref';
import * as Helper from './../util/Helper';
import DeviceInfo from 'react-native-device-info';
import {Loader} from './Loader';
import messaging from '@react-native-firebase/messaging';
import {sizeWidth, sizeHeight} from '../util/Size';
import {AlertDialog} from './../util/AlertDialog';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationActions from '../util/NavigationActions';
import Lodash, {filter} from 'lodash';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: i18n.t(k._4),
      lastName: i18n.t(k._4),
      mobileNo: i18n.t(k._4),
      add1: i18n.t(k._4),
      add2: '',
      add3: i18n.t(k._4),
      add4: i18n.t(k._4),
      errorFName: false,
      errorLName: false,
      errorAdd1: false,
      errorAdd2: false,
      errorAdd3: false,
      errorAdd4: false,
      errorMsg: i18n.t(k._4),
      progressView: false,
      showAlert: false,
      alertContent: i18n.t(k._4),
      smp: false,
      citiesList: [],
      cloneOgCitiesList: [],
    };
  }

  componentDidMount() {
    const {navigation} = this.props;
    const number = navigation.getParam('mobile', '') || '';
    this.setState({mobileNo: number});
    Helper.networkHelperToken(
      Pref.GetCitiesUrl,
      Pref.methodGet,
      Pref.LASTTOKEN,
      result => {
        //console.log(`result`, result);
        this.setState({citiesList: [], cloneOgCitiesList: result});
      },
      error => {
        console.log(error);
      },
    );
  }
  /**
   * save account details
   */
  onSaveClick() {
    // else if (this.state.add4.length < 5 || this.state.add4.length < 7) {
    //   this.setState({
    //     errorMsg: "Please, Enter Correct Zip Code",
    //     errorFName: false,
    //     errorLName: false,
    //     errorAdd1: false,
    //     errorAdd2: false,
    //     errorAdd3: false,
    //     errorAdd4: true
    //   });
    // else if (this.state.add2 === "") {
    //   this.setState({
    //     errorMsg: "Landmark Empty",
    //     errorFName: false,
    //     errorLName: false,
    //     errorAdd1: false,
    //     errorAdd2: true,
    //     errorAdd3: false,
    //     errorAdd4: false
    //   });
    // }
    // }
    if (
      this.state.firstName === '' &&
      this.state.lastName === '' &&
      this.state.add1 === '' &&
      this.state.add3 === '' &&
      this.state.add4 === ''
    ) {
      this.setState({
        errorMsg: i18n.t(k._55),
        errorFName: true,
        errorLName: true,
        errorAdd1: true,
        errorAdd2: true,
        errorAdd3: true,
        errorAdd4: true,
      });
    } else if (this.state.firstName === '') {
      this.setState({
        errorMsg: i18n.t(k._49),
        errorFName: true,
        errorLName: false,
        errorAdd1: false,
        errorAdd2: false,
        errorAdd3: false,
        errorAdd4: false,
      });
    } else if (this.state.lastName === '') {
      this.setState({
        errorMsg: i18n.t(k._50),
        errorFName: false,
        errorLName: true,
        errorAdd1: false,
        errorAdd2: false,
        errorAdd3: false,
        errorAdd4: false,
      });
    } else if (this.state.add1 === '') {
      this.setState({
        errorMsg: i18n.t(k._52),
        errorFName: false,
        errorLName: false,
        errorAdd1: true,
        errorAdd2: false,
        errorAdd3: false,
        errorAdd4: false,
      });
    } else if (this.state.add3 === '') {
      this.setState({
        errorMsg: i18n.t(k._14),
        errorFName: false,
        errorLName: false,
        errorAdd1: false,
        errorAdd2: false,
        errorAdd3: true,
        errorAdd4: false,
      });
    } else if (this.state.add4 === '') {
      this.setState({
        errorMsg: i18n.t(k._53),
        errorFName: false,
        errorLName: false,
        errorAdd1: false,
        errorAdd2: false,
        errorAdd3: false,
        errorAdd4: true,
      });
    } else {
      const {cloneOgCitiesList} = this.state;
      const find = Lodash.find(cloneOgCitiesList, io => {
        const {name} = io;
        if (name !== null && name === this.state.add3) {
          return io;
        } else {
          return undefined;
        }
      });

      if (find === undefined) {
        this.setState({
          errorMsg: i18n.t(k._14),
          errorFName: false,
          errorLName: false,
          errorAdd1: false,
          errorAdd2: false,
          errorAdd3: true,
          errorAdd4: false,
        });
        return false;
      }

      this.setState({progressView: true, smp: true});
      Pref.setVal(Pref.citySave, this.state.add3);
      // " " +
      //   this.state.add2 +
      const fullAddress =
        this.state.add1 + ' ' + this.state.add3 + ' ' + this.state.add4;
      messaging()
        .getToken()
        .then(fcmToken => {
          if (fcmToken) {
            const data = JSON.stringify({
              phone: this.state.mobileNo,
              firstname: this.state.firstName,
              lastname: this.state.lastName,
              Address: fullAddress,
              Deviceid: fcmToken,
            });

            Helper.networkHelper(
              Pref.SignUpUrl,
              data,
              Pref.methodPost,
              result => {
                this.setState({progressView: false, smp: false});
                const token = result['token'];
                //alert(JSON.stringify(result));
                if (token !== '') {
                  Pref.setVal(Pref.bearerToken, token);
                  Pref.setVal(Pref.loggedStatus, true);
                  //////console.log(token);
                  Helper.itemClick(this.props, 'Home');
                }
              },
              error => {
                this.setState({progressView: false, smp: false});
              },
            );
          } else {
            // alert('Failed to Register');
            //"ההרשמה נכשלה"
            this.setState({
              alertContent: i18n.t(k._56),
              showAlert: true,
              smp: false,
            });
          }
        });
    }
  }

  fetchCities(value) {
    const {cloneOgCitiesList} = this.state;
    this.setState({add3: value, citiesList: []});
    if (value !== '') {
      if (cloneOgCitiesList.length > 0) {
        let find = Lodash.filter(
          JSON.parse(JSON.stringify(cloneOgCitiesList)),
          ok => {
            const {name} = ok;
            return name !== null && name.includes(value.toString());
          },
        );
        this.setState({
          citiesList: find,
        });
      }
      // Helper.networkHelperTokenPost(
      //   Pref.GetDeliveryListItemAutoCompleteSearchUrl,
      //   JSON.stringify({
      //     input: value,
      //   }),
      //   Pref.methodPost,
      //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMTA0MjhjYThmMWM0NDlkYmUwOGE2YmM0MTRiNDIyMSIsIm5hbWVpZCI6ImF1dG9jb21wbHQzMiIsImV4cCI6MTkwMTAzMzQ2OSwiaXNzIjoiY2FsbGl0YXBwbGljYXRpb24iLCJhdWQiOiJjYWxsaXRhcHBsaWNhdGlvbiJ9.czeFZoed1-yKdum3YKN7GIqAzbNMFaT3ms60DWFQ83w',
      //   result => {
      //     this.setState({citiesList: result});
      //     console.log(result);
      //   },
      //   error => {},
      // );
    }
  }

  renderRowSug(item, index) {
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
            this.setState({add3: item.name, citiesList: []});
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

  render() {
    return (
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
          leftComponent={
            <View
              styleName="horizontal space-between"
              style={{marginStart: 12}}>
              <TouchableOpacity onPress={() => NavigationActions.goBack()}>
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
                {`${i18n.t(k._48)}`}
              </Heading>
            </View>
          }
        />
        <KeyboardAvoidingView
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-evenly',
          }}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={'handled'}
            style={{flex: 1}}>
            <View style={{marginHorizontal: sizeWidth(4)}}>
              <Subtitle
                style={{
                  color: '#292929',
                  fontSize: 16,
                  alignSelf: 'flex-start',
                }}>
                {i18n.t(k._49)}
              </Subtitle>
              <TextInput
                dense={true}
                style={styles.inputStyle}
                mode={'flat'}
                password={false}
                onBlur={() => !this.state.firstName}
                onFocus={() => !this.state.errorFName}
                error={this.state.errorFName}
                onChangeText={text => {
                  this.setState({firstName: text});
                }}
                value={this.state.firstName}
                returnKeyType="next"
                numberOfLines={1}
                placeholderTextColor={'#DEDEDE'}
                underlineColor={'transparent'}
                underlineColorAndroid={'transparent'}
              />

              <Subtitle
                styleName="v-center h-center"
                style={{
                  color: '#292929',
                  fontSize: 16,
                  alignSelf: 'flex-start',
                  marginTop: sizeHeight(1),
                }}>
                {i18n.t(k._50)}
              </Subtitle>
              <TextInput
                style={styles.inputStyle}
                mode={'flat'}
                onBlur={() => !this.state.errorLName}
                onFocus={() => !this.state.errorLName}
                password={false}
                error={this.state.errorLName}
                onChangeText={text => {
                  this.setState({lastName: text});
                }}
                value={this.state.lastName}
                returnKeyType="next"
                numberOfLines={1}
                placeholderTextColor={'#DEDEDE'}
                underlineColor={'transparent'}
                underlineColorAndroid={'transparent'}
              />

              <Subtitle
                styleName="v-center h-center"
                style={{
                  color: '#292929',
                  fontSize: 16,
                  alignSelf: 'flex-start',
                  marginTop: sizeHeight(1),
                }}>
                {i18n.t(k._51)}
              </Subtitle>
              <TextInput
                style={styles.inputStyle}
                mode={'flat'}
                value={this.state.mobileNo}
                editable={false}
                disabled={true}
                onChangeText={text => {
                  this.setState({mobileNo: text});
                }}
                placeholderTextColor={'#DEDEDE'}
                password={false}
                numberOfLines={1}
                returnKeyType="next"
                underlineColor={'transparent'}
                underlineColorAndroid={'transparent'}
              />

              <Subtitle
                styleName="v-center h-center"
                style={{
                  color: '#292929',
                  fontSize: 16,
                  alignSelf: 'flex-start',
                  marginTop: sizeHeight(1),
                }}>
                {i18n.t(k._52)}
              </Subtitle>
              <TextInput
                style={styles.inputStyle}
                mode={'flat'}
                onBlur={() => !this.state.errorAdd1}
                onFocus={() => !this.state.errorAdd1}
                password={false}
                placeholderTextColor={'#DEDEDE'}
                numberOfLines={1}
                onChangeText={text => {
                  this.setState({add1: text});
                }}
                value={this.state.add1}
                error={this.state.errorAdd1}
                multiline={false}
                returnKeyType="next"
                underlineColor={'transparent'}
                underlineColorAndroid={'transparent'}
              />

              {/* <Subtitle styleName='v-center h-center' style={{ color: '#292929', fontSize: 16, alignSelf: 'flex-start', marginTop: sizeHeight(1)}}>LandMark</Subtitle>
               <TextInput
                style={styles.inputStyle}
                mode={"flat"}
                onBlur={() => !this.state.errorAdd2}
                onFocus={() => !this.state.errorAdd2}
                password={false}
                numberOfLines={1}
                onChangeText={text => {
                  this.setState({ add2: text });
                }}
                value={this.state.add2}
                error={this.state.errorAdd2}
                multiline={false}
                returnKeyType="next"
                placeholderTextColor={'#DEDEDE'}
                underlineColor={"transparent"}
                underlineColorAndroid={"transparent"}
               /> */}
              <Subtitle
                styleName="v-center h-center"
                style={{
                  color: '#292929',
                  fontSize: 16,
                  alignSelf: 'flex-start',
                  marginTop: sizeHeight(1),
                }}>
                {i18n.t(k._14)}
              </Subtitle>
              <TextInput
                style={styles.inputStyle}
                mode={'flat'}
                onBlur={() => !this.state.errorAdd3}
                onFocus={() => !this.state.errorAdd3}
                password={false}
                placeholderTextColor={'#DEDEDE'}
                onChangeText={text => this.fetchCities(text)}
                value={this.state.add3}
                error={this.state.errorAdd3}
                returnKeyType="next"
                numberOfLines={1}
                underlineColor={'transparent'}
                underlineColorAndroid={'transparent'}
              />

              {this.state.citiesList.length > 0 ? (
                <View
                  style={{
                    flexGrow: 1,
                    //flexWrap: 'wrap',
                    //marginVertical: sizeHeight(2),
                    //marginHorizontal: sizeWidth(1),
                    marginTop: -2,
                    maxHeight: 200,
                  }}>
                  <Card elevation={2}>
                    <FlatList
                      //extraData={this.state}
                      showsVerticalScrollIndicator={true}
                      showsHorizontalScrollIndicator={false}
                      data={this.state.citiesList}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps={'handled'}
                      ItemSeparatorComponent={() => (
                        <View style={styles.listservicedivider} />
                      )}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item: item, index}) =>
                        this.renderRowSug(item, index)
                      }
                    />
                  </Card>
                </View>
              ) : null}

              <Subtitle
                styleName="v-center h-center"
                style={{
                  color: '#292929',
                  fontSize: 16,
                  alignSelf: 'flex-start',
                  marginTop: sizeHeight(1),
                }}>
                {i18n.t(k._53)}
              </Subtitle>
              <TextInput
                onBlur={() => !this.state.errorAdd4}
                onFocus={() => !this.state.errorAdd4}
                style={styles.inputStyle}
                mode={'flat'}
                placeholderTextColor={'#DEDEDE'}
                password={false}
                onChangeText={text => {
                  this.setState({add4: text});
                }}
                value={this.state.add4}
                error={this.state.errorAdd4}
                returnKeyType="done"
                numberOfLines={1}
                underlineColor={'transparent'}
                underlineColorAndroid={'transparent'}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Button
          styleName=" muted border"
          style={styles.loginButtonStyle}
          mode="flat"
          dark={true}
          loading={this.state.progressView}
          onPress={() => this.onSaveClick()}>
          <Subtitle style={{color: 'white'}}>
            {this.state.progressView === true
              ? i18n.t(k._47)
              : i18n.t(k._54)}
          </Subtitle>
        </Button>
        <Snackbar
          visible={
            this.state.errorFName ||
            this.state.errorLName ||
            this.state.errorAdd1 ||
            this.state.errorAdd2 ||
            this.state.errorAdd3 ||
            this.state.errorAdd4
          }
          duration={600}
          onDismiss={() =>
            this.setState({
              errorLName: false,
              errorFName: false,
              errorAdd1: false,
              errorAdd2: false,
              errorAdd3: false,
              errorAdd4: false,
            })
          }>
          {this.state.errorMsg}
        </Snackbar>
        {this.state.showAlert ? (
          <AlertDialog
            isShow={true}
            title={i18n.t(k._29)}
            content={this.state.alertContent}
            callbacks={() => this.setState({showAlert: false})}
          />
        ) : null}
        <Loader isShow={this.state.smp} />
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  inputStyle: {
    height: 48,
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: i18n.t(k.FFFFFF),
    color: i18n.t(k._57),
    fontFamily: i18n.t(k.RUBIK),
    fontSize: 16,
    fontWeight: i18n.t(k._58),
  },

  loginButtonStyle: {
    color: i18n.t(k.WHITE),
    bottom: 0,
    paddingVertical: 6,
    width: i18n.t(k._5),
    backgroundColor: i18n.t(k.DACCF),
    textAlign: 'center',
    marginTop: sizeHeight(2),
  },
  listservicedivider: {
    height: 1,
    backgroundColor: '#dedede',
    marginHorizontal: sizeWidth(6),
  },
});
