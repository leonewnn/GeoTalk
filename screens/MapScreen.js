import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable, useWindowDimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { getNearby } from '../services/wiki';
import { FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapScreen() {
  const [coords, setCoords] = useState(null); 
  const [errorMsg, setErrorMsg] = useState(null);
  const [pois, setPois] = useState([]);
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [sheetOpen, setSheetOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg("Permission to access location was denied");
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
      } catch (e) {
        setErrorMsg(e?.message ?? 'Failed to get location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch nearby POIs once we have coordinates (static fetch for now)
  useEffect(() => {
    if (!coords) return;
    (async () => {
      try {
        const results = await getNearby(coords.latitude, coords.longitude);
        setPois(results);
      } catch (e) {
        // keep it minimal: fail silently for POIs, location already handled above
      }
    })();
  }, [coords]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.subtle}>Fetching your location…</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{errorMsg}</Text>
        <Text style={styles.subtle}>Enable location permission to use the map.</Text>
      </View>
    );
  }

  const region = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
      >

        <Marker coordinate={coords} title="You are here" />

  
        {pois.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lon }}
            title={p.title}
          />
        ))}
      </MapView>

    
      <View style={[styles.fabContainer, { top: insets.top + 16 }]} pointerEvents="box-none">
        <FAB
          icon="crosshairs-gps"
          size="small"
          onPress={() => {
            if (!coords || !mapRef.current) return;
            mapRef.current.animateToRegion(
              {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              300
            );
          }}
          disabled={!coords}
          style={styles.fab}
        />
      </View>

      {/* Simple collapsible bottom panel for nearby places */}
      <View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + 8,
            height: sheetOpen ? Math.min(400, Math.max(240, height * 0.45)) : 44,
          },
        ]}
      >
        <Pressable style={styles.sheetHandle} onPress={() => setSheetOpen((v) => !v)}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>Nearby Places</Text>
          <Text style={styles.sheetCount}>{pois.length}</Text>
        </Pressable>

        {sheetOpen && (
          <FlatList
            data={pois}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.poiItem}>
                <Text style={styles.poiTitle}>{item.title}</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4 }}
          />)
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  subtle: {
    marginTop: 8,
    color: '#666',
  },
  error: {
    color: '#b00020',
    fontWeight: '600',
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
  },
  fab: {
    borderRadius: 28,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  grabber: {
    position: 'absolute',
    top: 8,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
  },
  sheetTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1f2937',
  },
  sheetCount: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  poiItem: {
    paddingVertical: 10,
  },
  poiTitle: {
    fontSize: 15,
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
