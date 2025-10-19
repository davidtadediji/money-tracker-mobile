import React from 'react';
import { View, Text, Button } from 'react-native';

const SettingsPage = () => {
  return (
    <View>
      <Text>Settings</Text>
      <Button title="Manage Notifications" onPress={() => console.log('Manage Notifications')} />
      <Button title="Set Categories" onPress={() => console.log('Set Categories')} />
      <Button title="Change Currency" onPress={() => console.log('Change Currency')} />
    </View>
  );
};

export default SettingsPage;