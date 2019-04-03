import Vue from 'vue'
import App from './app'
import router from './router'
import store from './store'

import { mapState } from 'vuex'
import { hasToken, ACCESS_TOKEN_KEY } from './auth'
import Spinner from './components/spinner'

import VS2 from 'vue-script2'
Vue.use(VS2)

import numbro from 'numbro'

import i18n from './utils/vue-i18n'
import ja from './ja'
import { jaNumbro } from './ja'
numbro.registerLanguage(jaNumbro)

Vue.use(i18n, {
    translations: {
        ja,
    },
})

import formatDate from './utils/format-date'
import formatDateRelative from './utils/format-date-relative'
import formatCurrency from './utils/format-currency'

import Vuetify from 'vuetify'
// import en from 'vuetify/es5/locale/en'
import jaVuetify from './vuetify.ja'

import './stylus/main.styl'
Vue.use(Vuetify, {
    theme: {
        primary: '#303F9F',
        secondary: '#3F51B5',
        accent: '#4EBCD4',
        error: '#F55E53',
        info: '#BDBDBD',
        success: '#009688',
    },
    options: {
        customProperties: true,
    },
    lang: {
        locales: { ja: jaVuetify },
    },
})

// https://ency.now.sh/vuency/installation
import Vuency from 'vuency'
Vue.use(Vuency)

import 'typeface-roboto'
import 'typeface-roboto-mono'

Vue.component('spinner', Spinner)

Vue.filter('format', formatDate)

Vue.filter('numbro', (value, format, currency) => {
    if (currency) {
        return numbro(value).formatCurrency()
    }
    format = format
        ? format
        : {
              mantissa: 0,
              thousandSeparated: true,
          }
    return numbro(value).format(format)
})

Vue.filter('currency', formatCurrency)

import Layout from '@/layouts/Main'
import KDialog from '@/components/dialog'
Vue.component('Layout', Layout)
Vue.component('KDialog', KDialog)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

Vue.prototype.$bus = new Vue()

const app = new Vue({
    el: '#app',
    router,
    store,
    data() {
        return {
            enDateLocale: {},
            lang: 'ja',
            dark: false,
        }
    },

    computed: {
        ...mapState({
            user: state => state.account.user,
            isLoggedIn: state => state.account.user.id,
        }),
        // isLoggedIn() {
        //     return this.$store.state.user.id
        // },
        dev() {
            return process.env.NODE_ENV !== 'production'
        },
    },

    created() {
        if (hasToken()) {
            this.$store.dispatch('getProjects')
        }
        this.addTokenHook()
        router.onReady(r => {
            if (r && r.path.includes('/en/')) {
                this.setLanguage('en')
            } else if (this.user && this.user.language) {
                this.setLanguage(this.user.language)
            }
        })
    },

    mounted() {
        this.setLanguage(localStorage.getItem('app.language') || 'ja')
        localStorage.setItem('app.language', this.lang)
        this.dark = localStorage.getItem('app.theme') === 'dark'
        Vue.filter('relative', value => {
            return formatDateRelative(value, this.lang)
        })
    },

    methods: {
        _handleError(error) {
            if (error.response) {
                if (error.response.status == 401) {
                    this._clearSession()
                }
            } else if (error.request) {
                // console.log(error.request)
            } else if (error.status == 401) {
                this._clearSession()
            } else {
                // console.log('Error', error)
            }
        },

        localeLink: function(link) {
            return (this.lang == 'en' ? '/en' : '') + link
        },

        redirect(path) {
            router.push(this.localeLink(path))
        },

        setLanguage(lang) {
            if (lang == undefined) return
            this.user.language = lang
            this.$store.commit('SET_CURRENT_USER', this.user)
            this.$setLanguage(lang)
            this.lang = lang
            this.$vuetify.lang.current = lang
            numbro.setLanguage(lang == 'ja' ? 'ja-JP' : 'en-US')
            localStorage.setItem('app.language', lang)
        },

        changeLanguage(lang) {
            if (lang == this.lang) return
            this.setLanguage(lang)
            if (this.isLoggedIn) this.$store.dispatch('updateUser', this.user)
            // router.push(
            //     lang == 'en'
            //         ? '/en' + router.currentRoute.path
            //         : router.currentRoute.path.replace(/^\/en/, '')
            // )
        },

        changeTheme(theme) {
            localStorage.setItem('app.theme', theme)
            this.dark = theme === 'dark'
        },

        addTokenHook() {
            window.addEventListener(
                'storage',
                e => {
                    if (e.key !== ACCESS_TOKEN_KEY) return
                    if (e.newValue === null) {
                        this._clearSession()
                    } else {
                        this.$store
                            .dispatch('getUser')
                            .then(() => {
                                router.push('/')
                            })
                            .catch(this._handleError)
                    }
                },
                false
            )
        },

        _clearSession() {
            this.$store.dispatch('clearSession')
            router.push('/signin')
        },
    },
    render: h => h(App),
})

// If running inside Cypress
if (window.Cypress) {
    // Attach the app to the window, which can be useful
    // for manually setting state in Cypress commands
    // such as `cy.logIn()`
    window.__app__ = app
}
