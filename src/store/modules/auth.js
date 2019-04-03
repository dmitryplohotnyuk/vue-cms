import api from '@/api'
import { setAccessToken } from '@/auth'

const state = {}

const actions = {
    requestReset({ dispatch }, email) {
        return api
            .post('/auth/password/email', {
                email,
            })
            .then(() => {
                return Promise.resolve('ok')
            })
            .catch(e => dispatch('handleError', e))
    },
    reset({ dispatch }, user) {
        return api
            .post('/auth/password/reset', user)
            .then(response => {
                if (!response.token) {
                    return dispatch('handleError', response)
                }
                setAccessToken(response.token)
                return true
            })
            .catch(e => dispatch('handleError', e))
    },
    oauthRedirect({ dispatch }, service) {
        return api.get(`/auth/${service}/redirect`, {}).catch(e => dispatch('handleError', e))
    },
    oauthCallback({ dispatch }, { service, params }) {
        return api
            .post(`/auth/${service}/callback`, params)
            .then(response => {
                if (!response.token) {
                    return dispatch('handleError', response)
                }
                setAccessToken(response.token)
                return true
            })
            .catch(e => dispatch('handleError', e))
    },
}

export default {
    namespaced: false,
    state,
    actions,
}
