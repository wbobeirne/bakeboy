import * as React from 'react'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native'
import { PALETTE } from '../constants'

export interface ButtonProps {
    text: string
    color?: 'primary' | 'secondary' | 'danger' | 'transparent'
    isLoading?: boolean
    disabled?: boolean
    onPress: () => void
}

export const Button: React.FC<ButtonProps> = ({
    text,
    isLoading,
    disabled,
    color = 'primary',
    onPress,
}) => {
    const colorMap = {
        primary: PALETTE.teal,
        secondary: PALETTE.beige,
        danger: PALETTE.red,
        transparent: '#00000000',
    }
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, { backgroundColor: colorMap[color] }]}
            onPress={onPress}
            disabled={isLoading || disabled}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
                <Text style={styles.text}>{text}</Text>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 60,
        borderRadius: 51,
        padding: 15,
        paddingLeft: 30,
        paddingRight: 30,
        letterSpacing: 0.4,
    },
    text: {
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 18,
        fontWeight: '600',
        color: '#FFF',
    },
})
