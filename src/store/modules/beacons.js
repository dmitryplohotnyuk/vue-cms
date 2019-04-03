import api from '@/api'

const state = {}

const mutations = {}

const actions = {
    createBeacon({ dispatch }, beacon) {
        return api.post(`/beacons`, { beacon }).catch(e => dispatch('handleError', e))
    },
    getBeacon({ dispatch }, id) {
        return api
            .get(`/beacons/${id}`)
            .then(({ beacon }) => beacon)
            .catch(e => dispatch('handleError', e))
    },
    updateBeacon({ dispatch }, beacon) {
        return api.patch(`/beacons/${beacon.id}`, { beacon }).catch(e => dispatch('handleError', e))
    },
    deleteBeacon({ dispatch }, id) {
        return api.delete(`/beacons/${id}`).catch(e => dispatch('handleError', e))
    },
}

export default {
    namespaced: false,
    state,
    actions,
    mutations,
}
