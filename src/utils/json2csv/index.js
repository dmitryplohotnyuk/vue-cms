'use strict'

import JSON2CSVParser from './parser'

export default function json2csv(data, opts) {
    return new JSON2CSVParser(opts).parse(data)
}
