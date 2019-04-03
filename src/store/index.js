import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import teams from './modules/teams'
import projects from './modules/projects'
import records from './modules/records'
import subscriptions from './modules/subscriptions'
import account from './modules/account'
import notifications from './modules/notifications'
import integrations from './modules/integrations'
import contacts from './modules/contacts'
import uploads from './modules/uploads'
import mailchimp from './modules/mailchimp'
import cms from './modules/cms'
import products from './modules/products'
import plans from './modules/plans'
import beacons from './modules/beacons'
import router from '@/router'

Vue.use(Vuex)
const state = {
    loading: false,
    error: null,
}

const mutations = {
    SET_LOADING(state, data) {
        state.loading = data
    },
    SET_ERROR(state, data) {
        state.error = data
    },
}

const actions = {
    startLoading({ commit }) {
        commit('SET_LOADING', true)
    },

    finishLoading({ commit }) {
        commit('SET_LOADING', false)
    },

    handleError({ commit, dispatch }, error) {
        let status = 0
        if (typeof error !== 'string') {
            status = error.response ? error.response.status : 0
            if (error == 401) {
                dispatch('clearSession')
                router.push('/signin')
                return Promise.reject(status)
            } else if (!error.response) {
                // eslint-disable-next-line
                console.error(error)
                error = 'request failed'
            } else if (error.response && error.response.status == 401) {
                error = 'Access denied'
            } else if (
                error.response &&
                error.response.data.errors &&
                error.response.data.errors.message
            ) {
                error = error.response.data.errors.message
            } else if (error.response && error.response.data.errors) {
                var errorString = ''
                for (var prop in error.response.data.errors) {
                    errorString += error.response.data.errors[prop] + '\n'
                }
                error = errorString
            } else if (error.response && error.response.data.message) {
                error = error.response.data.message
            } else {
                error = 'Request failed'
            }
        }
        commit('SET_ERROR', error)
        return Promise.reject(status)
    },
    resetError({ commit }) {
        commit('SET_ERROR', null)
    },
}
export default new Vuex.Store({
    state,
    actions,
    mutations,
    modules: {
        auth,
        teams,
        projects,
        records,
        subscriptions,
        account,
        uploads,
        mailchimp,
        notifications,
        contacts,
        integrations,
        cms,
        products,
        plans,
        beacons,
    },
})
