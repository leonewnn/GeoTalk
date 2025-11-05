import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { getSummary } from '../services/wiki';
import { loadSettings } from '../services/settings';
import * as Speech from 'expo-speech'; 
import { useSQLiteContext } from 'expo-sqlite';
import { addFavorite, removeFavorite, isFavorite } from '../services/favorites';
import { addDownload, isDownloaded } from '../services/downloads';

export default function PoiDetailScreen({ route }) {
  const { title, offlineData } = route.params;
  const db = useSQLiteContext();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [fav, setFav] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let s;
        if (offlineData) {
          // Use offline data directly
          s = offlineData;
        } else {
          // Fetch from API with user's language setting
          const settings = await loadSettings();
          s = await getSummary(title, settings.language);
        }
        
        if (mounted) {
          setData(s);
          const f = await isFavorite(db, s.id, s.title);
          setFav(f);
          const d = await isDownloaded(db, s.id, s.title);
          setDownloaded(!!d);
        }
      } catch (e) {
        if (mounted) setError(e?.message ?? 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      Speech.stop();
    };
  }, [title, offlineData, db]);

  // --- TTS handler ---
  const handleSpeak = () => {
    if (!data) return;
    const text =
      data.extract?.trim()?.length ? data.extract : `${data.title}${data.description ? '. ' + data.description : ''}`;

    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }

    Speech.speak(text, {
      language: 'en', // keep simple for now
      rate: 1.0,
      pitch: 1.0,
      onStart: () => setSpeaking(true),
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const handleToggleFavorite = async () => {
    if (!data) return;
    try {
      if (fav) {
        await removeFavorite(db, data.id, data.title);
        setFav(false);
      } else {
        await addFavorite(db, data); // uses id,title,image,url
        setFav(true);
      }
    } catch (e) {
      console.error('Favorite toggle failed', e);
    }
  };

  const handleDownload = async () => { // <-- add
    if (!data) return;
    try {
      await addDownload(db, {
        id: data.id,
        title: data.title,
        image: data.image,
        url: data.url,
        extract: data.extract,
      });
      setDownloaded(true);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.subtle}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  const imageUrl = data?.image;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.hero} resizeMode="cover" />
      ) : null}

      <Text style={styles.title}>{data?.title}</Text>
      {data?.description ? <Text style={styles.desc}>{data.description}</Text> : null}
      {data?.extract ? <Text style={styles.extract}>{data.extract}</Text> : null}

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon={speaking ? 'stop' : 'volume-high'}
          onPress={handleSpeak}
          style={styles.btn}
        >
          {speaking ? 'Stop Audio' : 'Play Audio'}
        </Button>
        <Button
          mode="contained"
          icon={fav ? 'heart' : 'heart-outline'}
          onPress={handleToggleFavorite}
          style={styles.btn}
        >
          {fav ? 'Remove Favorite' : 'Add to Favorites'}
        </Button>
        <Button
          mode={downloaded ? 'outlined' : 'contained'} // <-- add
          icon={downloaded ? 'check' : 'cloud-download-outline'}
          onPress={handleDownload}
          style={styles.btn}
          disabled={downloaded}
        >
          {downloaded ? 'Downloaded' : 'Download'}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  hero: { width: '100%', height: 220, backgroundColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '700', paddingHorizontal: 16, marginTop: 12, color: '#111827' },
  desc: { paddingHorizontal: 16, marginTop: 6, color: '#6b7280' },
  extract: { paddingHorizontal: 16, marginTop: 10, lineHeight: 20, color: '#374151' },
  actions: { paddingHorizontal: 16, marginTop: 16, gap: 10 },
  btn: { borderRadius: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  subtle: { marginTop: 8, color: '#6b7280' },
  error: { color: '#b00020', textAlign: 'center' },
});