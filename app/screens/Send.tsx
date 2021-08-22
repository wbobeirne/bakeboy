import { unwrapResult } from '@reduxjs/toolkit'
import React, { useState, useCallback, useEffect } from 'react'
import { View, StyleSheet, TextInput, Text } from 'react-native'
import Toast from 'react-native-root-toast'
import { Button } from '../components/Button'
import { QRScan } from '../components/QRScan'
import { useAppDispatch, useAppSelector } from '../store'
import { selectActiveBakeBoy, sendPayment } from '../store/bakeboy-slice'
import { LndHttpClient } from '../utils/lndhttp'
import { DecodePaymentRequestResponse } from '../utils/lndtypes'

export const Send: React.FC<any> = ({ navigation }) => {
    const dispatch = useAppDispatch()
    const activeBakeBoy = useAppSelector(selectActiveBakeBoy)
    const [invoiceValue, setInvoiceValue] = useState('')
    const [invoice, setInvoice] = useState<string>()
    const [decodedInvoice, setDecodedInvoice] =
        useState<DecodePaymentRequestResponse>()
    const [isSending, setIsSending] = useState(false)
    const [isDecoding, setIsDecoding] = useState(false)

    const handleSendPayment = useCallback(
        async (invoice: string) => {
            setIsSending(true)
            try {
                const res = await dispatch(sendPayment(invoice))
                unwrapResult(res)
                navigation.navigate('Home')
                Toast.show('Payment complete!', {
                    duration: Toast.durations.SHORT,
                })
                setInvoice(undefined)
            } catch (err) {
                Toast.show(err.message, { duration: Toast.durations.SHORT })
            }
            setIsSending(false)
        },
        [navigation],
    )

    const handleScan = useCallback(
        (data: string) => {
            setInvoice(data)
        },
        [handleSendPayment],
    )

    const handlePressSave = useCallback(() => {
        setInvoice(invoiceValue)
    }, [handleSendPayment, invoiceValue])

    const handlePressSend = useCallback(() => {
        if (invoice) {
            handleSendPayment(invoice)
        }
    }, [handleSendPayment, invoice])

    useEffect(() => {
        if (!invoice || !activeBakeBoy) {
            setDecodedInvoice(undefined)
            return
        }
        const client = new LndHttpClient(
            activeBakeBoy.resturl,
            activeBakeBoy.macaroon,
        )
        client
            .decodePaymentRequest(invoice)
            .then((res) => {
                setDecodedInvoice(res)
            })
            .catch((err) => {
                Toast.show(err.message, { duration: Toast.durations.SHORT })
            })
    }, [invoice, activeBakeBoy])

    let content
    if (decodedInvoice) {
        content = (
            <>
                <View>
                    <Text>Amount: {decodedInvoice.num_satoshis} sats</Text>
                    <Text>Expires: {decodedInvoice.expiry || 'N/A'}</Text>
                </View>
                <Button
                    text="Send"
                    onPress={handlePressSend}
                    isLoading={isSending}
                />
            </>
        )
    } else {
        content = (
            <>
                <QRScan onScan={handleScan} isLoading={isDecoding} />
                <TextInput
                    style={styles.input}
                    placeholder="Paste invoice here"
                    value={invoiceValue}
                    onChangeText={setInvoiceValue}
                />
                <Button
                    text="Save"
                    onPress={handlePressSave}
                    isLoading={isDecoding}
                />
            </>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.inner}>{content}</View>
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
