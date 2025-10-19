import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

type TransactionCardProps = {
  type: 'inflow' | 'outflow';
  amount: number;
  category: string;
  description: string;
  date: string;
};

export const TransactionCard = ({ 
  type, 
  amount, 
  category, 
  description, 
  date 
}: TransactionCardProps) => {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text 
          variant="titleMedium" 
          style={{ 
            color: type === 'inflow' ? theme.colors.primary : theme.colors.error 
          }}
        >
          {type === 'inflow' ? '+' : '-'} ${amount}
        </Text>
        <Text variant="bodyMedium">{category}</Text>
        <Text variant="bodySmall">{description}</Text>
        <Text variant="bodySmall" style={styles.date}>{date}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  date: {
    marginTop: 4,
    opacity: 0.7,
  },
});