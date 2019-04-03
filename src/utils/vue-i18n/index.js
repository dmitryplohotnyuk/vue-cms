import { replace } from './format'
import { set as setTranslations, fetchTranslation } from './translations'

const data = {
    lang: undefined,
}

const translate = function(key, replacements = {}) {
    if (!key) return ''
    let choice = null

    if (typeof replacements === 'number') {
        choice = replacements
    } else if (replacements && replacements.count !== undefined) {
        choice = replacements.count
    }

    let translation = fetchTranslation(data.lang, key, choice)

    return replace(translation, replacements)
}

export default {
    install(Vue, options = {}) {
        setTranslations(options.translations)

        Vue.prototype.$t = translate
        Vue.prototype.$setLanguage = function(lang) {
            data.lang = lang
        }

        Vue.filter('translate', translate)

        Vue.directive('translate', function(el, binding, vnode) {
            var translated_substrings = vnode.context
                .$t(binding.value.key, binding.value.replace)
                .split('|')

            var children = el.children

            for (var i = 0; i < children.length; i++) {
                if (translated_substrings[i]) {
                    children[i].innerText = translated_substrings[i]
                }
            }
        })

        Vue.mixin({
            data() {
                return data
            },

            beforeCreate() {
                if (this.$options.language !== undefined) {
                    data.lang = this.$options.language
                }
            },
        })
    },
}
