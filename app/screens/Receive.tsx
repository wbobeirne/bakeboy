import React, { useState } from 'react'
import QRCode from 'react-native-qrcode-svg'
import * as Clipboard from 'expo-clipboard'
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
} from 'react-native'
import { Button } from '../components/Button'
import { useCallback } from 'react'
import { useAppDispatch } from '../store'
import { generateInvoice } from '../store/bakeboy-slice'
import Toast from 'react-native-root-toast'
import { unwrapResult } from '@reduxjs/toolkit'

export const Receive: React.FC = () => {
    const dispatch = useAppDispatch()
    const [invoice, setInvoice] = useState('')
    const [amount, setAmount] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    const handlePressCopy = useCallback(() => {
        Clipboard.setString(invoice)
        Toast.show('Copied!', { duration: Toast.durations.SHORT })
    }, [invoice])

    const handlePressGenerate = useCallback(async () => {
        setIsGenerating(true)
        try {
            const res = await dispatch(generateInvoice(amount))
            const { payment_request } = unwrapResult(res)
            setInvoice(payment_request)
        } catch (err) {
            Toast.show(err.message, { duration: Toast.durations.SHORT })
        }
        setIsGenerating(false)
    }, [amount])

    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <View style={styles.qrContainer}>
                    {invoice ? (
                        <QRCode size={260} value={invoice.toUpperCase()} />
                    ) : (
                        <Text>Enter an amount</Text>
                    )}
                </View>
                {invoice ? (
                    <View style={styles.invoiceContainer}>
                        <Text style={styles.invoiceText}>{invoice}</Text>
                        <TouchableOpacity
                            onPress={handlePressCopy}
                            style={styles.invoiceCopy}
                        >
                            <Text numberOfLines={1} ellipsizeMode="tail">
                                📋
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : undefined}
                <TextInput
                    style={styles.input}
                    placeholder="Enter an amount"
                    value={amount}
                    onChangeText={setAmount}
                />
                <Button
                    text="Create invoice"
                    onPress={handlePressGenerate}
                    isLoading={isGenerating}
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
    qrContainer: {
        width: 300,
        height: 300,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        backgroundColor: '#FFF',
        borderRadius: 10,
    },
    invoiceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        backgroundColor: '#FFF',
        borderRadius: 4,
        marginBottom: 10,
    },
    invoiceText: {
        flex: 1,
        textAlign: 'left',
    },
    invoiceCopy: {
        padding: 5,
    },
    input: {
        width: '100%',
        maxWidth: 300,
        padding: 8,
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 4,
    },
})
