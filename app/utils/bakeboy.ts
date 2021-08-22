import * as qs from 'query-string'
import * as Linking from 'expo-linking'

export function parseBakeBoyUri(uri: string) {
    let params: qs.ParsedQuery
    try {
        const parsed = Linking.parse(uri)
        params = parsed.queryParams
    } catch (err) {
        console.error('Invalid bakeboy URI', err)
        throw new Error('Invalid BakeBoy URI')
    }
    if (!params.resturl || typeof params.resturl !== 'string') {
        throw new Error(`BakeBoy URI missing required param 'resturl'`)
    }
    if (!params.macaroon || typeof params.macaroon !== 'string') {
        throw new Error(`BakeBoy URI missing required param 'macaroon'`)
    }
    return {
        resturl: params.resturl,
        macaroon: params.macaroon,
    }
}

export function generateId() {
    // lol should probs do something better
    return Date.now().toString()
}
