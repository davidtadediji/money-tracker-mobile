import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState('');
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState('');

  const handleSave = () => {
    console.log('Profile saved', {
      name,
      email,
      monthlyIncomeTarget,
      monthlyBudgetLimit,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.avatar} />

      <View style={styles.group}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Monthly Income Target</Text>
        <TextInput
          style={styles.input}
          value={monthlyIncomeTarget}
          onChangeText={setMonthlyIncomeTarget}
          keyboardType="numeric"
          placeholder="e.g. 3000"
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Monthly Budget Limit</Text>
        <TextInput
          style={styles.input}
          value={monthlyBudgetLimit}
          onChangeText={setMonthlyBudgetLimit}
          keyboardType="numeric"
          placeholder="e.g. 2000"
        />
      </View>

      <Button title="Save" onPress={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  header: { fontSize: 20, fontWeight: '600' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    backgroundColor: '#ddd',
    marginVertical: 4,
  },
  group: { gap: 8 },
  label: { fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

