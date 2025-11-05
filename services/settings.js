

import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'geotalk_settings';

// Default settings
const DEFAULT_SETTINGS = {
  radius: 1000, 
  language: 'en', 
};


export async function loadSettings() {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_KEY);
    if (value !== null) {
      return JSON.parse(value);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings', error);
    return DEFAULT_SETTINGS;
  }
}


export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings', error);
    throw error;
  }
}

export default { loadSettings, saveSettings };
