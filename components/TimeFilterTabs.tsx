import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

type TimeFilterTabsProps = {
  selected: TimeRange;
  onSelect: (value: TimeRange) => void;
};

export const TimeFilterTabs = ({ selected, onSelect }: TimeFilterTabsProps) => {
  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={selected}
        onValueChange={value => onSelect(value as TimeRange)}
        buttons={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});