/*eslint-disable*/

export const jaDateLocale = {
    startYear: 1900,
    endYear: 2099,
    dateFormat: 'YYYY-MM-DD',
    days: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    shortDays: ['日', '月', '火', '水', '木', '金', '土'],
    shorterDays: ['日', '月', '火', '水', '木', '金', '土'],
    months: [
        '一月',
        '二月',
        '三月',
        '四月',
        '五月',
        '六月',
        '七月',
        '八月',
        '九月',
        '十月',
        '十一月',
        '十二月',
    ],
    shortMonths: [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
    ],
    shorterMonths: [
        '一',
        '二',
        '三',
        '四',
        '五',
        '六',
        '七',
        '八',
        '九',
        '十',
        '十一',
        '十二',
    ],
}

export const jaNumbro = {
    languageTag: 'ja-JP',
    delimiters: {
        thousands: ',',
        decimal: '.',
    },
    abbreviations: {
        thousand: '千',
        million: '百万',
        billion: '0億',
        trillion: '兆',
    },
    ordinal: function() {
        return '.'
    },
    currency: {
        symbol: '¥',
        position: 'prefix',
        code: 'JPY',
    },
    currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true,
        average: true,
    },
    formats: {
        fourDigits: {
            totalLength: 4,
            spaceSeparated: true,
            average: true,
        },
        fullWithTwoDecimals: {
            thousandSeparated: true,
            mantissa: 2,
        },
        fullWithTwoDecimalsNoCurrency: {
            mantissa: 2,
            thousandSeparated: true,
        },
        fullWithNoDecimals: {
            output: 'currency',
            thousandSeparated: true,
            mantissa: 0,
        },
    },
}

import ja from './ja.json'

export default ja
