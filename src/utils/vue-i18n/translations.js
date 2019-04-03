/* eslint-disable */

const locale_translations = {
    /*
  'es': {
    'hello': 'hola'
  }
  */
}

export var set = function(translations) {
    // we could just assign locale_translations = translations, but
    // I would like to keep locale_translations as a const,
    // therefore set each set of translations manually
    Object.keys(translations).forEach(function(locale) {
        locale_translations[locale] = translations[locale]
    })
}

function getOldChoiceIndexFixed(choice) {
    return choice ? 1 : 0
}

function getChoiceIndex(choice, choicesLength) {
    choice = Math.abs(choice)

    if (choicesLength === 2) {
        return getOldChoiceIndexFixed(choice)
    }

    return choice ? Math.min(choice, 2) : 0
}

export function fetchChoice(message, choice) {
    if (!message && typeof message !== 'string') {
        return null
    }
    let choices = message.split('|')

    choice = getChoiceIndex(choice, choices.length)
    if (!choices[choice]) {
        return message
    }
    return choices[choice].trim()
}

export var fetchTranslation = function(locale, key, choice) {
    if (!locale) return key

    var translations = locale_translations[locale]

    if (translations && key in translations) {
        if (choice !== null) {
            return fetchChoice(translations[key], choice)
        }
        return translations[key]
    }

    // key not found, fall back from dialect translations

    // if (locale.indexOf('_') > -1) {
    //     return fetch(locale.substr(0, locale.indexOf('_')), key)
    // }
    //
    // if (locale.indexOf('-') > -1) {
    //     return fetch(locale.substr(0, locale.indexOf('-')), key)
    // }

    // key does not exist

    if (
        translations &&
        window.console &&
        process &&
        process.env &&
        process.env.NODE_ENV !== 'production'
    ) {
        const poeKey = process.env.VUE_APP_POE_KEY ? process.env.VUE_APP_POE_KEY : ''
        const poeId = process.env.VUE_APP_POE_ID ? process.env.VUE_APP_POE_ID : ''
        if (poeKey && poeId) {
            sendToPoeEditor(locale, key)
        }
        console.info(`[vue-i18n] ${locale} `, key)
    }

    if (choice !== null) {
        return fetchChoice(key, choice)
    }
    return key
}

function sendToPoeEditor(locale, key) {
    var serialize = function(data) {
        return Object.keys(data)
            .map(function(keyName) {
                return encodeURIComponent(keyName) + '=' + encodeURIComponent(data[keyName])
            })
            .join('&')
    }
    let api_token = process.env.VUE_APP_POE_KEY
    let id = process.env.VUE_APP_POE_ID
    let ref = ''
    let data = [
        {
            term: key,
            context: '',
            reference: ref,
        },
    ]
    let url = `https://api.poeditor.com/v2/terms/add`

    fetch(url, {
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        method: 'POST',
        mode: 'no-cors',
        body: serialize({ data: JSON.stringify(data), api_token, id }),
    })
        .then(function(response) {
            if (!response.ok) {
                console.log(response)
            }
        })
        .catch(function(e) {
            console.log(e)
        })
}
