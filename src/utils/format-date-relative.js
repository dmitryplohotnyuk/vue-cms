import parseDate from 'date-fns/parse'
import distanceInWords from 'date-fns/distance_in_words'
import isToday from 'date-fns/is_today'
var jaLocale = require('date-fns/locale/ja')

export default function formatDateRelative(toDate, locale) {
    toDate = parseDate(toDate)
    let fromDate = new Date()
    let options = { addSuffix: isToday(fromDate) }
    if (locale == 'ja') {
        options.locale = jaLocale
    }
    return distanceInWords(fromDate, toDate, options)
}
