import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import ChaosOutline from './components/ChaosOutline'; // Corrected component import

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chaos Equation Visualizer</Text>
      <ChaosOutline />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
});

export default App;
