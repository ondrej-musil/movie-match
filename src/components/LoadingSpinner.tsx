import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export default function LoadingSpinner({ size = 24, color = '#ef4444' }: LoadingSpinnerProps) {
  return (
    <View className="items-center justify-center">
      <Ionicons name="hourglass-outline" size={size} color={color} />
    </View>
  );
}