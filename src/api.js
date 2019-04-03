import axios from 'axios'
import { get as lodashGet } from 'lodash'

import { setAccessToken, getAccessToken, clearAccessToken } from './auth'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export const baseURL = process.env.VUE_APP_BASE_URI ? process.env.VUE_APP_BASE_URI : '/api'

const api = axios.create({
    baseURL,
})

api.interceptors.request.use(
    function(config) {
        const token = getAccessToken()
        if (token) config.headers.common['X-Auth-Token'] = token
        let csrf = document.head.querySelector('meta[name="csrf-token"]')
        if (csrf) {
            config.common['X-CSRF-TOKEN'] = csrf.content
        }
        return config
    },
    function(error) {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    function({ data, headers }) {
        let newtoken = headers.authorization || false
        if (newtoken) setAccessToken(newtoken.replace('Bearer ', ''))
        return data
    },
    function(error) {
        if (!error.response) {
            return Promise.reject(error.message)
        }
        switch (error.response.status) {
            case 401:
                clearAccessToken()
                return Promise.reject(401)
            case 500:
                if (
                    lodashGet(error, 'response.data.errors.message') ==
                    'Token Signature could not be verified.'
                ) {
                    clearAccessToken()
                    return Promise.reject(401)
                }
        }
        return Promise.reject(error)
    }
)

export default api
