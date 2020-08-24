import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

import {Title} from '@shoutem/ui';
import AccordItem from './AccordItem';
import {Animated} from 'react-native';
import DummyLoader from './../util/DummyLoader';
import Fade from './../util/Fade';

export default class TabSectionList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.sectionListRef = React.createRef();
    this.flatListRef = React.createRef();
    this.absoluteflatListRef = React.createRef();
    this.ontabClick = this.ontabClick.bind(this);
    this.onChangeViewable = this.onChangeViewable.bind(this);
    this.headerView = this.headerView.bind(this);
    this.blockUpdateIndex = false;
    this.tabRef = React.createRef();
    this.state = {
      currentIndex: 0,
      scrollY: new Animated.Value(0),
      tabBarElevation: false,
      HeaderHeight: 0,
      TabBarHeight: 0,
      tabbarY: 0,
      headerY: 0,
    };
  }

  renderItem = ({item, index}) => {
    const {clickedItem} = this.props;
    return (
      <AccordItem
        eachTabData={item}
        clickedItem={() => {
          clickedItem(item, index);
        }}
        priceStyle={StyleSheet.flatten([
          {
            color: item.available === 1 ? '#292929' : 'red',
            fontFamily: 'Rubik',
            fontSize: 16,
            fontWeight: '700',
            lineHeight: 20,
          },
        ])}
      />
    );
  };

  renderSection = ({section}) => {
    return (
      <View style={styles.sectioncontainer}>
        <View style={styles.itemtitlecontainer}>
          <Title style={styles.SectionText}>{section.title}</Title>
          <Title style={styles.itemDescription}>{section.description}</Title>
        </View>
      </View>
    );
  };

  renderTab = (index, item) => {
    return (
      <TouchableWithoutFeedback onPress={() => this.ontabClick(item, index)}>
        <View
          style={[
            styles.tabContainer,
            {
              borderBottomWidth: this.state.currentIndex === index ? 1.5 : 0,
              borderBottomColor: '#3daccf',
            },
          ]}>
          <Text
            style={[
              styles.tabText,
              {
                color:
                  this.state.currentIndex === index ? '#3daccf' : '#9e9e9e',
              },
            ]}>
            {`${item.title}`}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  ontabClick = (item, index) => {
    this.setState({
      currentIndex: index,
    });
    this.blockUpdateIndex = true;
    this.changeTopIndex(index);
    this.changeSectionIndex(index);
    //this.visibility();
  };

  onChangeViewable = vi => {
    const viewableitems = vi.viewableItems;
    if (viewableitems !== undefined && viewableitems.length > 0) {
      const id = viewableitems[0].section.id;
      let visiblepos = 0;
      if (visiblepos === 1) {
        visiblepos = 0;
      } else {
        visiblepos = id - 1;
      }
      if (!this.blockUpdateIndex && this.state.currentIndex !== visiblepos) {
        this.changeTopIndex(visiblepos);
        this.setState({
          currentIndex: visiblepos,
        });
      }
    }
  };

  changeTopIndex = index => {
    const ref = this.flatListRef.current.getNode();
    if (ref && ref.scrollToIndex) {
      ref.scrollToIndex({
        animated: true,
        index: index,
      });
    }

    const abRef = this.absoluteflatListRef;
    if (abRef && abRef.current) {
      abRef.current.getNode().scrollToIndex({
        animated: true,
        index: index,
      });
    }
  };

  changeSectionIndex = index => {
    const ref = this.sectionListRef.current.getNode();
    if (ref && ref.scrollToLocation) {
      ref.scrollToLocation({
        animated: true,
        itemIndex: 0,
        sectionIndex: index,
      });
    }
  };

  headerView = () => {
    const {myHeader} = this.props;
    return (
      <Animated.View
        style={{
          width: '100%',
          backgroundColor: 'white',
        }}
        onLayout={e => {
          const {height, y} = e.nativeEvent.layout;
          this.setState({HeaderHeight: height, headerY: y});
        }}>
        {myHeader}
      </Animated.View>
    );
  };

  tabView = () => {
    const {productList = []} = this.props;

    return (
      <Animated.View
        style={{
          width: '100%',
          backgroundColor: 'white',
        }}
        ref={this.tabRef}
        onLayout={e => {
          const {height, y} = e.nativeEvent.layout;
          this.setState({
            TabBarHeight: height,
            tabbarY: y,
          });
        }}>
        <Animated.FlatList
          ref={this.flatListRef}
          data={productList}
          renderItem={({item, index}) => this.renderTab(index, item)}
          keyExtractor={item => `${item.id}`}
          horizontal
          alwaysBounceHorizontal={false}
          alwaysBounceVertical={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={() => {}}
          // getItemLayout={(data, index) => ({
          //   length: 56,
          //   offset: 56 * index,
          //   index: index,
          // })}
        />
      </Animated.View>
    );
  };

  tabAbsoluteView = () => {
    const {productList = []} = this.props;
    const {tabBarElevation, HeaderHeight, TabBarHeight} = this.state;

    return (
      <Fade
        style={{
          top: 0,
          zIndex: 1,
          position: 'absolute',
          width: '100%',
          backgroundColor: 'white',
          ...Platform.select({
            android: {
              elevation: 4,
            },
            ios: {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.23,
              shadowRadius: 2.62,
            },
          }),
        }}
        visible={tabBarElevation}>
        <Animated.FlatList
          ref={this.absoluteflatListRef}
          data={productList}
          renderItem={({item, index}) => this.renderTab(index, item)}
          keyExtractor={item => `${item.id}`}
          horizontal
          alwaysBounceHorizontal={false}
          alwaysBounceVertical={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={() => {}}
          // getItemLayout={(data, index) => ({
          //   length: 56,
          //   offset: 56 * index,
          //   index: index,
          // })}
        />
      </Fade>
    );
  };

  // componentDidMount() {
  //   this.listerner = this.state.scrollY.addListener(data => {
  //     const {value} = data;
  //     //const sum = this.state.headerY + this.state.tabbarY;
  //     //console.log('tabbarY', tabbarY);
  //     this.tabRef.current.getNode().measure((x, y, width, height, px, py) => {
  //       console.log('py', py);
  //       this.setState({
  //         tabBarElevation: py <=56 ? true : false,
  //       });
  //     });
  //   });
  // }

  // componentWillUnmount() {
  //   if (this.state.scrollY) {
  //     this.state.scrollY.removeAllListeners();
  //   }
  // }

  _onScroll = e =>{
    this.tabRef.current.getNode().measure((x, y, width, height, px, py) => {
      //console.log('py', py);
      this.setState({
        tabBarElevation: py <= 96 ? true : false,
      });
    });
  }

  _onScrollEndDrag = e => {};

  _onMomentumScrollBegin = () => {};

  _onMomentumScrollEnd = () => {
    this.blockUpdateIndex = false;
    //this.visibility();
  };

  visibility = () => {
    const ref = this.tabRef.current.getNode();
    if (ref) {
      ref.measure((x, y, width, height, px, py) => {
        console.log(py);
        if (py <= 1) {
          this.setState({
            tabBarElevation: true,
          });
        } else {
          this.setState({
            tabBarElevation: false,
          });
        }
      });
    }
  };

  render() {
    const {productList = [], visibility} = this.props;
    return (
      <>
        {this.tabAbsoluteView()}
        <DummyLoader
          visibilty={visibility}
          center={
            productList && productList.length > 0 ? (
              <Animated.SectionList
                ref={this.sectionListRef}
                ListHeaderComponent={() => (
                  <>
                    {this.headerView()}
                    {this.tabView()}
                  </>
                )}
                sections={productList}
                keyExtractor={item => `${item.id}`}
                initialNumToRender={10}
                bounces={false}
                alwaysBounceVertical={false}
                alwaysBounceHorizontal={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                initialScrollIndex={this.state.currentIndex}
                renderSectionHeader={this.renderSection}
                renderItem={this.renderItem}
                onViewableItemsChanged={this.onChangeViewable}
                onMomentumScrollBegin={this._onMomentumScrollBegin}
                onMomentumScrollEnd={this._onMomentumScrollEnd}
                onScrollEndDrag={this._onScrollEndDrag}
                scrollEventThrottle={1}
                stickySectionHeadersEnabled
                decelerationRate="fast"
                viewabilityConfig={{
                  minimumViewTime: 10,
                  itemVisiblePercentThreshold: 10,
                }}
                style={{
                  marginTop:this.state.tabBarElevation ? 56 : 0
                }}
                onScrollToIndexFailed={() => {}}
                // getItemLayout={(data, index) => ({
                //   length: 96,
                //   offset: 96 * index,
                //   index,
                // })}
                scrollToOverflowEnabled={true}
                onScroll={Animated.event(
                  [
                    {
                      nativeEvent: {
                        contentOffset: {
                          y: this.state.scrollY,
                        },
                      },
                    },
                  ],
                  {useNativeDriver: true, listener:this._onScroll},
                )}
              />
            ) : null
          }
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  sectioncontainer: {
    flex: 1,
    borderColor: '#DEDEDE',
    borderWidth: 1,
    backgroundColor: 'white',
  },
  itemtitlecontainer: {
    flex: 1,
    margin: 10,
    borderRadius: 2,
  },
  topabsoluteview: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'white',
    ...Platform.select({
      android: {
        elevation: 6,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
      },
    }),
  },
  SectionText: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 25,
    color: '#3daccf',
  },
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 1,
  },
  tabContainer: {
    borderBottomColor: '#090909',
    height: 56,
  },
  tabText: {
    padding: 15,
    color: '#9e9e9e',
    fontSize: 18,
    fontWeight: '500',
  },
  separator: {
    height: 0.5,
    width: '96%',
    alignSelf: 'flex-end',
    backgroundColor: '#eaeaea',
  },
  sectionHeaderContainer: {
    height: 10,
    backgroundColor: '#f6f6f6',
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 1,
  },
  sectionHeaderText: {
    color: '#010101',
    backgroundColor: '#fff',
    fontSize: 23,
    fontWeight: 'bold',
    paddingTop: 25,
    paddingBottom: 5,
    paddingHorizontal: 15,
  },
  itemContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  itemTitle: {
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 25,
  },
  itemDescription: {
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 25,
  },
  image: {
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
});
