import {
    createAction,
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
import { AppState } from '.'
import { BakeBoy } from '../types'
import { generateId, parseBakeBoyUri } from '../utils/bakeboy'
import { LndHttpClient } from '../utils/lndhttp'
import { CreateInvoiceResponse, SendPaymentResponse } from '../utils/lndtypes'

export interface BakeBoyState {
    activeBakeBoyId: string | null
    bakeBoys: BakeBoy[]
}

const initialState: BakeBoyState = {
    activeBakeBoyId: null,
    bakeBoys: [],
}

export const addBakeBoyFromUri = createAsyncThunk<
    BakeBoy,
    string,
    { state: AppState }
>('bakeboy/addBakeBoyFromUri', async (uri, { getState }) => {
    const { resturl, macaroon } = parseBakeBoyUri(uri)
    const { bakeBoys } = getState().bakeBoy
    if (
        bakeBoys.find(
            (bb) => bb.macaroon === macaroon && bb.resturl === resturl,
        )
    ) {
        throw new Error('You already have dat boi!')
    }
    const client = new LndHttpClient(resturl, macaroon)
    const info = await client.getInfo()
    return {
        id: generateId(),
        alias: info.alias,
        color: info.color,
        resturl,
        macaroon,
    }
})

export const sendPayment = createAsyncThunk<
    SendPaymentResponse,
    string,
    { state: AppState }
>('bakeboy/sendPayment', async (paymentRequest, { getState }) => {
    const activeBakeBoy = selectActiveBakeBoy(getState())
    if (!activeBakeBoy) {
        throw new Error('You have no active bakeboy! Wtf.')
    }
    const client = new LndHttpClient(
        activeBakeBoy.resturl,
        activeBakeBoy.macaroon,
    )
    const res = await client.sendPayment({ payment_request: paymentRequest })
    return res
})

export const generateInvoice = createAsyncThunk<
    CreateInvoiceResponse,
    string | number,
    { state: AppState }
>('bakeboy/generateInvoice', async (amount, { getState }) => {
    const activeBakeBoy = selectActiveBakeBoy(getState())
    if (!activeBakeBoy) {
        throw new Error('You have no active bakeboy! Wtf.')
    }
    const client = new LndHttpClient(
        activeBakeBoy.resturl,
        activeBakeBoy.macaroon,
    )
    const res = await client.createInvoice({
        value: amount.toString(),
        memo: 'BakeBoooooy',
        expiry: 3600,
    })
    return res
})

export const bakeBoySlice = createSlice({
    name: 'bakeboy',
    initialState,
    reducers: {
        setActiveBakeBoyId(s, action: PayloadAction<string>) {
            s.activeBakeBoyId = action.payload
        },
        addBakeBoy(s, action: PayloadAction<BakeBoy>) {
            s.bakeBoys = [...s.bakeBoys, action.payload]
        },
        removeBakeBoy(s, action: PayloadAction<string>) {
            s.bakeBoys = s.bakeBoys.filter((bb) => bb.id !== action.payload)
            if (s.activeBakeBoyId === action.payload) {
                s.activeBakeBoyId = s.bakeBoys[0]?.id || null
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addBakeBoyFromUri.fulfilled, (s, action) => {
            s.bakeBoys = [...s.bakeBoys, action.payload]
            s.activeBakeBoyId = action.payload.id
        })
    },
})

export const selectActiveBakeBoy = (s: AppState) => {
    return s.bakeBoy.bakeBoys.find((bb) => bb.id === s.bakeBoy.activeBakeBoyId)
}

export const { setActiveBakeBoyId, addBakeBoy, removeBakeBoy } =
    bakeBoySlice.actions

export const bakeBoyReducer = bakeBoySlice.reducer
