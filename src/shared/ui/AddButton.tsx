import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.button}>
        <Icon name="add" size={32} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    top: -15, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3ea8feff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
});

export { AddButton };
