import api from '@/api'

const state = {
    lists: [],
    templates: [],
    campaigns: [],
}

const mutations = {
    RESET(state) {
        state.lists = []
        state.templates = []
        state.campaigns = []
    },
    SET_LISTS(state, data) {
        state.lists = data
    },
    SET_TEMPLATES(state, data) {
        state.templates = data
    },
    SET_CAMPAIGNS(state, data) {
        state.campaigns = data
    },
}

const actions = {
    getMailchimpLists({ commit, dispatch }) {
        return api
            .get('/mailchimp/lists')
            .then(({ items }) => {
                commit('SET_LISTS', items)
                return items
            })
            .catch(e => dispatch('handleError', e))
    },
    getMailchimpTemplates({ commit, dispatch }) {
        return api
            .get('/mailchimp/templates')
            .then(({ items }) => {
                commit('SET_TEMPLATES', items)
                return items
            })
            .catch(e => dispatch('handleError', e))
    },
    getMailchimpCampaigns({ commit, dispatch }) {
        return api
            .get('/mailchimp/campaigns')
            .then(({ items }) => {
                commit('SET_CAMPAIGNS', items)
                return items
            })
            .catch(e => dispatch('handleError', e))
    },
    createMailchimpCampaign({ dispatch }, { data }) {
        return api
            .post('/mailchimp/campaigns', data)
            .then(() => {
                dispatch('getMailchimpCampaigns')
            })
            .catch(e => dispatch('handleError', e))
    },
    updateMailchimpCampaign({ dispatch }, { id, data }) {
        return api
            .patch(`/mailchimp/campaigns/${id}`, data)
            .then(() => {
                dispatch('getMailchimpCampaigns')
            })
            .catch(e => dispatch('handleError', e))
    },
    deleteMailchimpCampaign({ dispatch }, { id }) {
        return api
            .delete(`/mailchimp/campaigns/${id}`)
            .then(() => {
                dispatch('getMailchimpCampaigns')
            })
            .catch(e => dispatch('handleError', e))
    },
    sendMailchimpCampaign({ dispatch }, { id }) {
        return api
            .post(`/mailchimp/campaigns/${id}/send`)
            .then(() => {
                dispatch('getMailchimpCampaigns')
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
