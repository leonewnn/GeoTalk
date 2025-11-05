import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PoiDetailScreen from './screens/PoiDetailScreen';
import { SQLiteProvider } from 'expo-sqlite';
import { createSchema as createFavoritesSchema } from './services/favorites';
import { createDownloadsSchema } from './services/downloads';

import MapScreen from './screens/MapScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import DownloadScreen from './screens/DownloadScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MapStackNav = createNativeStackNavigator();

function MapStack() {
  return (
    <MapStackNav.Navigator>
      <MapStackNav.Screen name="MapHome" component={MapScreen} options={{ headerShown: false }} />
      <MapStackNav.Screen name="PoiDetail" component={PoiDetailScreen} options={{ title: 'Point of Interest' }} />
    </MapStackNav.Navigator>
  );
}

export default function App() {
  const initializeDb = async (db) => {
    await createFavoritesSchema(db);
    await createDownloadsSchema(db);
  };

  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName="geotalk.db"
        onInit={initializeDb}
        onError={(e) => console.error('SQLite error', e)}
      >
        <NavigationContainer>
          <StatusBar style="auto" />
          <Tab.Navigator
            initialRouteName="Map"
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: '#6200ee',
              tabBarInactiveTintColor: '#9e9e9e',
            }}
          >
            <Tab.Screen
              name="Map"
              component={MapStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="map" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="heart-outline" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Download"
              component={DownloadScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="download" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="history" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
