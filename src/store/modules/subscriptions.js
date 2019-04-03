import api from '@/api'

const state = {
    plans: [],
    invoices: [],
}

const getters = {}

const mutations = {
    RESET(state) {
        state.plans = []
        state.invoices = []
    },
    SET_PLANS(state, data) {
        state.plans = data
    },
    SET_INVOICES(state, data) {
        state.invoices = data
    },
}

const actions = {
    getPlans({ commit, dispatch }) {
        return api
            .get('/subscriptions/plans')
            .then(({ plans }) => {
                commit('SET_PLANS', plans)
            })
            .catch(e => dispatch('handleError', e))
    },
    getInvoices({ commit, dispatch }) {
        return api
            .get('/subscriptions/invoices')
            .then(({ invoices }) => {
                commit('SET_INVOICES', invoices)
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
