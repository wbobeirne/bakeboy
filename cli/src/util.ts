import { exec } from 'child_process'
import { homedir } from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { BakeBoyConf, BakeBoyData } from './types'

export const DATA_PATH = path.resolve(homedir(), '.bakeboy/data.json')
export const CONF_PATH = path.resolve(homedir(), '.bakeboy/conf.json')

const DEFAULT_BAKEBOY_CONF: BakeBoyConf = {
    lnclicmd: 'lncli',
    resturl: '',
}

const DEFAULT_BAKEBOY_DATA: BakeBoyData = {
    bakeBoys: [],
}

let conf: BakeBoyConf

/**
 * Loads the BakeBoy config from file, applies overrides if we have any.
 */
export function loadBakeBoyConf(args: Partial<BakeBoyConf> = {}) {
    let pathExists = false
    try {
        pathExists = fs.existsSync(CONF_PATH)
    } catch (err) {
        pathExists = false
    }
    if (!pathExists) {
        console.info(
            `${CONF_PATH} doesn't exist, setting you up with a fresh one...`,
        )
        fs.mkdirSync(path.dirname(CONF_PATH), { recursive: true })
        fs.writeFileSync(
            CONF_PATH,
            JSON.stringify(DEFAULT_BAKEBOY_CONF, null, 2),
            'utf-8',
        )
        conf = DEFAULT_BAKEBOY_CONF
    } else {
        conf = JSON.parse(fs.readFileSync(CONF_PATH, 'utf-8'))
    }
    for (const entry in Object.entries(args)) {
        if (entry[1] !== undefined) {
            ;(conf as any)[entry[0]] = entry[1]
        }
    }
    return conf
}

/**
 * Gets the conf, loads if it hasn't yet been loaded.
 */
export function getConf() {
    if (!conf) {
        loadBakeBoyConf()
    }
    return conf
}

/**
 * Execute an LND command via the CLI.
 * @param args
 * @returns
 */
export function execLnd(args: string): Promise<string> {
    const conf = getConf()
    return new Promise((resolve, reject) => {
        exec(`${conf.lnclicmd} ${args}`, (err, stdout, stderr) => {
            if (err) {
                return reject(err)
            }
            return resolve(stdout)
        })
    })
}

/**
 * Reads in the bakeboy data.json. If it doesn't exist, create and log to console.
 */
export function loadBakeBoyData() {
    let data: BakeBoyData
    if (!fs.existsSync(DATA_PATH)) {
        console.info(
            `${DATA_PATH} doesn't exist, setting you up with a fresh one...`,
        )
        fs.writeFileSync(
            DATA_PATH,
            JSON.stringify(DEFAULT_BAKEBOY_DATA, null, 2),
            'utf-8',
        )
        data = DEFAULT_BAKEBOY_DATA
    } else {
        data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
    }
    return data
}

export function saveBakeBoyData(data: BakeBoyData) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * Creates a bakeboy:// URI with all the information needed for a bakeboy wallet.
 */
export async function createBakeBoyUri(macaroon: string) {
    const conf = getConf()
    return `bakeboy://addBakeBoy?resturl=${encodeURIComponent(
        conf.resturl,
    )}&macaroon=${macaroon}`
}
