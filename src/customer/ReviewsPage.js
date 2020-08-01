import i18n from 'i18next';
import k from './../i18n/keys';
import React from 'react';
import {
  FlatList,
  StatusBar,
  Text,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Image,
  Caption,
  Divider,
  Heading,
  NavigationBar,
  Row,
  Screen,
  Subtitle,
  Title,
  TouchableOpacity,
} from '@shoutem/ui';
import {
  Card,
  Button,
  Checkbox,
  Dialog,
  Portal,
  Colors,
  TextInput,
} from 'react-native-paper';
import DummyLoader from '../util/DummyLoader';
import NavigationActions from '../util/NavigationActions';
import * as Pref from './../util/Pref';
import * as Helper from './../util/Helper';
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import * as Lodash from 'lodash';
import StarRating from 'react-native-star-rating';
import {Loader} from './Loader';
import Moment from 'moment';
import {AlertDialog} from './../util/AlertDialog';
import {SafeAreaView} from 'react-navigation';

export default class ReviewsPage extends React.Component {
  constructor(props) {
    super(props);
    this.submitReview = this.submitReview.bind(this);
    this.bindDate = this.bindDate.bind(this);
    this.onStarRatingPress = this.onStarRatingPress.bind(this);
    this.state = {
      selectedTab: 0,
      selected: 0,
      progressView: false,
      eachTabData: [],
      item: null,
      reviewinput: i18n.t(k._4),
      rating: 0,
      token: '',
      smp: false,
      showAlert: false,
      alertContent: i18n.t(k._4),
    };
  }

  onStarRatingPress = rating => {
    this.setState({
      rating: rating,
    });
  };

  componentDidMount() {
    const {state} = this.props.navigation;
    const data = state.params.item;
    this.willfocusListener = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({item: data, progressView: true});
      },
    );
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      Pref.setVal(Pref.HomeReload, null);
      this.fetchReviews();
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

  /**
   * Fetch All reviews
   */
  fetchReviews() {
    //this.setState({ progressView: true });
    Pref.getVal(Pref.bearerToken, value => {
      const token = Helper.removeQuotes(value);
      //////console.log(token);
      this.setState({token: token});
      Helper.networkHelperToken(
        Pref.GerReviewsUrl + this.state.item.idbranch,
        Pref.methodGet,
        token,
        result => {
          //console.log(result);
          this.setState({
            branches: result.branches,
            progressView: false,
            eachTabData: result,
          });
        },
        error => {
          this.setState({progressView: false});
        },
      );
    });
  }

  submitReview = () => {
    if (this.state.rating == 0) {
      this.setState({alertContent: i18n.t(k._90), showAlert: true});
    } else {
      this.setState({smp: true});
      const data = JSON.stringify({
        branchfkid: this.state.item.idbranch,
        content: this.state.reviewinput,
        rating: this.state.rating.toString(),
      });

      //////console.log('da', data);
      Helper.networkHelperTokenPost(
        Pref.ReviewPostUrl,
        data,
        Pref.methodPost,
        this.state.token,
        result => {
          if (result.includes('customer already reviewed this')) {
            //ignored
            this.setState({alertContent: i18n.t(k._91), showAlert: true});
          } else {
            this.setState({alertContent: i18n.t(k._92), showAlert: true});
            this.fetchReviews();
          }
          //////console.log('res', result);
          this.setState({rating: 0, reviewinput: i18n.t(k._4), smp: false});
        },
        error => {
          //alert(error);
          this.setState({rating: 0, reviewinput: i18n.t(k._4), smp: false});
        },
      );
    }
  };

  bindDate = dates => {
    return Moment(dates).format('YYYY-MM-DD HH:MM');
  };

  renderRow(item, index) {
    return (
      <View
        style={{
          flexDirection: 'column',
          marginHorizontal: sizeWidth(5),
          marginVertical: sizeHeight(1),
        }}>
        <Card elevation={0} style={{borderColor: '#dedede', borderWidth: 1}}>
          <StarRating
            disabled={true}
            emptyStar={'ios-star-outline'}
            fullStar={'ios-star'}
            halfStar={'ios-star-half'}
            iconSet={'Ionicons'}
            maxStars={5}
            starSize={18}
            buttonStyle={{margin: 4}}
            halfStarEnabled={true}
            containerStyle={{justifyContent: i18n.t(k.FLEX_START)}}
            rating={item.rating}
            fullStarColor={'#EFCE4A'}
          />

          <View style={{flexDirection: 'column'}}>
            <Title
              styleName="bold"
              style={{
                color: '#777777',
                fontFamily: 'Rubik',
                fontSize: 16,
                marginStart: 4,
                marginEnd: 4,
                textAlign: 'justify',
                alignSelf: 'flex-start',
                fontWeight: '400',
              }}>
              {item.content}
            </Title>
            <Subtitle
              style={{
                color: '#BEBEBE',
                fontFamily: 'Rubik',
                alignSelf: 'flex-start',
                fontSize: 12,
                marginStart: 4,
                fontWeight: '400',
              }}>
              {this.bindDate(item.date) + '   ' + item.username}
            </Subtitle>
          </View>
        </Card>
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}>
            {this.state.item !== null && this.state.item !== undefined ? (
              <Image
                styleName="large-wide"
                style={{height: sizeHeight(24), resizeMode: 'contain'}}
                source={{uri: `${Pref.BASEURL}${this.state.item.imageurl}`}}
              />
            ) : null}
            <View
              style={{
                position: 'absolute',
                backgroundColor: 'transparent',
              }}>
              <NavigationBar
                styleName="inline no-border clear"
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
              {this.state.item !== null && this.state.item !== undefined ? (
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: 'white',
                  }}>
                  <Title
                    styleName="bold"
                    style={{
                      color: '#292929',
                      fontFamily: 'Rubik',
                      fontSize: 20,
                      alignSelf: 'flex-start',
                      fontWeight: '700',
                      marginStart: sizeWidth(4),
                      paddingHorizontal: sizeWidth(1),
                      paddingVertical: sizeHeight(1.5),
                    }}>
                    {this.state.item.name}
                  </Title>
                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#dedede',
                      marginVertical: sizeHeight(0.5),
                    }}
                  />
                </View>
              ) : null}

              <View
                style={{
                  flexDirection: 'column',
                  paddingHorizontal: sizeWidth(1),
                  paddingVertical: sizeHeight(2),
                }}>
                <Subtitle
                  style={{
                    color: '#777777',
                    fontSize: 16,
                    alignSelf: 'flex-start',
                    marginStart: sizeWidth(4),
                  }}>
                  {i18n.t(k.ratingheading)}
                </Subtitle>
                <StarRating
                  disabled={false}
                  emptyStar={'ios-star-outline'}
                  fullStar={'ios-star'}
                  halfStar={'ios-star-half'}
                  iconSet={'Ionicons'}
                  maxStars={5}
                  starSize={28}
                  buttonStyle={{margin: 4}}
                  halfStarEnabled={false}
                  containerStyle={{
                    justifyContent: i18n.t(k.FLEX_START),
                    marginHorizontal: sizeWidth(4),
                    marginVertical: sizeHeight(0.2),
                  }}
                  rating={this.state.rating}
                  selectedStar={this.onStarRatingPress}
                  fullStarColor={'#EFCE4A'}
                  //reversed={true}
                />
                <Subtitle
                  style={{
                    color: '#777777',
                    fontSize: 16,
                    alignSelf: 'flex-start',
                    marginStart: sizeWidth(4),
                  }}>
                  {i18n.t(k.ratingcontent)}
                </Subtitle>
                <TextInput
                  mode="flat"
                  underlineColor="transparent"
                  underlineColorAndroid="transparent"
                  style={[styles.inputStyle]}
                  placeholderTextColor={'#DEDEDE'}
                  multiline={true}
                  onChangeText={value => this.setState({reviewinput: value})}
                  value={this.state.reviewinput}
                />

                <Button
                  styleName=" muted border"
                  mode={'contained'}
                  uppercase={true}
                  dark={true}
                  loading={false}
                  style={[styles.loginButtonStyle]}
                  onPress={this.submitReview}>
                  <Subtitle
                    style={{
                      color: 'white',
                    }}>
                    {i18n.t(k.ratingsubmit)}
                  </Subtitle>
                </Button>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#dedede',
                    marginTop: sizeHeight(3),
                    marginBottom: sizeHeight(3),
                  }}
                />

                <Title
                  styleName="bold"
                  style={{
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontSize: 20,
                    alignSelf: 'flex-start',
                    fontWeight: '700',
                    marginStart: sizeWidth(4),
                    paddingHorizontal: sizeWidth(1),
                  }}>
                  {'ביקורות אחרונות'}
                </Title>
              </View>
              <DummyLoader
                visibilty={this.state.progressView}
                center={
                  this.state.eachTabData.length > 0 ? (
                    <FlatList
                      extraData={this.state}
                      nestedScrollEnabled={true}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
                      data={this.state.eachTabData}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item: item, index}) =>
                        this.renderRow(item, index)
                      }
                    />
                  ) : (
                    <Subtitle
                      style={{
                        alignSelf: 'center',
                      }}>
                      {i18n.t(k._89)}
                    </Subtitle>
                  )
                }
              />
            </View>
          </ScrollView>
          {this.state.showAlert ? (
            <AlertDialog
              isShow={true}
              title={i18n.t(k._30)}
              content={this.state.alertContent}
              callbacks={() => this.setState({showAlert: false})}
            />
          ) : null}
          <Loader isShow={this.state.smp} />
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
    borderRadius: 2,
    borderColor: i18n.t(k.DEDEDE1),
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: i18n.t(k.FFFFFF),
    color: i18n.t(k._57),
    fontFamily: i18n.t(k.RUBIK),
    fontSize: 16,
    height: 150,
    marginHorizontal: sizeWidth(4),
    fontWeight: i18n.t(k._58),
    textAlignVertical: 'top',
  },

  loginButtonStyle: {
    color: i18n.t(k.WHITE),
    bottom: 0,
    paddingVertical: 6,
    marginTop: sizeHeight(2),
    marginHorizontal: sizeWidth(4),
    backgroundColor: i18n.t(k.DACCF),
    textAlign: i18n.t(k.CENTER),
  },
});
