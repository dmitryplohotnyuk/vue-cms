import Vue from 'vue'
import VueRouter from 'vue-router'
// https://github.com/declandewet/vue-meta
import VueMeta from 'vue-meta'
// Adds a loading bar at the top during page loads.
import NProgress from 'nprogress/nprogress'
NProgress.configure({ showSpinner: false })

import store from '../store'
import routes from './routes'

import { hasToken } from '../auth'

Vue.use(VueRouter)
Vue.use(VueMeta, {
    // The component option name that vue-meta looks for meta info on.
    keyName: 'page',
})

const router = new VueRouter({
    routes,
    mode: 'history',
    base: '/',
    // Simulate native-like scroll behavior when navigating to a new
    // route and using back/forward buttons.
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return {
                x: 0,
                y: 0,
            }
        }
    },
})

// Before each route evaluates...
router.beforeEach((to, from, next) => {
    // Check if auth is required on this route (including nested routes).
    const authRequired = to.matched.some(route => route.meta.authRequired)
    const redirectAuth = to.meta.redirectAuth

    if (redirectAuth && hasToken()) return next({ name: redirectAuth })

    if (to && to.name == 'signout') {
        to = {}
        return store.dispatch('signOut').then(() => redirectToSignin())
    }

    // If auth isn't required for the route, just continue.
    if (!authRequired) return next()

    if (!hasToken()) return redirectToSignin()

    if (hasToken() && store.getters.signedIn) return next()
    NProgress.start()

    return store
        .dispatch('getUser')
        .then(validUser => {
            NProgress.done()
            // Then continue if the token still represents a valid user,
            // otherwise redirect to login.
            validUser ? next() : redirectToSignin()
        })
        .catch(error => {
            if (error == 401) {
                return redirectToSignin()
            }
            return next(error)
        })

    function redirectToSignin() {
        store.dispatch('clearSession')
        next({
            path: '/signin',
            query: { redirect: to.fullPath },
        })
    }
})

// After navigation is confirmed, but before resolving...
router.beforeResolve((routeTo, routeFrom, next) => {
    // If this isn't an initial page load...
    if (routeFrom.name) {
        // Start the route progress bar.
        NProgress.start()
    }
    next()
})

// When each route is finished evaluating...
router.afterEach(() => {
    // Complete the animation of the route progress bar.
    NProgress.done()
})

router.onError(error => {
    if (error.response && error.response.status == 401) {
        store.dispatch('clearSession')
        return router.replace({ name: 'signin' })
    }
    // TODO: replace current page with error page instead of redirect (not possible currently)
    router.replace({ name: '500', params: { error } })
})

export default router
