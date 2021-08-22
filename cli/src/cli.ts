#!/usr/bin/env node

import { Command } from 'commander'
import { list, bake, revoke } from './commands'
import { CONF_PATH, loadBakeBoyConf } from './util'

const program = new Command()
const packageJson = require('../package.json')

program.version(packageJson.version)

program
    .command('list')
    .description('List all known BakeBoy macaroons out in the wild')
    .action(() => {
        list()
    })

program
    .command('bake <label>')
    .description(
        `Bake a hot'n'fresh BakeBoy macaroon and link for a very special someone`,
    )
    .option(
        '--lnclicmd <cmd>',
        'Full lnd command for invoking the cli, can accept flags as well',
    )
    .option(
        '--resturl <url>',
        'Publicly accessible REST API URL for BakeBoy to hit with these bakeroos',
    )
    .option('--timeout', `Time in seconds until this BakeBoyt is RIP`)
    .option(
        '--no-payment',
        `Disables this boy from sending any of your node's cold hard cash`,
    )
    .option(
        '--no-invoices',
        `Disables this boy from getting you that dolla dolla`,
    )
    .action((label: string) => {
        const opts = program.opts()
        const conf = loadBakeBoyConf({
            lnclicmd: opts.lnclicmd,
            resturl: opts.resturl,
        })
        if (!conf.resturl) {
            console.error(
                `Missing required 'resturl' config, either set it via --resturl flag or in ${CONF_PATH}`,
            )
            process.exit(1)
        }
        bake({
            label,
            timeout: opts.timeout,
            lnclicmd: opts.lnclicmd,
            canSend: opts.noPayment ? false : true,
            canReceive: opts.noInvoices ? false : true,
        })
    })

program
    .command('revoke')
    .description('Cut one of your toxic BakeBoys out of your life')
    .option(
        '--lnclicmd <cmd>',
        'Full lnd command for invoking the cli, can accept flags as well',
    )
    .action(() => {})

async function run() {
    await program.parseAsync(process.argv)
}

run()
