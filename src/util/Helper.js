import {Dimensions, PermissionsAndroid, Platform} from 'react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import NavigationAction from './../util/NavigationActions';
import Moment from 'moment';
import Lodash from 'lodash';

/**
 *
 * @param props
 */
export const closeCurrentPage = props => {
  props.navigation.goBack(null);
};

/**
 * onBackClick navigation..i.e back to homepage
 * @param props
 */
export const backClick = props => {
  NavigationAction.navigate('Home');
  //props.navigation.navigate("Home");
};

/**
 * onItemClick navigation
 * @private
 * @param props
 * @param val
 */
export const itemClick = (props, val) => {
  //props.navigation.navigate(val);
  NavigationAction.navigate(val);
};

export const passParamItemClick = (props, val, data) => {
  //props.navigation.navigate(val, data);
  NavigationAction.navigate(val, data);
};

/**
 * return device width
 * @returns {*}
 */
export const deviceWidth = () => {
  return Dimensions.get('window').width;
};

/**
 * return device height
 * @returns {*}
 */
export const deviceHeight = () => {
  return Dimensions.get('window').height;
};

/**
 * Ask permission on android
 * @returns {Promise<void>}
 */
export const requestPermissions = async () => {
  try {
    if (Platform.OS === 'android') {
      const value = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]).then(result => {
        if (
          result['android.permission.ACCESS_COARSE_LOCATION'] &&
          result['android.permission.CALL_PHONE'] &&
          result['android.permission.READ_SMS'] &&
          result['android.permission.ACCESS_FINE_LOCATION'] &&
          result['android.permission.READ_EXTERNAL_STORAGE'] &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ) {
          //granted
        } else if (
          result['android.permission.ACCESS_COARSE_LOCATION'] ||
          result['android.permission.CALL_PHONE'] ||
          result['android.permission.READ_SMS'] ||
          result['android.permission.ACCESS_FINE_LOCATION'] ||
          result['android.permission.READ_EXTERNAL_STORAGE'] ||
          result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            'never_ask_again'
        ) {
          //
        }
      });
      return value;
    }
  } catch (err) {
    console.warn(err);
  }
};

/**
 * networkHelper
 * @param url
 * @param jsonData
 * @param method
 * @param isTokenPresent
 * @param token
 * @param callback
 * @param errorCallback
 */
export const networkHelper = (
  url,
  jsonData,
  method,
  callback = responseJson => {},
  errorCallback = error => {},
) => {
  fetch(url, {
    method: method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: jsonData,
  })
    .then(response => response.json())
    .then(responseJson => {
      callback(responseJson);
    })
    .catch(error => {
      ////console.log(error);
      errorCallback(error);
    });
};

/**
 * networkHelper
 * @param url
 * @param method
 * @param token
 * @param callback
 * @param errorCallback
 */
export const networkHelperToken = (
  url,
  method,
  token,
  callback = responseJson => {},
  errorCallback = error => {},
) => {
  fetch(url, {
    method: method,
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })
    .then(response => {
      return response.json();
    })
    .then(responseJson => {
      callback(responseJson);
    })
    .catch(error => {
      errorCallback(error);
    });
};

/**
 * networkHelper
 * @param url
 * @param method
 * @param token
 * @param callback
 * @param errorCallback
 */
export const networkHelperTokenPost = (
  url,
  jsonData,
  method,
  token,
  callback = responseJson => {},
  errorCallback = error => {},
) => {
  fetch(url, {
    method: method,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: jsonData,
  })
    .then(response => {
      return response.json();
    })
    .then(responseJson => {
      callback(responseJson);
    })
    .catch(error => {
      errorCallback(error);
    });
};

/**
 * finish current screen
 * @param props
 * @param screen
 */
export const navigateAfterFinish = (props, screen) => {
  const navigateAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({routeName: screen})],
  });

  props.navigation.dispatch(navigateAction);
};

/**
 * removeQuotes
 * @param text
 * @returns {string}
 */
export const removeQuotes = text => {
  if (text && text !== undefined && text !== null) {
    if (text.charAt(0) === '"' && text.charAt(text.length - 1) === '"') {
      return text.substr(1, text.length - 2);
    }
    return text;
  } else {
    return '';
  }
};

/**
 * check if json is object or string
 */
export const checkJson = item => {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }
  if (typeof item === 'object' && item !== null) {
    return true;
  }
  return false;
};

/**
 *
 * @param {Group by} list
 * @param {*} keyGetter
 */
export const groupBy = (list, keyGetter) => {
  const map = new Map();
  list.forEach(item => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
};

export const subslongText = (name, length) => {
  if (name === undefined || name === null) {
    return '';
  } else {
    if (name.length > 0) {
      const size = name.length;
      return size > length ? name.substring(0, length) + '...' : name;
    } else {
      return '';
    }
  }
};

export const checktime = time => {
  if (time == undefined || time == null) {
    return '';
  }
  const sp = time.split(' - ');
  var now = Moment();
  var time = now.hour(); //+ ':' + now.minutes() + ':' + now.seconds();
  //////console.log("currentTime", time);
  if (Number(time) < Number(sp[1])) {
    return true;
  } else {
    return false;
  }
};

export const parsetime = time => {
  if (time == undefined || time == null) {
    return '';
  }
  const sp = time.split(' - ');
  var start = Moment.duration(sp[0], 'HH:mm');
  var end = Moment.duration(sp[1], 'HH:mm');
  var diff = end.subtract(start);
  return diff.hours() + ':' + diff.minutes();
};

export const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const guid = () => {
  var chars = '0123456789abcdef'.split('');
  var uuid = [],
    rnd = Math.random,
    r;
  uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
  uuid[14] = '4';
  for (var i = 0; i < 36; i++) {
    if (!uuid[i]) {
      r = 0 | (rnd() * 16);
      uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r & 0xf];
    }
  }
  return uuid.join('');
};

/**
 *
 * @param {*} array
 */
export const countcatextraItem = array => {
  var r = [],
    o = {};
  Lodash.map(array, (a, index) => {
    if (!o[a.name]) {
      o[a.name] = {category: a.category, value: 0, name: a.name};
      r.push(o[a.name]);
    }
    o[a.name].value++;
  });
  return r;
};

/**
 *
 * @param {*} result
 */
export const groupExtraWithCountString = (result, val) => {
  if (result === undefined || result === null || result.length === 0) {
    return '';
  }
  const data = val ? countcatextraItem(result) : result;
  let groupedExtra = Lodash.groupBy(data, function(exData) {
    if (exData.category !== '') {
      return exData.category;
    }
  });
  let extraString = '';
  Object.keys(groupedExtra).map(key => {
    let filterExtras = key + ': ';
    const datass = groupedExtra[key];
    Lodash.map(datass, (ele, index) => {
      if (val) {
        if (index === datass.length - 1) {
          filterExtras += `${ele.value > 1 ? `${ele.value}x` : ''} ${ele.name}`;
        } else {
          filterExtras += `${ele.value > 1 ? `${ele.value}x` : ''}  ${
            ele.name
          },`;
        }
      } else {
        if (index === datass.length - 1) {
          filterExtras += `${ele.name}`;
        } else {
          filterExtras += `${ele.name}, `;
        }
      }
    });
    extraString += filterExtras.trim() + '\n';
  });
  return extraString;
};

/**
 *
 * @param {*} arr
 */
export const orderData = (arr, branches, isHistory) => {
  if (arr.length > 0) {
    const result = [];
    let mappingData = Lodash.map(arr, io => {
      const date = Moment(io.orderdate).format('YYYY/MM/DD HH:mm');
      const find = Lodash.find(
        result,
        xm =>
          xm.fkbranchO === io.fkbranchO &&
          xm.date === io.date &&
          xm.cartGuid === io.cartGuid,
      );
      const findBranchces = Lodash.find(branches, x => {
        const br = x.branch;
        if (Number(br.idbranch) === Number(io.fkbranchO)) {
          return br;
        }
      });
      const branchFind = findBranchces.branch;
      if (find === undefined) {
        const data = [];
        //console.log(`io`, io);
        data.push(io);
        result.push({
          keys: date,
          isdelivery: io.isdelivery,
          message: '',
          title: branchFind.name || '',
          imageUrl: branchFind.imageUrl || '',
          idbranch: branchFind.idbranch || 0,
          isHistory: isHistory,
          orderdate: date,
          fkbranchO: io.fkbranchO,
          paid: io.paid,
          status: io.status,
          cartGuid: io.cartGuid,
          idorder:io.idorder,
          data: data,
          totalPrice: io.price,
          servicelist: [],
        });
      } else {
        const indx = Lodash.findLastIndex(
          result,
          xm =>
            xm.fkbranchO === io.fkbranchO &&
            xm.date === io.date &&
            xm.cartGuid === io.cartGuid,
        );
        if (indx !== -1) {
          const {data} = find;
          data.push(io);
          find.data = data;
          find.totalPrice = Lodash.sumBy(find.data, ix => ix.price);
          result[indx] = find;
        }
      }
    });
    return Lodash.orderBy(result, ['keys'], ['desc']);
  } else {
    return [];
  }
};
