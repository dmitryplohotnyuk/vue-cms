import json2csv from './json2csv'

export default function ExportCSV(data, fields, fileName) {
    try {
        var result = json2csv(data, { fields })
        var csvContent = 'data:text/csvcharset=GBK,\uFEFF' + result
        var encodedUri = encodeURI(csvContent)
        var link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `${fileName || 'file'}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (err) {
        // eslint-disable-next-line
        console.error(err)
    }
}
