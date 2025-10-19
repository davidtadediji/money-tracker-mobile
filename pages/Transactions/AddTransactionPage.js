import React, { useState } from 'react';
import { View, Text, TextInput, Button, Picker } from 'react-native';

const AddTransactionPage = () => {
  const [type, setType] = useState('Inflow'); // Default to Inflow
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleAddTransaction = () => {
    // Add transaction logic here
    console.log('Adding transaction:', { type, amount, category, description });
  };

  return (
    <View>
      <Text>Add Transaction</Text>
      <Picker selectedValue={type} onValueChange={(itemValue) => setType(itemValue)}>
        <Picker.Item label="Inflow" value="Inflow" />
        <Picker.Item label="Outflow" value="Outflow" />
      </Picker>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Add Transaction" onPress={handleAddTransaction} />
    </View>
  );
};

export default AddTransactionPage;