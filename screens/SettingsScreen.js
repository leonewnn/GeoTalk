import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, RadioButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { loadSettings, saveSettings } from '../services/settings';

export default function SettingsScreen() {
  const [radius, setRadius] = useState(1000);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await loadSettings();
        setRadius(settings.radius);
        setLanguage(settings.language);
      } catch (error) {
        console.error('Could not load settings', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      await saveSettings({ radius, language });
      Alert.alert('Settings saved', 'Your preferences have been saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Could not save settings');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.subtitle}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Radius slider */}
        <View style={styles.section}>
          <Text style={styles.label}>Search Radius</Text>
          <Text style={styles.value}>{(radius / 1000).toFixed(1)} km</Text>
          <Slider
            style={styles.slider}
            minimumValue={1000}
            maximumValue={10000}
            step={500}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor="#6200ee"
            maximumTrackTintColor="#d0d0d0"
          />
        </View>

  
        <View style={styles.section}>
          <Text style={styles.label}>Language</Text>
          <RadioButton.Group onValueChange={setLanguage} value={language}>
            <Pressable style={styles.radioRow} onPress={() => setLanguage('en')}>
              <RadioButton value="en" />
              <Text style={styles.radioLabel}>English</Text>
            </Pressable>
            <Pressable style={styles.radioRow} onPress={() => setLanguage('fr')}>
              <RadioButton value="fr" />
              <Text style={styles.radioLabel}>Français</Text>
            </Pressable>
            <Pressable style={styles.radioRow} onPress={() => setLanguage('fi')}>
              <RadioButton value="fi" />
              <Text style={styles.radioLabel}>Suomi (Finnish)</Text>
            </Pressable>
          </RadioButton.Group>
        </View>

    
        <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
          Save Settings
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioLabel: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  saveBtn: {
    marginTop: 16,
    borderRadius: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
});
