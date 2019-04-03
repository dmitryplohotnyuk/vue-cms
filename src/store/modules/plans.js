import api from '@/api'

const state = {}

const mutations = {}

const actions = {
    createPlan({ dispatch }, plan) {
        return api
            .post(`/products/${plan.product_id}/plans`, { plan })
            .catch(e => dispatch('handleError', e))
    },
    getPlan({ dispatch }, id) {
        return api
            .get(`/plans/${id}`)
            .then(({ plan }) => {
                return plan
            })
            .catch(e => dispatch('handleError', e))
    },
    updatePlan({ dispatch }, plan) {
        return api.patch(`/plans/${plan.id}`, { plan }).catch(e => dispatch('handleError', e))
    },
    deletePlan({ dispatch }, id) {
        return api.delete(`/plans/${id}`).catch(e => dispatch('handleError', e))
    },
}

export default {
    namespaced: false,
    state,
    actions,
    mutations,
}
