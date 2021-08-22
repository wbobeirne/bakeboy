export interface BakeBoy {
    label: string
    macaroon: string
    dateCreated: number
    dateTimeout?: number
}

export interface BakeBoyData {
    bakeBoys: BakeBoy[]
}

export interface BakeBoyConf {
    lnclicmd: string
    resturl: string
}
