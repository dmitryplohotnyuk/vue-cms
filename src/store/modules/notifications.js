import api from '@/api'

const state = {
    list: [],
}

const mutations = {
    RESET(state) {
        state.list = []
    },
    SET_NOTIFICATIONS(state, data) {
        state.list = data
    },
}

const actions = {
    getNotifications({ commit, dispatch }) {
        return api
            .get('/notifications')
            .then(({ notifications }) => {
                commit('SET_NOTIFICATIONS', notifications)
                return notifications
            })
            .catch(e => dispatch('handleError', e))
    },
    markNotificationsRead({ dispatch }, notifications) {
        return api
            .put('/notifications/read', { notifications })
            .catch(e => dispatch('handleError', e))
    },
}

export default {
    namespaced: false,
    state,
    actions,
    mutations,
}
