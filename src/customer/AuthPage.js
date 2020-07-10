import * as React from 'react';
import * as Pref from './../util/Pref';
import {StatusBar} from 'react-native';
import {Screen} from '@shoutem/ui';
import * as Helper from './../util/Helper';

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
      if (mks == '') {
        Helper.itemClick(this.props, 'SignupPage');
      } else {
        if (mks === 'true') {
          //Helper.itemClick(this.props, 'Login');
          Helper.itemClick(this.props, "Home");
        } else {
          Helper.itemClick(this.props, 'SignupPage');
        }
      }
    });
  }

  render() {
    return <Screen />;
  }
}
