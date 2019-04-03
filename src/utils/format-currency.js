import fCurrency from 'currency.js'

export default function(value, currency, options) {
    if (options && options.parse === false) {
        return currency + value
    }
    switch (currency) {
        case '￥':
        case 'jpy':
            return fCurrency(value, { precision: 0, symbol: '￥' }).format(true)
        case '€':
        case 'eur':
            return fCurrency(value, {
                pattern: `# !`,
                symbol: '€',
                decimal: ',',
                separator: '.',
            }).format(true)
    }
    return fCurrency(value).format(true)
}
