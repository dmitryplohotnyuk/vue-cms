import api from '@/api'
import { baseURL } from '@/api'

const actions = {
    addRecord({ dispatch }, { project_id, record }) {
        return api
            .post(`/records/${project_id}`, {
                record,
            })
            .then(() => {
                return true
            })
            .catch(e => dispatch('handleError', e))
    },
    updateRecord({ dispatch }, { project_id, record }) {
        return api
            .put(`/records/${project_id}/${record.id}`, {
                record,
            })
            .then(() => {
                return true
            })
            .catch(e => dispatch('handleError', e))
    },
    deleteRecord({ dispatch }, { project_id, record_id }) {
        return api
            .delete(`/records/${project_id}/${record_id}`, {})
            .catch(e => dispatch('handleError', e))
    },
    saveMonthlyCost({ dispatch }, { project_id, record_id, record }) {
        return api
            .put(`/records/${project_id}/${record_id}/monthly`, { record })
            .catch(e => dispatch('handleError', e))
    },
    saveDailyCost({ dispatch }, { project_id, record_id, record }) {
        return api
            .put(`/records/${project_id}/${record_id}/daily`, { record })
            .catch(e => dispatch('handleError', e))
    },

    getMonthlyCosts({ commit, dispatch }, { project_id, type }) {
        return api
            .get(`/records/${project_id}/${type}`)
            .then(({ records }) => {
                commit('SET_RECORDS', {
                    records: records.actual,
                    type,
                    plan: 'actual',
                })
                commit('SET_RECORDS', {
                    records: records.planned,
                    type,
                    plan: 'planned',
                })
                return Promise.resolve(records.planned)
            })
            .catch(e => dispatch('handleError', e))
    },

    getDailyCosts({ commit, dispatch }, { project_id, type, date }) {
        return api
            .get(`/records/${project_id}/${type}/${date}`)
            .then(({ records }) => {
                commit('SET_DAILY', {
                    records: records.actual,
                    type,
                    plan: 'actual',
                })
                commit('SET_DAILY', {
                    records: records.planned,
                    type,
                    plan: 'planned',
                })
                return Promise.resolve(records.planned)
            })
            .catch(e => dispatch('handleError', e))
    },

    getCSVLink({ dispatch }, { project_id, type, planned }) {
        let budget = planned ? 'planned' : 'actual'
        return api
            .post(`/records/${project_id}/${budget}/${type}/export`, { format: 'csv' })
            .then(({ name }) => {
                return baseURL + `/records/${project_id}/${type}/${name}/download`
            })
            .catch(e => dispatch('handleError', e))
    },

    // groupBy: 'day', 'week', 'month', 'quarter', 'year'
    // type: 'mrr', 'net_revenue', 'arpu', 'annual_run_rate', 'lifetime_value',
    // 'mrr_growth_rate', 'revenue_churn'
    getAnalytics({ dispatch }, { project_id, from, to, groupBy, type }) {
        return api
            .get(`/records/stats/${project_id}/${type}/${groupBy}/${from}:${to}`)
            .then(({ records }) => {
                // records: [{date: Date, value: Number}, ...]
                return Promise.resolve(records)
            })
            .catch(e => dispatch('handleError', e))
    },
}

export default {
    namespaced: false,
    actions,
}
