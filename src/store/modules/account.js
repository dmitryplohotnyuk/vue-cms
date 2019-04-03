import { clearAccessToken, setAccessToken } from '@/auth'
import api from '@/api'

const state = {
    user: {},
    industries: [],
}

const mutations = {
    RESET(state) {
        state.user = {}
        clearAccessToken()
    },

    SET_CURRENT_USER(state, data) {
        state.user = data ? data : {}
        if (!data || data == {}) {
            clearAccessToken()
        }
    },
    SET_INDUSTRIES(state, data) {
        state.industries = data
    },
    SET_COMPANY(state, data) {
        state.user.company = data
    },
}

const getters = {
    signedIn(state) {
        return !!state.user.id
    },

    subscribed(state) {
        return state.user.subscribed
    },
}

const actions = {
    signUp({ dispatch }, user) {
        return api
            .post('/users', {
                user,
            })
            .then(response => {
                if (!response.token) {
                    return dispatch('handleError', response)
                }
                setAccessToken(response.token)
                return true
            })
            .catch(e => dispatch('handleError', e))
    },

    clearSession({ commit }) {
        commit('RESET')
    },

    signOut() {
        api.post('/users/logout', {})
    },

    signIn(context, user) {
        if (context.getters.signedIn) return context.dispatch('getUser')

        return api
            .post('/users/login', {
                user,
            })
            .then(response => {
                setAccessToken(response.token)
                return true
            })
            .catch(e => context.dispatch('handleError', e))
    },

    getUser({ commit }) {
        return api.get('/user').then(({ user }) => {
            commit('SET_CURRENT_USER', user)
            return user
        })
    },

    updateUser({ commit, dispatch }, user) {
        return api
            .patch('/user', {
                user,
            })
            .then(({ user }) => {
                commit('SET_CURRENT_USER', user)
                return user
            })
            .catch(e => dispatch('handleError', e))
    },

    getUserCompany({ commit, dispatch }) {
        return api
            .get('/user/company')
            .then(({ company }) => {
                commit('SET_COMPANY', company)
                return company
            })
            .catch(e => dispatch('handleError', e))
    },

    updateUserCompany({ dispatch }, company) {
        return api
            .put('/user/company', {
                company,
            })
            .catch(e => dispatch('handleError', e))
    },

    addCard({ dispatch }, card) {
        return api
            .post('/user/cards', {
                card,
            })
            .catch(e => dispatch('handleError', e))
    },

    startTrial({ dispatch }) {
        return api.post('/user/trial', {}).catch(e => dispatch('handleError', e))
    },

    getIndustries({ commit, dispatch }) {
        return api
            .get('/industries')
            .then(({ industries }) => {
                commit('SET_INDUSTRIES', industries)
                return industries
            })
            .catch(e => dispatch('handleError', e))
    },
}

export default {
    namespaced: false,
    state,
    actions,
    getters,
    mutations,
}
