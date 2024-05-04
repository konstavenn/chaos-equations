import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Svg, Rect } from 'react-native-svg';
import Chaos from './Chaos'; // Assuming both components are in the same directory

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const ChaosOutline = () => {
  return (
    <View style={styles.container}>
      <Svg height={screenHeight} width={screenWidth} viewBox="0 0 100 100">
        <Rect x="5" y="0" width="90" height="80" fill="black" stroke="white" />
        <Chaos />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10, // Added padding to ensure the SVG is not touching the edges
  },
});

export default ChaosOutline;
