import React, { useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';

const TransactionListPage = () => {
  const [timeView, setTimeView] = useState('All Time'); // Default time view

  const handleTimeViewChange = (view) => {
    setTimeView(view);
    // Fetch and update transactions based on the selected time view
  };

  return (
    <View>
      <Text>Transactions</Text>
      <View>
        <Button title="Daily" onPress={() => handleTimeViewChange('Daily')} />
        <Button title="Weekly" onPress={() => handleTimeViewChange('Weekly')} />
        <Button title="Monthly" onPress={() => handleTimeViewChange('Monthly')} />
        <Button title="Yearly" onPress={() => handleTimeViewChange('Yearly')} />
        <Button title="All Time" onPress={() => handleTimeViewChange('All Time')} />
      </View>
      <FlatList
        data={[]} // Replace with transactions filtered by timeView
        renderItem={({ item }) => (
          <View>
            <Text>{item.description}</Text>
            <Text>{item.amount}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default TransactionListPage;