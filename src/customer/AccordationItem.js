import i18n from 'i18next';
import k from './../i18n/keys';
import React, {useState, useEffect, useRef} from 'react';
import {FlatList, StyleSheet, LayoutAnimation, Platform} from 'react-native';
import {List} from 'react-native-paper';
import {View} from '@shoutem/ui';
import * as Lodash from 'lodash';
import {sizeHeight, sizeWidth} from '../util/Size';
import AccordItem from '../customer/AccordItem';

const AccordationItem = props => {
  const {
    index,
    item,
    clickedItemPos = 0,
    size,
    clickedItem = (tabData, item, index) => {},
    accordClick,
    currentCategory = '',
  } = props;
  //const datapos = item.data.length || 0;
  const clone = JSON.parse(JSON.stringify(item.data));
  if (clone.length > 10) {
    clone.length = 3;
  }
  const [itemList, setItemList] = useState(clone);
  const {expanded} = item;

  useEffect(() => {
    if (expanded) {
      if (itemList.length === 3) {
        const timer = setTimeout(() => {
          const clone = JSON.parse(JSON.stringify(item.data));
          setItemList(clone);
          //console.log(clone.length);
          clearTimeout(timer);
        }, 250);
      }
    } else {
      const clone = JSON.parse(JSON.stringify(item.data));
      if (clone.length > 10) {
        clone.length = 3;
        setItemList(clone);
      }
    }
    return () => {};
  }, [expanded]);

  return (
    <View>
      {/* {index === 0 ? <View style={styles.listservicedivider} /> : null} */}

      <View style={styles.listservicedivider} />
      <List.Accordion
        title={Lodash.capitalize(item.cat)}
        titleStyle={styles.listService}
        style={styles.listserviceacc}
        expanded={item.expanded}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          accordClick(!expanded, item.cat);
        }}>
        <View>
          {Lodash.map(itemList, (eachTabData, pos) => {
            return (
              <View>
                {pos !== 0 ? (
                  <View style={styles.listserviceItemDivider} />
                ) : null}
                <AccordItem
                  eachTabData={eachTabData}
                  index={pos}
                  clickedItem={(itemx, i) => clickedItem(item, itemx, i)}
                  priceStyle={{
                    color: eachTabData.available === 1 ? '#292929' : 'red',
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    fontWeight: '700',
                    lineHeight: 20,
                  }}
                />
              </View>
            );
          })}
          {/* <FlatList
            initialScrollIndex={
              clickedItemPos >= 0 && clickedItemPos < datapos
                ? clickedItemPos
                : 0
            }
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            data={item.data}
            removeClippedSubviews={true}
            //style={{flexGrow:1,flex:1}}
            //initialNumToRender={item.data.length}
            initialNumToRender={itemSize}
            nestedScrollEnabled={true}
            ItemSeparatorComponent={() => {
              return <View style={styles.listserviceItemDivider} />;
            }}
            maxToRenderPerBatch={15}
            bounces={false}
            //windowSize={100} //ali kazmi
            //maxToRenderPerBatch={itemSize} //ali kazmi
            //updateCellsBatchingPeriod={25} //ali kazmi
            onEndReachedThreshold={0.1}
            keyExtractor={(item, index) => `${index}`}
            renderItem={({item: eachTabData, index}) => (
              <AccordItem
                eachTabData={eachTabData}
                index={index}
                clickedItem={(itemx, i) => clickedItem(item, itemx, i)}
                priceStyle={{
                  color: eachTabData.available === 1 ? '#292929' : 'red',
                  fontFamily: 'Rubik',
                  fontSize: 16,
                  fontWeight: '700',
                  lineHeight: 20,
                }}
              />
            )}
          /> */}
        </View>
      </List.Accordion>
      {size - 1 === index ? <View style={styles.listservicedivider} /> : null}
    </View>
  );
};

export default AccordationItem;

const styles = StyleSheet.create({
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
