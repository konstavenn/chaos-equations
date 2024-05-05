import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import ChaosArtView from './components/ChaosArtView';
import { nextChaosEquation } from './components/ChaosArtView';
import ChaosArt from './components/ChaosArt';  

const App = () => {
  const [isPaused, setIsPaused] = useState(false);
  const chaosArt = ChaosArt.getInstance();

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chaos Equation Visualizer</Text>
      <View style={styles.glViewContainer}>
        <ChaosArtView />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={togglePause}>
          <Text style={styles.buttonText}>{isPaused ? 'Play' : 'Pause'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => chaosArt.initChaosArt()}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20, // Reduced to minimize space below the title
  },
  glViewContainer: {
    flex: 0.7, // Adjusted for better space utilization
    width: '100%',
    //paddingHorizontal: 10, // Padding horizontal for some side space if needed
    paddingTop: 0, // Reduced or removed padding top
    marginTop: 0,
    alignItems: 'center', // Ensures children are centered horizontally
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10, // Padding vertical to bring buttons closer to the GL view
    marginBottom: 0, // Ensure there's some space at the bottom
  },
  button: {
    width: 100,
    height: 40,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  }
});

export default App;

