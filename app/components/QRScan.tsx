import React, { useCallback, useState, useEffect } from 'react'
import {
    TouchableOpacity,
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
} from 'react-native'
import {
    BarCodeScanner,
    getPermissionsAsync,
    requestPermissionsAsync,
} from 'expo-barcode-scanner'
import { useRef } from 'react'

interface QRScanProps {
    isLoading?: boolean
    onScan: (data: string) => void
}

export const QRScan: React.FC<QRScanProps> = ({ isLoading, onScan }) => {
    const [hasPermission, setHasPermission] = useState<boolean>()
    const [isDelayCameraRender, setIsDelayCameraRender] = useState(true)
    const prevScanData = useRef<string>()

    useEffect(() => {
        getPermissionsAsync().then(({ status }) => {
            console.log({ status })
            setHasPermission(status === 'granted')
        })
    }, [])

    useEffect(() => {
        if (!hasPermission || !isDelayCameraRender) {
            return
        }
        const timeout = setTimeout(() => {
            console.log('isDelayCameraRender false')
            setIsDelayCameraRender(false)
        }, 300)
        return () => clearTimeout(timeout)
    }, [hasPermission, isDelayCameraRender])

    const handleRequestPermission = useCallback(() => {
        requestPermissionsAsync().then(({ status }) => {
            setHasPermission(status === 'granted')
        })
    }, [])

    const handleScan = useCallback(
        ({ data }) => {
            if (data === prevScanData.current) {
                return
            }
            onScan(data)
            prevScanData.current = data
        },
        [onScan],
    )

    let content
    if (isLoading || isDelayCameraRender) {
        content = <ActivityIndicator />
    } else if (hasPermission === undefined) {
        content = undefined
    } else if (hasPermission) {
        content = (
            <BarCodeScanner
                style={StyleSheet.absoluteFillObject}
                onBarCodeScanned={handleScan}
                barCodeTypes={['qr']}
            />
        )
    } else {
        content = (
            <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                onPress={handleRequestPermission}
            >
                <Text>Scan</Text>
            </TouchableOpacity>
        )
    }

    return <View style={styles.container}>{content}</View>
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,
        height: 300,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 10,
        overflow: 'hidden',
    },
})
