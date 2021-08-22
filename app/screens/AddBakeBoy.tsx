import { unwrapResult } from '@reduxjs/toolkit'
import React, { useCallback, useEffect, useState } from 'react'
import { TextInput, StyleSheet, View } from 'react-native'
import Toast from 'react-native-root-toast'
import { addClipboardListener } from 'expo-clipboard'
import { Button } from '../components/Button'
import { QRScan } from '../components/QRScan'
import { useAppDispatch } from '../store'
import { addBakeBoyFromUri } from '../store/bakeboy-slice'

export const AddBakeBoy: React.FC<any> = ({ navigation }) => {
    const dispatch = useAppDispatch()
    const [uri, setUri] = useState(
        'bakeboy://addBakeBoy?resturl=https%3A%2F%2Flndnode.wbobeirne.com&macaroon=0201036c6e64024a030a10975ac525a7caaa3a689915fd581e750b1201301a0c0a04696e666f1204726561641a110a08696e766f69636573120577726974651a110a086f6666636861696e1205777269746500000620f24bf576151e6142283dbc786b4ad9d72f3e116aa650e4bc39ede9d8a457de96',
    )
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const sub = addClipboardListener((ev) => {
            setUri(ev.content)
        })
        return () => sub.remove()
    }, [])

    const addBakeBoy = useCallback(
        async (uri: string) => {
            setIsSaving(true)
            try {
                const res = await dispatch(addBakeBoyFromUri(uri))
                unwrapResult(res)
                navigation.navigate('Home')
            } catch (err) {
                Toast.show(err.message, { duration: Toast.durations.SHORT })
            }
            setIsSaving(false)
        },
        [navigation],
    )

    const handleScan = useCallback(
        (data: string) => {
            addBakeBoy(data)
        },
        [addBakeBoy],
    )

    const handlePressSave = useCallback(() => {
        addBakeBoy(uri)
    }, [addBakeBoy, uri])

    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <QRScan onScan={handleScan} isLoading={isSaving} />
                <TextInput
                    style={styles.input}
                    placeholder="Paste bakeboy:// here"
                    value={uri}
                    onChangeText={setUri}
                />
                <Button
                    text="Save"
                    onPress={handlePressSave}
                    isLoading={isSaving}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inner: {
        width: '100%',
        maxWidth: 340,
        padding: 20,
    },
    input: {
        width: '100%',
        maxWidth: 300,
        padding: 8,
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 4,
    },
})
