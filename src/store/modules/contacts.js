import api from '@/api'

const state = {
    list: [],
    metrics: {
        trend: null,
    },
    tags: [],
    showMetrics: false,
}

const mutations = {
    RESET(state) {
        state.list = []
        state.metrics = { trend: null }
        state.tags = []
        state.showMetrics = false
    },
    SET_CONTACTS(state, data) {
        state.list = data
    },
    SET_CREATED_TREND(state, data) {
        state.metrics.trend = data
    },
    SET_TAGS(state, data) {
        state.tags = data
    },
    SET_SHOW_METRICS(state, data) {
        state.showMetrics = data
    },
}

const actions = {
    createContact({ dispatch }, contact) {
        return api
            .post('/contacts', {
                contact,
            })
            .catch(e => dispatch('handleError', e))
    },
    updateContact({ dispatch }, contact) {
        return api
            .patch(`/contacts/${contact.id}`, {
                contact,
            })
            .then(() => {
                dispatch('getContact', contact.id)
            })
            .catch(e => dispatch('handleError', e))
    },
    linkContacts({ dispatch }, { id, key, parentId }) {
        return api
            .patch(`/contacts/${id}`, {
                contact: { id, [key]: parentId },
            })
            .catch(e => dispatch('handleError', e))
    },
    deleteContact({ dispatch }, id) {
        return api.delete(`/contacts/${id}`, {}).catch(e => dispatch('handleError', e))
    },
    getContacts({ commit, dispatch }, params = {}) {
        let { pagination, search, tags } = params
        tags = tags ? tags.join(',') : ''
        pagination ? delete pagination.totalItems : false
        return api
            .get('/contacts', { params: { ...pagination, search, tags } })
            .then(response => {
                commit('SET_CONTACTS', response)
                return response.contacts
            })
            .catch(e => dispatch('handleError', e))
    },
    getContact({ dispatch }, id) {
        return api
            .get(`/contacts/${id}`)
            .then(({ contact }) => {
                return contact
            })
            .catch(e => dispatch('handleError', e))
    },
    getContactAddresses({ dispatch }, id) {
        return api
            .get(`/addresses/contact/${id}`)
            .then(({ addresses }) => {
                return addresses
            })
            .catch(e => dispatch('handleError', e))
    },
    createContactAddress({ dispatch }, address) {
        const url = `/addresses/contact/${address.contactId}`
        delete address.contactId
        return api
            .post(url, {
                address,
            })
            .catch(e => dispatch('handleError', e))
    },
    updateContactAddress({ dispatch }, address) {
        const url = `/addresses/contact/${address.contactId}/${address.id}`
        delete address.contactId
        return api
            .put(url, {
                address,
            })
            .catch(e => dispatch('handleError', e))
    },
    deleteContactAddress({ dispatch }, address) {
        return api
            .delete(`/addresses/contact/${address.contactId}/${address.id}`, {})
            .catch(e => dispatch('handleError', e))
    },
    getCreatedTrend({ commit, dispatch }) {
        return api
            .get('/contacts/trends/created')
            .then(({ trend }) => {
                commit('SET_CREATED_TREND', trend)
                return trend
            })
            .catch(e => dispatch('handleError', e))
    },
    getContactsTags({ commit, dispatch }) {
        return api
            .get('/contacts/tags/list')
            .then(({ tags }) => {
                commit('SET_TAGS', tags)
                return tags
            })
            .catch(e => dispatch('handleError', e))
    },
    setShowMetrics({ commit }, showMetrics) {
        try {
            localStorage.setItem('contacts.showMetrics', JSON.stringify(showMetrics))
            commit('SET_SHOW_METRICS', showMetrics)
            return showMetrics
        } catch (e) {
            return showMetrics
        }
    },
    getShowMetrics({ commit }) {
        const defaultValue = true
        try {
            const showMetrics = JSON.parse(localStorage.getItem('contacts.showMetrics'))
            commit('SET_SHOW_METRICS', showMetrics)
            return showMetrics
        } catch (e) {
            return defaultValue
        }
    },
};

export default {
    namespaced: false,
    state,
    actions,
    mutations,
}
