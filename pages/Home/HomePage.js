import React, { useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';

const HomePage = () => {
  const [timeView, setTimeView] = useState('All Time'); // Default time view

  const handleTimeViewChange = (view) => {
    setTimeView(view);
    // Fetch and update totals/transactions based on the selected time view
  };

  return (
    <View>
      <Text>Balance Sheet</Text>
      <View>
        <Button title="Daily" onPress={() => handleTimeViewChange('Daily')} />
        <Button title="Weekly" onPress={() => handleTimeViewChange('Weekly')} />
        <Button title="Monthly" onPress={() => handleTimeViewChange('Monthly')} />
        <Button title="Yearly" onPress={() => handleTimeViewChange('Yearly')} />
        <Button title="All Time" onPress={() => handleTimeViewChange('All Time')} />
      </View>
      <View>
        <Text>Inflow: $X</Text>
        <Text>Outflow: $Y</Text>
        <Text>Net Balance: $Z</Text>
      </View>
      <FlatList
        data={[]} // Replace with transactions filtered by timeView
        renderItem={({ item }) => <Text>{item.description}</Text>}
      />
    </View>
  );
};

export default HomePage;