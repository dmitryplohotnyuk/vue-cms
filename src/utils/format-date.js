import parseDate from 'date-fns/parse'
import format from 'date-fns/format'

export default function formatDate(date, template) {
    date = parseDate(date)
    return format(date, template ? template : 'MMM Do, YYYY')
}
