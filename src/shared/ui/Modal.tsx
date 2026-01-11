import React from 'react';
import {Modal as RnModal, Pressable, StyleSheet, Text, View} from 'react-native';

interface IModalProps {
    content?: string;
    isShow: boolean;
    onPress: () => void;
}

const Modal = ({content, isShow, onPress}: IModalProps) => {
   return (
    <View>
        <RnModal animationType="fade" visible={isShow} transparent={true}>
            <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <View>
                    <Text style={styles.modalTextStyle}>
                        {content}
                    </Text>
                </View>
                <Pressable
                    style={styles.modalCloseButton}
                    onPress={onPress}>
                    <Text>닫기</Text>
                </Pressable>
            </View>
            </View>
        </RnModal>
    </View>
    );
};

export default Modal;

const styles = StyleSheet.create({
  modalView: {
    marginTop: 230,
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTextStyle: {
    color: '#17191c',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 35,
  },
  centeredView: {
    flex: 1,
    alignContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalCloseButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
    borderTopColor: '#bebebeff',
    borderTopWidth: 0.3,
  },
});
