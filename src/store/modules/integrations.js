import api from '@/api'

const state = {
    list: [],
}

const mutations = {
    RESET(state) {
        state.list = []
    },
    SET_INTEGRATIONS(state, data) {
        state.list = data
    },
}

const actions = {
    getIntegrations({ commit, dispatch }) {
        return api
            .get('/integrations')
            .then(({ integrations }) => {
                commit('SET_INTEGRATIONS', integrations)
                return integrations
            })
            .catch(e => dispatch('handleError', e))
    },
    sendTestWebhook({ dispatch }) {
        return api.put('/integrations/webhook/test', {}).catch(e => dispatch('handleError', e))
    },
    disableWebhook({ dispatch }, disable) {
        disable = !!disable
        return api
            .put('/integrations/webhook/disable', { disable })
            .catch(e => dispatch('handleError', e))
    },
    createWebhook({ dispatch }, webhook) {
        return api
            .post('/integrations/webhook', {
                webhook,
            })
            .then(() => {
                dispatch('getIntegrations')
            })
            .catch(e => dispatch('handleError', e))
    },
    updateWebhook({ dispatch }, webhook) {
        return api
            .patch(`/integrations/webhook`, {
                webhook,
            })
            .then(() => {
                dispatch('getIntegrations')
            })
            .catch(e => dispatch('handleError', e))
    },
    createMailchimp({ dispatch }, mailchimp) {
        return api
            .post('/integrations/mailchimp', {
                mailchimp,
            })
            .then(() => {
                dispatch('getIntegrations')
            })
            .catch(e => dispatch('handleError', e))
    },
    updateMailchimp({ dispatch }, mailchimp) {
        return api
            .patch(`/integrations/mailchimp`, {
                mailchimp,
            })
            .then(() => {
                dispatch('getIntegrations')
            })
            .catch(e => dispatch('handleError', e))
    },
    importMailchimp({ dispatch }) {
        return api.post('/integrations/mailchimp/import').catch(e => dispatch('handleError', e))
    },
    removeIntegration({ dispatch }, id) {
        return api.delete(`/integrations/${id}`, {}).catch(e => dispatch('handleError', e))
    },
    generateAPIKey({ dispatch }) {
        return api
            .post(`/integrations/api`, {})
            .then(() => {
                dispatch('getIntegrations')
            })
            .catch(e => dispatch('handleError', e))
    },
    saveStripe({ dispatch }, stripe) {
        return api
            .post(`/integrations/stripe`, { stripe })
            .then(() => {
                dispatch('getIntegrations')
            })
            .catch(e => dispatch('handleError', e))
    },
    oauthGet({ dispatch }, service) {
        return api.get(`/integrations/${service}/oauth`, {}).catch(e => dispatch('handleError', e))
    },
    oauthPost({ dispatch }, { service, params }) {
        return api
            .post(`/integrations/${service}/oauth`, params)
            .then(response => {
                return response
            })
            .catch(e => dispatch('handleError', e))
    },
    updateFreee({ dispatch }) {
        return api
            .post('/integrations/freee/update')
            .then(dispatch('getIntegrations'))
            .catch(e => dispatch('handleError', e))
    },
    synchronizeGoogleContacts({ dispatch }) {
        return api
            .get('/contacts/google/synchronize')
            .then(response => {
                return response
            })
            .catch(e => dispatch('handleError', e))
    },
};

export default {
    namespaced: false,
    state,
    actions,
    mutations,
}
