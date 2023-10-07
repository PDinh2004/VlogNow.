import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableHighlight, 
  SafeAreaView, 
  Linking,
  LogBox
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useEffect } from 'react';

import MainScreen from './app/Screens/MainScreen';
import WelcomeScreen from './app/Screens/WelcomeScreen';
import RecordScreen from './app/Screens/RecordScreen';
import LoginScreen from './app/Screens/LoginScreen';
import UserScreen from './app/Screens/UserScreen';
import FriendScreen from './app/Screens/FriendScreen';
import AdditionalInfoScreen from './app/Screens/AdditionalInfoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  LogBox.ignoreAllLogs(); //Ignore all log notifications
  console.log("works");

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={WelcomeScreen}
        />

        <Stack.Screen 
          name="MainPage"
          component={MainScreen}
        />

        <Stack.Screen 
          name="RecordScreen"
          component={RecordScreen}
        />

        <Stack.Screen 
          name="LoginScreen"
          component={LoginScreen}
        />

        <Stack.Screen 
          name="UserScreen"
          component={UserScreen}
        />

        <Stack.Screen 
          name="FriendScreen"
          component={FriendScreen}
        />

        <Stack.Screen
          name="AdditionalInfoScreen"
          component={AdditionalInfoScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}