import * as React from 'react';
import * as Pref from './../util/Pref';
import {StatusBar} from 'react-native';
import {Screen} from '@shoutem/ui';
import * as Helper from './../util/Helper';
import {SafeAreaView} from 'react-navigation';

/**
 * AuthPage
 */
export default class AuthPage extends React.Component {
  constructor() {
    super();
  }

  /**
   *
   */
  componentDidMount() {
    Pref.getVal(Pref.loggedStatus, value => {
      let mks = Helper.removeQuotes(value);
      //console.log(mks);
      if (mks === '') {
        Helper.itemClick(this.props, 'Login');
      } else {
        if (mks === 'true') {
          //Home
          Helper.itemClick(this.props, 'Login');
          //Helper.itemClick(this.props, 'Login');
        } else {
          Helper.itemClick(this.props, 'Login');
        }
      }
    });
  }

  render() {
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: 'white'}}
        forceInset={{top: 'never'}}>
        <Screen />
      </SafeAreaView>
    );
  }
}
