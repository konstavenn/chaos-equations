import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Svg, Circle, Line } from 'react-native-svg';
import ChaosArt from './ChaosArt';
import { GLView } from 'expo-gl';

interface Point {
    x: number;
    y: number;
    opacity: number;
}

const ChaosCanvas = () => {
    const { width, height } = Dimensions.get('window');
    const centerX = width / 2;
    const centerY = height / 2;
    const axisLength = 100; // Visual range of the cross


    return (
        <View style={styles.fullFlex}>
            <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`}>
                {/* Horizontal Line (X-axis) */}
                <Line
                    x1={centerX - axisLength}
                    y1={centerY}
                    x2={centerX + axisLength}
                    y2={centerY}
                    stroke="yellow"
                    strokeWidth="2"
                />
                {/* Vertical Line (Y-axis) */}
                <Line
                    x1={centerX}
                    y1={centerY - axisLength}
                    x2={centerX}
                    y2={centerY + axisLength}
                    stroke="yellow"
                    strokeWidth="2"
                />

            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    fullFlex: {
        width: '100%',
        height: '100%',
    },
});

export default ChaosCanvas;
