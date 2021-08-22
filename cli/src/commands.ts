import qrcode from 'qrcode-terminal'
import { BakeBoy } from './types'
import {
    execLnd,
    loadBakeBoyData,
    saveBakeBoyData,
    createBakeBoyUri,
} from './util'

export function list() {
    const { bakeBoys } = loadBakeBoyData()
    const fields = [
        {
            label: 'Label',
            len: 30,
            transform: (bb: BakeBoy) =>
                bb.label.length < 30
                    ? bb.label
                    : `${bb.label.substr(0, 26)}...`,
        },
        {
            label: 'Date created',
            len: 15,
            transform: (bb: BakeBoy) =>
                new Date(bb.dateCreated).toLocaleDateString(),
        },
        {
            label: 'Date expiring',
            len: 15,
            transform: (bb: BakeBoy) =>
                bb.dateTimeout
                    ? new Date(bb.dateTimeout).toLocaleDateString()
                    : 'N/A',
        },
    ]
    let titles = ''
    let totalLen = 0
    for (const field of fields) {
        titles += `${field.label.padEnd(field.len, ' ')}`
        totalLen += field.len
    }
    console.info(titles)
    console.info('='.repeat(totalLen))
    if (!bakeBoys.length) {
        console.info(
            `You haven't baked any boyos yet, get you some 'bakeboy bake'`,
        )
    }
    for (const bb of bakeBoys) {
        let row = ''
        for (const field of fields) {
            let value = field.transform(bb)
            row += `${value.padEnd(field.len, ' ')}`
        }
        console.info(row)
    }
}

interface BakeArgs {
    lnclicmd: string
    label?: string
    timeout?: number
    canSend?: boolean
    canReceive?: boolean
}

export async function bake({ label, timeout, canSend, canReceive }: BakeArgs) {
    const perms = [
        'uri:/lnrpc.Lightning/GetInfo',
        'uri:/lnrpc.Lightning/DecodePayReq',
        canSend ? 'offchain:write' : '',
        canReceive ? 'invoices:write' : '',
    ]
        .join(' ')
        .trim()

    let macaroon = ''
    try {
        macaroon = await execLnd(`bakemacaroon ${perms}`)
    } catch (err) {
        console.error(err)
        console.error('Communication with LND failed, full error above')
        process.exit(1)
    }

    const bakeBoy: BakeBoy = {
        label: label || 'Boyoooo',
        dateCreated: Date.now(),
        dateTimeout: timeout ? Date.now() + timeout : undefined,
        macaroon,
    }
    try {
        const data = loadBakeBoyData()
        data.bakeBoys = [...data.bakeBoys, bakeBoy]
        saveBakeBoyData(data)
    } catch (err) {
        console.error(err)
        console.error(
            `Failed to save bake boy, but macaroon was created: ${macaroon}`,
        )
        process.exit(1)
    }
    const uri = await createBakeBoyUri(macaroon)
    console.info(`oh shit whatup it's dat boi`)
    qrcode.generate(uri, { small: true })
    console.info(uri)
}

export function revoke() {}
