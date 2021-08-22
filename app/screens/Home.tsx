import { Picker } from '@react-native-picker/picker'
import React, { useCallback } from 'react'
import { useEffect } from 'react'
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native'
import { PALETTE } from '../constants'
import { useAppDispatch, useAppSelector } from '../store'
import { removeBakeBoy, setActiveBakeBoyId } from '../store/bakeboy-slice'

export const Home: React.FC<any> = ({ navigation }) => {
    const dispatch = useAppDispatch()
    const { bakeBoys, activeBakeBoyId } = useAppSelector((s) => s.bakeBoy)

    useEffect(() => {
        if (!bakeBoys.length) {
            navigation.navigate('AddBakeBoy')
        }
    }, [bakeBoys])

    const handleChangeActiveBoy = useCallback((id: string) => {
        dispatch(setActiveBakeBoyId(id))
    }, [])

    const handlePressAdd = useCallback(() => {
        navigation.navigate('AddBakeBoy')
    }, [navigation])

    const handlePressDelete = useCallback(() => {
        if (!activeBakeBoyId) {
            return
        }
        Alert.alert('Delete dat boi?', 'Are you sure? No takesies backsies.', [
            {
                text: 'Nah',
                onPress: () => console.info('Canceled delete'),
                style: 'cancel',
            },
            {
                text: 'Yeet',
                onPress: () => dispatch(removeBakeBoy(activeBakeBoyId)),
                style: 'destructive',
            },
        ])
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.controls}>
                <View style={[styles.control, styles.pickerWrap]}>
                    <Picker
                        style={styles.picker}
                        selectedValue={activeBakeBoyId || ''}
                        onValueChange={handleChangeActiveBoy}
                    >
                        {bakeBoys.map((bb) => (
                            <Picker.Item
                                key={bb.id}
                                value={bb.id}
                                label={bb.alias}
                            />
                        ))}
                    </Picker>
                </View>
                <TouchableOpacity
                    style={[styles.control, styles.controlBtn]}
                    onPress={handlePressAdd}
                >
                    <Text>➕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.control, styles.controlBtn]}
                    onPress={handlePressDelete}
                >
                    <Text>🗑</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={[styles.button, styles.send]}
                onPress={() => navigation.push('Send')}
            >
                <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.receive]}
                onPress={() => navigation.push('Receive')}
            >
                <Text style={styles.buttonText}>Receive</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 300,
        marginBottom: 10,
    },
    pickerWrap: {
        flex: 1,
        padding: 5,
    },
    picker: {
        flex: 1,
    },
    controlBtn: {
        padding: 6,
        marginLeft: 5,
    },
    control: {
        backgroundColor: '#FFF',
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        borderRadius: 4,
    },
    button: {
        margin: 10,
        height: 120,
        width: '100%',
        maxWidth: 300,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 20,
    },
    send: {
        backgroundColor: PALETTE.teal,
    },
    receive: {
        backgroundColor: PALETTE.green,
    },
})
