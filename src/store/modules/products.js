import api from '@/api'

const state = {
    list: [],
}

const mutations = {
    RESET(state) {
        state.list = []
    },
    SET_PRODUCTS(state, data) {
        state.list = data
    },
}

const actions = {
    getProducts({ commit, dispatch }) {
        return api
            .get(`/products`)
            .then(({ products }) => {
                commit('SET_PRODUCTS', products)
                return products
            })
            .catch(e => dispatch('handleError', e))
    },
    getProduct({ dispatch }, id) {
        return api
            .get(`/products/${id}`)
            .then(({ product }) => {
                return product
            })
            .catch(e => dispatch('handleError', e))
    },
    createProduct({ dispatch }, product) {
        return api
            .post(`/products`, { product })
            .then(() => {
                dispatch('getProducts')
            })
            .catch(e => dispatch('handleError', e))
    },
    updateProduct({ dispatch }, product) {
        return api
            .patch(`/products/${product.id}`, { product })
            .then(() => {
                dispatch('getProducts')
            })
            .catch(e => dispatch('handleError', e))
    },
    deleteProduct({ dispatch }, id) {
        return api
            .delete(`/products/${id}`)
            .then(() => {
                dispatch('getProducts')
            })
            .catch(e => dispatch('handleError', e))
    },
    productAddProject({ dispatch }, { product, id }) {
        return api
            .patch(`/products/${product.id}/projects`, {
                project: {
                    id,
                },
            })
            .catch(e => dispatch('handleError', e))
    },
    productRemoveProject({ dispatch }, { product, id }) {
        return api
            .delete(`/products/${product.id}/projects/${id}`, {})
            .catch(e => dispatch('handleError', e))
    },
}

export default {
    namespaced: false,
    state,
    actions,
    mutations,
}
