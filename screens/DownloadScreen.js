import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { listDownloads, removeDownload } from '../services/downloads';

export default function DownloadScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        try {
          const rows = await listDownloads(db);
          if (active) setItems(rows);
        } catch (e) {
          console.error('Could not load downloads', e);
          if (active) setItems([]);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [db])
  );

  const handleRemove = async (item) => {
    try {
      await removeDownload(db, item.pageid, item.title);
      const rows = await listDownloads(db);
      setItems(rows);
    } catch (e) {
      console.error('Failed to remove download', e);
    }
  };

  const onPressItem = (item) => {
    Alert.alert(
      item.title,
      'Open details for this downloaded place?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: () => navigation.navigate('Map', { 
            screen: 'PoiDetail', 
            params: { 
              title: item.title,
              offlineData: {  // <-- ajouter les données locales
                id: item.pageid,
                title: item.title,
                image: item.image,
                url: item.url,
                extract: item.extract,
                description: null, // pas stocké dans downloads
              }
            } 
          }) 
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.subtle}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!items.length) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.subtle}>No downloads</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    const imageUri = item.image ?? null;
    return (
      <Pressable onPress={() => onPressItem(item)} style={styles.row}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.thumb} /> : <View style={[styles.thumb, styles.thumbPlaceholder]} />}
        <View style={styles.meta}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.small}>Downloaded</Text>
        </View>
        <Pressable onPress={() => handleRemove(item)} style={styles.removeBtn}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id ?? item.pageid ?? item.title)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#fff' },
  subtle: { color:'#6b7280', marginTop:8 },
  row: { flexDirection:'row', alignItems:'center', paddingVertical:10 },
  thumb: { width:56, height:56, borderRadius:6, backgroundColor:'#e5e7eb' },
  thumbPlaceholder: { backgroundColor:'#f3f4f6' },
  meta: { flex:1, marginLeft:12 },
  title: { fontSize:16, color:'#111827' },
  small: { fontSize:12, color:'#10b981', marginTop:4 },
  removeBtn: { paddingHorizontal:10, paddingVertical:6 },
  removeText: { color:'#b00020', fontWeight:'600' },
  separator: { height:1, backgroundColor:'#eee', marginVertical:2 },
});
