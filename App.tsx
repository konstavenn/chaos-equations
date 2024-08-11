import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import ChaosArtView from './components/ChaosArtView';
import ChaosArt from './components/ChaosArt';  

const App = () => {
  // State to control pause/play of the visualization
  const [isPaused, setIsPaused] = useState(false);
  
  // Get the singleton instance of ChaosArt
  const chaosArt = ChaosArt.getInstance();
  
  // State to hold the current time value of the chaos equation
  const [tValue, setTValue] = useState(`t = ${chaosArt.currentTime.toFixed(4)}`);
  
  // State to hold the current equation text
  const [equationText, setEquationText] = useState('');

  // Effect to handle equation updates
  useEffect(() => {
    // Handler function to update equation text
    const handleEquationUpdate = (updatedEquation: string) => {
      setEquationText(updatedEquation);
    };

    // Register the handler with ChaosArt
    chaosArt.registerListener(handleEquationUpdate);

    // Initial update on component mount
    chaosArt.updateEquationString();

    // Cleanup function to remove the listener when component unmounts
    return () => {
      chaosArt.removeListener(handleEquationUpdate);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Effect to update the time value periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setTValue(`t = ${chaosArt.currentTime.toFixed(4)}`);
      }
    }, 50); // Update every 50ms

    // Cleanup function to clear the interval when component unmounts
    return () => clearInterval(interval);
  }, [isPaused]); // Re-run effect if isPaused changes

  // Function to toggle pause state
  const togglePause = () => {
    setIsPaused(!isPaused);
    chaosArt.togglePause(); // Toggle pause in ChaosArt instance
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

// Styles for the component
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
    flexDirection: 'row',  // Align text boxes side by side
    justifyContent: 'space-between',  // Push to left and right
    alignItems: 'center',  // Center align vertically
    paddingHorizontal: 10,  // Add horizontal padding
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