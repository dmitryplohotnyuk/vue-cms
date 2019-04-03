//import api from '@/api'
import timeout from '@/utils/timeout'
import cloneDeep from 'lodash/cloneDeep'

// Fake data
const fakePlans = [
    {
        id: 1544326588300,
        interval: 'month',
        name: 'FREE',
        price: '0',
        description: '全営業日、1日1レッスンまで1ヶ月間通い放題',
        visible: true,
    },
    {
        id: 1544326588331,
        interval: 'month',
        name: '月額プラン',
        price: '100',
        description: '全営業日、1日1レッスンまで1ヶ月間通い放題',
        visible: true,
    },
    {
        id: 1544326588442,
        interval: 'year',
        name: '年間プラン',
        price: '1000',
        description: '全営業日、1日1レッスンまで1ヶ月間通い放題',
        visible: true,
    },
]
const pageBlocks = [
    {
        type: 'content',
        enabled: true,
    },
]
const fakeTheme = {
    colors: {
        brand: '',
        colorBg: '',
        text: '#212529',
        links: '#007bff',
        headerBrand: '#000000e6',
        headerLinks: '#00000080',
        buttonColorBg: '#5288a7',
        buttonColorText: '#fff',
    },
    blocks: {
        header: {
            type: 'header',
            enabled: true,
            settings: {
                isSticky: false,
                brandName: 'Brand name',
                logoImage: 'https://picturepan2.github.io/spectre/img/spectre-logo.svg',
                logoImageWidth: 50,
                menu: [{ name: 'Home', link: '/' }, { name: 'About', link: '/about' }],
            },
        },
        footer: {
            type: 'footer',
            enabled: true,
            settings: {
                colorBg: '',
                colorText: '',
                links: {
                    title: 'Quick links',
                    items: [{ name: 'Home', link: '/' }],
                },
                text: {
                    title: 'Contacts',
                    text:
                        '<p>tel: 0123456789<br/> Facebook: <a href="https://www.facebook.com/">profile</a></p>',
                },
                newsletter: {
                    title: 'Newsletter',
                },
                order: ['links', 'text', 'newsletter'],
            },
        },
    },
}
const fakePages = [
    {
        id: 'home',
        visible: true,
        type: 'home',
        url: '/',
        title: 'Home',
        content: null,
        metatags: {
            title: 'My awesome homepage',
            description: 'This is landingpage',
        },
        blocks: [
            {
                type: 'announcement',
                enabled: false,
                settings: {
                    messageText: 'Announcement here!',
                    messageColorBg: '#5288a7',
                    messageColorText: '#fff',
                },
            },
            {
                type: 'hero',
                enabled: true,
                settings: {
                    backgroundImage:
                        'https://cdn.shopify.com/s/files/1/0082/4796/7849/files/woman-meditating-thailand_2040x.jpg',
                    backgroundImageAlignment: 'center',
                    heading: 'Your hero title',
                    headingSize: 'medium',
                    text:
                        'Use overlay text to give your customers insight into your brand. Select imagery and text that relates to your style and story.',
                    sectionHeight: 'medium',
                    textSize: 'medium',
                    buttonLabel: 'Button',
                    buttonLink: '/',
                },
            },
            {
                type: 'rich',
                enabled: true,
                settings: {
                    html: '<h3>Block title</h3><p>Paragraph #1</p><p>Paragraph #2</p>',
                },
            },
            {
                type: 'plans',
                enabled: true,
                settings: {
                    columns: 2,
                    heading: 'Pricing plans',
                    buttonLabel: '選ぶ',
                    headerAlign: 'left',
                    headerSize: 'medium',
                    textAlign: 'center',
                    textSize: 'medium',
                    individualSettings: [],
                },
            },
            {
                type: 'slideshow',
                enabled: true,
                settings: {
                    items: [
                        {
                            enabled: true,
                            settings: {
                                backgroundImage:
                                    'https://cdn.shopify.com/s/files/1/0082/4796/7849/files/flowers-shot-on-film_1296x.jpg',
                                backgroundImageAlignment: 'center',
                                heading: 'Image slide',
                                text: 'Slide text with explanation',
                                sectionHeight: 'medium',
                                textSize: 'medium',
                                buttonLabel: 'Button',
                                buttonLink: '/',
                            },
                        },
                        {
                            enabled: true,
                            settings: {
                                backgroundImage:
                                    'https://cdn.shopify.com/s/files/1/0082/4796/7849/files/breakfast-from-above_1080x.jpg',
                                backgroundImageAlignment: 'center',
                                heading: 'Image slide #2',
                                text: 'Slide text with explanation #2',
                                sectionHeight: 'medium',
                                textSize: 'medium',
                                buttonLabel: 'Button',
                                buttonLink: '/',
                            },
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 'auth',
        visible: true,
        type: 'auth',
        url: '/auth',
        title: 'Signin/register',
        content: null,
        metatags: {
            title: '',
            description: '',
        },
        blocks: [
            {
                type: 'form',
                enabled: true,
                settings: {
                    language: 'en',
                    maxWidthLimited: true,
                    maxWidth: 480,
                    colorBg: '',
                    title: '',
                    buttonLabel: '',
                    fields: [
                        {
                            name: 'firstname',
                            label: 'First Name',
                            type: 'text',
                            required: true,
                            enabled: true,
                            optional: false,
                        },
                        {
                            name: 'lastname',
                            label: 'Last Name',
                            type: 'text',
                            required: true,
                            enabled: true,
                            optional: false,
                        },
                        {
                            name: 'email',
                            label: 'Email Adress',
                            type: 'email',
                            required: true,
                            enabled: true,
                            optional: false,
                        },
                        {
                            name: 'iagree',
                            label: 'agree to Terms of Use',
                            description: '',
                            link: '/',
                            type: 'iagree',
                            required: true,
                            enabled: true,
                            optional: true,
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 'subscription',
        visible: true,
        type: 'subscription',
        url: '/subscription',
        title: 'Subscription',
        content: null,
        metatags: {
            title: '',
            description: '',
        },
        blocks: [
            {
                type: 'subscription',
                enabled: true,
                settings: {
                    language: 'en',
                },
            },
        ],
    },
    {
        id: 'profile',
        visible: true,
        type: 'profile',
        url: '/profile',
        title: 'Profile page',
        content: null,
        metatags: {
            title: '',
            description: '',
        },
        blocks: cloneDeep(pageBlocks),
    },
    {
        id: 'about',
        editable: true,
        visible: true,
        type: 'page',
        url: '/about',
        title: 'About us',
        content:
            '<div> <h2>About us</h2> <p> Pellentesque massa massa, gravida a mollis at, vulputate ut tortor. Pellentesque gravida cursus neque non ultricies. Nunc non mauris gravida, placerat enim vel, tempor odio. Aenean at vestibulum sem, eget porta nisi. Curabitur id augue justo. Curabitur aliquam maximus leo, vitae maximus felis venenatis lobortis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aenean luctus cursus felis quis aliquet. In enim urna, blandit nec feugiat non, accumsan nec dui. Duis hendrerit facilisis placerat. Morbi aliquet suscipit leo in interdum. Nulla elit metus, placerat sit amet laoreet sed, maximus sit amet velit. Duis sit amet ipsum tortor. Suspendisse interdum molestie magna sed fringilla. </p> <p> Nulla malesuada massa auctor metus fringilla sodales. Phasellus mollis leo ut velit fringilla posuere in in magna. Pellentesque ante arcu, vulputate eu quam sed, fermentum interdum lorem. Nunc a suscipit justo, sit amet viverra enim. Sed in lectus finibus, luctus neque quis, faucibus ex. Aliquam lacinia magna nunc, iaculis hendrerit eros euismod sed. In eu imperdiet orci. </p></div>',
        metatags: {
            title: 'About us meta title',
            description: 'About us meta description',
        },
        blocks: cloneDeep(pageBlocks),
    },
]

const state = {
    plans: fakePlans,
    pages: fakePages,
    page: null,
    theme: fakeTheme,
}

const mutations = {
    RESET(state) {
        state.plans = fakePlans
        state.pages = fakePages
        state.page = null
        state.theme = fakeTheme
    },
    SET_CMS_PLANS(state, data) {
        state.plans = data
    },
    SET_CMS_PAGES(state, data) {
        state.pages = data
    },
    SET_CURRENT_CMS_PAGE(state, data) {
        state.page = data ? data : {}
    },
    SET_CURRENT_CMS_THEME(state, data) {
        state.theme = data ? data : {}
    },
}

const actions = {
    // Theme
    updateCMSTheme({ commit, dispatch }, theme) {
        return timeout(1000, {
            theme,
        })
            .then(response => {
                commit('SET_CURRENT_CMS_THEME', response.theme)
                return response.theme
            })
            .catch(e => dispatch('handleError', e))
    },
    getCMSTheme({ commit, dispatch, state }) {
        return timeout(0, {
            theme: state.theme,
        })
            .then(response => {
                commit('SET_CURRENT_CMS_THEME', response.theme)
                return response.theme
            })
            .catch(e => dispatch('handleError', e))
    },
    // Plans
    createCMSPlan({ commit, dispatch, state }, plan) {
        return timeout(1000, {
            plan: { ...plan, id: Date.now() },
        })
            .then(response => {
                commit('SET_CMS_PLANS', [...state.plans, response.plan])
                return response.plan
            })
            .catch(e => dispatch('handleError', e))
    },
    updateCMSPlan({ commit, dispatch, state }, plan) {
        return timeout(1000, {
            plan,
        })
            .then(response => {
                const index = state.plans.findIndex(p => p.id == plan.id)
                commit('SET_CMS_PLANS', [
                    ...state.plans.slice(0, index),
                    response.plan,
                    ...state.plans.slice(index + 1),
                ])
                return response.contact
            })
            .catch(e => dispatch('handleError', e))
    },
    deleteCMSPlan({ commit, dispatch, state }, id) {
        return timeout(1000)
            .then(() => {
                commit('SET_CMS_PLANS', [...state.plans.filter(plan => plan.id != id)])
                return
            })
            .catch(e => dispatch('handleError', e))
    },
    getCMSPlans({ commit, dispatch }) {
        return timeout(0, {
            plans: fakePlans,
        })
            .then(response => {
                commit('SET_CMS_PLANS', response.plans)
                return response.plans
            })
            .catch(e => dispatch('handleError', e))
    },
    // Pages
    createCMSPage({ commit, dispatch, state }, page) {
        return timeout(1000, {
            page: { ...page, id: Date.now(), blocks: cloneDeep(pageBlocks) },
        })
            .then(response => {
                commit('SET_CMS_PAGES', [...state.pages, response.page])
                return response.page
            })
            .catch(e => dispatch('handleError', e))
    },
    updateCMSPage({ commit, dispatch, state }, page) {
        return timeout(1000, {
            page,
        })
            .then(response => {
                const index = state.pages.findIndex(p => p.id == page.id)
                commit('SET_CMS_PAGES', [
                    ...state.pages.slice(0, index),
                    response.page,
                    ...state.pages.slice(index + 1),
                ])
                return response.contact
            })
            .catch(e => dispatch('handleError', e))
    },
    deleteCMSPage({ commit, dispatch, state }, id) {
        return timeout(1000)
            .then(() => {
                commit('SET_CMS_PAGES', [...state.pages.filter(plan => plan.id != id)])
                return
            })
            .catch(e => dispatch('handleError', e))
    },
    getCMSPages({ commit, dispatch, state }) {
        return timeout(0, {
            pages: state.pages.length ? state.pages : fakePages,
        })
            .then(response => {
                commit('SET_CMS_PAGES', response.pages)
                return response.pages
            })
            .catch(e => dispatch('handleError', e))
    },
    getCMSPage({ commit, dispatch, state }, id) {
        commit('SET_CURRENT_CMS_PAGE', null)
        return timeout(0, { page: [...state.pages, ...fakePages].find(p => p.id == id) })
            .then(({ page }) => {
                commit('SET_CURRENT_CMS_PAGE', page)
                return page
            })
            .catch(e => dispatch('handleError', e))
    },
}

export default {
    namespaced: false,
    state,
    actions,
    mutations,
}
