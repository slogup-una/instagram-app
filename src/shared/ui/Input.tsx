import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';

interface InputProps extends TextInputProps {}

const Input = ({ ...props }: InputProps) => {
  const { theme } = useTheme();

  return (
    <TextInput
      {...props}
      style={{
        ...styles.input,
        color: theme.textPrimary,
        paddingRight: 45,
        borderColor: theme.placeholder,
      }}
      placeholderTextColor={theme.placeholder}
    />
  );
};

const Password = ({ ...props }: InputProps) => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        {...props}
        secureTextEntry={!showPassword}
        style={{
          ...styles.input,
          color: theme.textPrimary,
          paddingRight: 45,
          borderColor: theme.placeholder,
        }}
        placeholderTextColor={theme.placeholder}
      />
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 16,
          top: 14,
          zIndex: 1,
        }}
        onPress={() => setShowPassword(!showPassword)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons
          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
          color={theme.placeholder}
          size={24}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    borderRadius: 14,
    fontSize: 16,
  },
});

Input.Password = Password;

export { Input, type InputProps };
