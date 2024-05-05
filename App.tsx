import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ChaosArtView from './components/ChaosArtView';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chaos Equation Visualizer</Text>
      <View style={styles.glViewContainer}>
        <ChaosArtView />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center', // This centers content vertically if flex is not filling the space
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,  // Adjust as needed to place the title higher
    marginBottom: 20, // Add space below the title
  },
  glViewContainer: {
    flex: 1, // This takes up all available space after considering title and margins
    width: '100%', // Ensure the GLView container uses full width
    paddingTop: 120, // Push the GLView lower
  }
});
export default App;
