// Main App Component with Navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ReadingScreen from './src/screens/ReadingScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import HymnsScreen from './src/screens/HymnsScreen';
import HymnViewerScreen from './src/screens/HymnViewerScreen';
import ReadingPlansScreen from './src/screens/ReadingPlansScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFF8E7' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Reading" component={ReadingScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Hymns" component={HymnsScreen} />
        <Stack.Screen name="HymnViewer" component={HymnViewerScreen} />
        <Stack.Screen name="ReadingPlans" component={ReadingPlansScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
