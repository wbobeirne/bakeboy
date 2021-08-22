import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { RootSiblingParent } from 'react-native-root-siblings'
import React from 'react'
import { StyleSheet } from 'react-native'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor, useAppSelector } from './store'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PALETTE } from './constants'
import { selectActiveBakeBoy } from './store/bakeboy-slice'
import { Home } from './screens/Home'
import { Send } from './screens/Send'
import { Receive } from './screens/Receive'
import { AddBakeBoy } from './screens/AddBakeBoy'

const Stack = createNativeStackNavigator()

const Screens: React.FC = () => {
    const activeBakeBoy = useAppSelector(selectActiveBakeBoy)
    return (
        <Stack.Navigator
            initialRouteName={activeBakeBoy ? 'Home' : 'AddBakeBoy'}
        >
            <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerBackVisible: false }}
            />
            <Stack.Screen name="Send" component={Send} />
            <Stack.Screen name="Receive" component={Receive} />
            <Stack.Screen
                name="AddBakeBoy"
                options={{
                    title: 'Add a BakeBoy',
                    headerBackVisible: !!activeBakeBoy,
                }}
                component={AddBakeBoy}
            />
        </Stack.Navigator>
    )
}

export default function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <RootSiblingParent>
                    <PersistGate persistor={persistor}>
                        <SafeAreaProvider>
                            <StatusBar style="dark" />
                            <Screens />
                        </SafeAreaProvider>
                    </PersistGate>
                </RootSiblingParent>
            </NavigationContainer>
        </Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: PALETTE.offwhite,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
