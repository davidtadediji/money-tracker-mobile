import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

type BalanceHeaderProps = {
  totalInflow: number;
  totalOutflow: number;
  netBalance: number;
};

export const BalanceHeader = ({
  totalInflow,
  totalOutflow,
  netBalance,
}: BalanceHeaderProps) => {
  const theme = useTheme();

  return (
    <Surface style={styles.surface}>
      <Text variant="headlineMedium" style={styles.balance}>
        ${netBalance.toFixed(2)}
      </Text>
      <View style={styles.flowContainer}>
        <View style={styles.flowItem}>
          <Text variant="labelMedium">Income</Text>
          <Text 
            variant="titleMedium" 
            style={{ color: theme.colors.primary }}
          >
            +${totalInflow.toFixed(2)}
          </Text>
        </View>
        <View style={styles.flowItem}>
          <Text variant="labelMedium">Expenses</Text>
          <Text 
            variant="titleMedium" 
            style={{ color: theme.colors.error }}
          >
            -${totalOutflow.toFixed(2)}
          </Text>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  surface: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 4,
  },
  balance: {
    textAlign: 'center',
    marginBottom: 16,
  },
  flowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  flowItem: {
    alignItems: 'center',
  },
});