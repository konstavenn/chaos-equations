import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import ChaosArtView from './components/ChaosArtView';
import ChaosArt from './components/ChaosArt';  

const App = () => {
  const [isPaused, setIsPaused] = useState(false);
  const chaosArt = ChaosArt.getInstance();
  const [tValue, setTValue] = useState(`t = ${chaosArt.currentTime.toFixed(4)}`);
  const [equationText, setEquationText] = useState('');


  useEffect(() => {
    const chaosArt = ChaosArt.getInstance();
    const handleEquationUpdate = (updatedEquation: string) => {
      setEquationText(updatedEquation);
    };

    chaosArt.registerListener(handleEquationUpdate);

    // Initial update on component mount
    chaosArt.updateEquationString();

    return () => {
      chaosArt.removeListener(handleEquationUpdate);
    };
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setTValue(`t = ${chaosArt.currentTime.toFixed(4)}`);  // Update with "t = " prepended
    }, 50); // Update every 100 milliseconds

    return () => clearInterval(interval);  // Clean up the interval on component unmount
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chaos Equation Visualizer</Text>
      <View style={styles.glViewContainer}>
        <ChaosArtView isPaused={isPaused} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.textBoxLeft}>{equationText}</Text>
        <Text style={styles.textBoxRight}>{tValue}</Text>
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
    marginBottom: 20,
  },
  glViewContainer: {
    flex: 0.7,
    width: '100%',
    paddingTop: 0,
    marginTop: 0,
    alignItems: 'center',
  },
  textContainer: {
    flex: 0.2,
    flexDirection: 'row',  // Change to row to align text boxes side by side
    justifyContent: 'space-between',  // Adjust spacing to space-between to push to left and right
    alignItems: 'center',  // Center align vertically
    paddingHorizontal: 10,  // Add horizontal padding for overall spacing
    marginBottom: 10,
  },  
  textBoxRight: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
    textAlign: 'right',  // Align text right for the tValue
  },
  textBoxLeft: {
    color: '#fff',
    fontSize: 12,
    flex: 2,
    textAlign: 'left',  // Align text left for the equationText
  },  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginBottom: 0,
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
