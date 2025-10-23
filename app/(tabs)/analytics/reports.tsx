import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function Reports() {
  const router = useRouter();
  const [from, setFrom] = useState('2025-10-01');
  const [to, setTo] = useState('2025-10-31');
  const [category, setCategory] = useState('');

  const generate = () => {
    Alert.alert('Report Generated', `From ${from} to ${to}${category ? `, Category: ${category}` : ''}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Reports</Text>
      <TextInput style={styles.input} placeholder="From (YYYY-MM-DD)" value={from} onChangeText={setFrom} placeholderTextColor="#777" />
      <TextInput style={styles.input} placeholder="To (YYYY-MM-DD)" value={to} onChangeText={setTo} placeholderTextColor="#777" />
      <TextInput style={styles.input} placeholder="Category (optional)" value={category} onChangeText={setCategory} placeholderTextColor="#777" />
      <TouchableOpacity style={styles.primaryButton} onPress={generate}>
        <Text style={styles.primaryButtonText}>Generate</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.secondaryButton]} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  primaryButton: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignSelf: 'flex-start' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start', marginTop: 10 },
  secondaryButtonText: { color: '#111', fontWeight: '600' },
});
