import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { listHistory, clearHistory } from '../services/history';
import { ActivityIndicator, Button } from 'react-native-paper';

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        try {
          const rows = await listHistory(db);
          if (active) setItems(rows);
        } catch (e) {
          console.error('Could not load history', e);
          if (active) setItems([]);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [db])
  );

  const handleClear = () => {
    Alert.alert(
      'Clear history',
      'Remove all visited places?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory(db);
              setItems([]);
            } catch (e) {
              console.error('Failed to clear history', e);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onPressItem = (item) => {
    Alert.alert(
      item.title,
      'Open details for this place?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: () =>
            navigation.navigate('Map', {
              screen: 'PoiDetail',
              params: { title: item.title },
            }),
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
        <Text style={styles.subtle}>No history yet</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <Pressable onPress={() => onPressItem(item)} style={styles.row}>
      <View style={styles.bullet} />
      <View style={styles.meta}>
        <Text style={styles.title}>{item.title}</Text>
        {item.visited_at ? (
          <Text style={styles.small}>{item.visited_at}</Text>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Button onPress={handleClear} compact>
          Clear
        </Button>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id ?? item.pageid ?? item.title)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  subtle: { color: '#6b7280', marginTop: 8 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6200ee',
    marginRight: 12,
  },
  meta: { flex: 1 },
  title: { fontSize: 16, color: '#111827' },
  small: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 2 },
});
