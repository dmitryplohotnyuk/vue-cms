import api from '@/api'
import format from 'date-fns/format'
import addMonths from 'date-fns/add_months'
import AllCategories from '@/categories.json'
import { toArray } from 'lodash'

let cogs_categories = {}
for (let category in AllCategories) {
    if (
        AllCategories.hasOwnProperty(category) &&
        AllCategories[category].cost_type.indexOf('cogs') >= 0
    ) {
        cogs_categories[category] = AllCategories[category]
    }
}
let opex_categories = {}
for (let category in AllCategories) {
    if (
        AllCategories.hasOwnProperty(category) &&
        AllCategories[category].cost_type.indexOf('opex') >= 0
    ) {
        opex_categories[category] = AllCategories[category]
    }
}
let cogm_categories = {}
for (let category in AllCategories) {
    if (
        AllCategories.hasOwnProperty(category) &&
        AllCategories[category].cost_type.indexOf('cogm') >= 0
    ) {
        cogm_categories[category] = AllCategories[category]
    }
}
let revenue_categories = {}
for (var category in AllCategories) {
    if (
        AllCategories.hasOwnProperty(category) &&
        AllCategories[category].cost_type.indexOf('revenue') >= 0
    ) {
        revenue_categories[category] = AllCategories[category]
    }
}

const currency_map = {
    usd: '＄',
    jpy: '￥',
    eur: '€',
}

const state = {
    current: {},
    drawer: true,
    list: [],
    team_projects: [],
    subscription: {},
    categories: {
        cogs: cogs_categories,
        cogm: cogm_categories,
        opex: opex_categories,
        revenue: revenue_categories,
    },
    planned: {
        cogs: false,
        opex: false,
        revenue: false,
    },
    actual: {
        cogs: false,
        opex: false,
        revenue: false,
    },
    daily: {
        planned: {
            cogs: false,
            opex: false,
            revenue: false,
        },
        actual: {
            cogs: false,
            opex: false,
            revenue: false,
        },
    },
    widgetsSettings: {},
}

const getters = {
    currency({ current }) {
        return currency_map[current.currency]
    },
    market_total({ current }) {
        if (!current.model) return 0
        // serviced addressable market
        return ((current.model.market_size || 0) * current.model.market_share) / 100
    },
    lead_acquisition({ current }, getters) {
        if (!current.model) return 0
        // lead acquisition (LA)
        return getters.market_total / (current.model.conversion_rate / 100)
    },
    lifetime_value({ current }) {
        if (!current.model) return 0
        // lifetime value
        return current.model.avp * current.model.apc
    },
    customer_acquisition_cost({ current }, getters) {
        if (!current.model) return 0
        // customer acquisition cost (CAC)
        return current.model.mi * current.model.cpmi * getters.lead_acquisition
    },
    revenue(state, getters) {
        return getters.market_total * getters.lifetime_value
    },
    gross_profit({ current }, getters) {
        if (!current.model) return 0
        return (
            getters.revenue -
            current.model.avp *
                (current.model.cogs / 100) *
                current.model.apc *
                getters.market_total
        )
    },
    cogs_planned_total(state) {
        if (!state.planned.cogs) return 0
        return state.planned.cogs.reduce((total, row) => {
            if (!row) return total
            return (
                total +
                toArray(row.monthly)
                    .slice(0, state.current.duration)
                    .reduce((mtotal, cost) => {
                        return mtotal + cost.price * cost.quantity * 1
                    }, 0)
            )
        }, 0)
    },
    opex_planned_total(state) {
        if (!state.planned.opex) return 0
        return state.planned.opex.reduce((total, row) => {
            if (!row) return total
            return (
                total +
                toArray(row.monthly)
                    .slice(0, state.current.duration)
                    .reduce((mtotal, cost) => {
                        return mtotal + cost.price * cost.quantity * 1
                    }, 0)
            )
        }, 0)
    },
    revenue_planned_total(state) {
        if (!state.planned.revenue) return 0
        return state.planned.revenue.reduce((total, row) => {
            if (!row) return total
            return (
                total +
                toArray(row.monthly)
                    .slice(0, state.current.duration)
                    .reduce((mtotal, cost) => {
                        return mtotal + cost.price * cost.quantity * 1
                    }, 0)
            )
        }, 0)
    },
    cogs_actual_total(state) {
        if (!state.actual.cogs) return 0
        return state.actual.cogs.reduce((total, row) => {
            if (!row) return total
            return (
                total +
                toArray(row.monthly)
                    .slice(0, state.current.duration)
                    .reduce((mtotal, cost) => {
                        return mtotal + cost.price * cost.quantity * 1
                    }, 0)
            )
        }, 0)
    },
    opex_actual_total(state) {
        if (!state.actual.opex) return 0
        return state.actual.opex.reduce((total, row) => {
            if (!row) return total
            return (
                total +
                toArray(row.monthly)
                    .slice(0, state.current.duration)
                    .reduce((mtotal, cost) => {
                        return mtotal + cost.price * cost.quantity * 1
                    }, 0)
            )
        }, 0)
    },
    revenue_actual_total(state) {
        if (!state.actual.revenue) return 0
        return state.actual.revenue.reduce((total, row) => {
            if (!row) return total
            return (
                total +
                toArray(row.monthly)
                    .slice(0, state.current.duration)
                    .reduce((mtotal, record) => {
                        return mtotal + record.price * record.quantity * 1
                    }, 0)
            )
        }, 0)
    },
    contribution_margin(state, getters) {
        return getters.gross_profit - getters.customer_acquisition_cost
    },
    is_widget_enabled(state) {
        return widgetName => {
            const settings = state.widgetsSettings
            return !(settings && settings[widgetName] && settings[widgetName].enabled === false)
        }
    },
    no_records(state) {
        const { planned, actual } = state
        return ['cogs', 'opex', 'revenue'].every(
            type => planned[type] && !planned[type].length && (actual[type] && !actual[type].length)
        )
    },
}

const mutations = {
    RESET(state) {
        state.current = {}
        state.list = []
        state.team_projects = []
        state.planned = {
            cogs: false,
            opex: false,
            revenue: false,
        }
        state.actual = {
            cogs: false,
            opex: false,
            revenue: false,
        }
        state.daily = {
            planned: {
                cogs: false,
                opex: false,
                revenue: false,
            },
            actual: {
                cogs: false,
                opex: false,
                revenue: false,
            },
        }
        state.subscription = {}
        state.widgetsSettings = {}
    },

    SET_RECORDS(state, { records, type, plan }) {
        state[plan][type] = records
    },

    SET_DAILY(state, { records, type, plan }) {
        state.daily[plan][type] = records
    },

    SET_PROJECTS(state, data) {
        state.list = data
    },

    SET_TEAM_PROJECTS(state, data) {
        state.team_projects = data
    },

    SET_CURRENT_PROJECT(state, data) {
        state.current = data ? data : {}
    },

    SET_MODEL_GROWTH(state, data) {
        state.current.model.data = data
    },

    SET_SUBSCRIPTION(state, data) {
        state.subscription = data
    },

    RESET_RECORDS(state) {
        state.planned = {
            cogs: false,
            opex: false,
            revenue: false,
        }
        state.actual = {
            cogs: false,
            opex: false,
            revenue: false,
        }
        state.daily = {
            planned: {
                cogs: false,
                opex: false,
                revenue: false,
            },
            actual: {
                cogs: false,
                opex: false,
                revenue: false,
            },
        }
    },

    SET_PROJECT_DRAWER(state, data) {
        state.drawer = data
    },

    SET_WIDGETS_SETTINGS(state, data) {
        state.widgetsSettings = data
    },
}

const actions = {
    getProjects({ commit, dispatch }) {
        return api
            .get('/projects')
            .then(({ projects }) => {
                commit('SET_PROJECTS', projects)
                return Promise.resolve(projects)
            })
            .catch(e => dispatch('handleError', e))
    },
    getTeamProjects({ commit, dispatch }) {
        return api
            .get('/projects/team')
            .then(({ projects }) => {
                commit('SET_TEAM_PROJECTS', projects)
                return projects
            })
            .catch(e => dispatch('handleError', e))
    },
    getProject({ commit, dispatch }, id) {
        return api
            .get('/projects/' + id)
            .then(({ project }) => {
                commit('RESET_RECORDS')
                commit('SET_CURRENT_PROJECT', project)
                return project
            })
            .catch(e => {
                commit('SET_CURRENT_PROJECT', null)
                dispatch('handleError', e)
            })
    },
    createProject({ dispatch }, project) {
        return api
            .post('/projects', {
                project,
            })
            .then(response => {
                return response.project
            })
            .catch(e => dispatch('handleError', e))
    },
    updateProject({ dispatch }, project) {
        delete project.user
        project.start_date = format(project.start_date, 'YYYY-MM-DD')
        return api
            .patch(`/projects/${project.id}`, {
                project,
            })
            .then(() => {
                dispatch('getProject', project.id)
            })
            .catch(e => dispatch('handleError', e))
    },
    deleteProject({ commit, dispatch }, id) {
        return api
            .delete(`/projects/${id}`, {})
            .then(() => {
                commit('SET_CURRENT_PROJECT', null)
                commit('RESET_RECORDS')
            })
            .catch(e => dispatch('handleError', e))
    },
    addModel({ dispatch }, { project_id, model }) {
        return api
            .post(`/projects/${project_id}/model`, {
                model,
            })
            .then(({ model }) => {
                return model
            })
            .catch(e => dispatch('handleError', e))
    },
    updateModel({ dispatch }, model) {
        delete model.data
        return api
            .patch(`/projects/${model.project_id}/model`, {
                model,
            })
            .catch(e => dispatch('handleError', e))
    },
    getLinRevenue({ state, getters, commit }) {
        // linear
        if (!state.current.model) return []
        var points = []
        var sum = 0
        let lrev = getters.revenue / state.current.duration
        for (var i = 0; i <= state.current.duration; i++) {
            points.push([addMonths(state.current.start_date, i), sum])
            sum += lrev
        }
        if (state.current.model.growth == 'lin') {
            commit('SET_MODEL_GROWTH', points)
        }
        return points
    },
    getLogRevenue({ state, getters, commit }) {
        // logarithmic
        if (!state.current.model) return []
        var points = []

        points.push([state.current.start_date, 0])
        if (state.current.duration == 1) {
            points.push([
                addMonths(state.current.start_date, state.current.duration),
                getters.revenue,
            ])
        } else {
            // y = C * log (x) + b
            var C = getters.revenue / Math.log(state.current.duration)
            for (var i = 1; i <= state.current.duration; i++) {
                let y = C * Math.log(i) || 0
                points.push([addMonths(state.current.start_date, i), y])
            }
        }
        if (state.current.model.growth == 'log') {
            commit('SET_MODEL_GROWTH', points)
        }
        return points
    },
    getExpRevenue({ state, getters, commit }, growth = 1.35) {
        // exponential
        if (!state.current.model) return []
        // y = C * e^kt
        // y = a(1 + b)^x
        var points = []
        var init = getters.revenue / Math.pow(growth, state.current.duration)
        points.push([state.current.start_date, 0])
        for (var i = 1; i <= state.current.duration; i++) {
            let y = init * Math.pow(growth, i)
            points.push([addMonths(state.current.start_date, i), y])
        }
        if (state.current.model.growth == 'exp') {
            commit('SET_MODEL_GROWTH', points)
        }
        return points
    },
    getProjectGrowthData({ dispatch, state }) {
        switch (state.current.model.growth) {
            case 'lin':
                return dispatch('getLinRevenue')
            case 'log':
                return dispatch('getLogRevenue')
            case 'exp':
                return dispatch('getExpRevenue')
        }
        return Promise.resolve([])
    },
    getRecords({ dispatch, state }) {
        if (!state.current.id) return
        let project_id = state.current.id
        const promises = []
        if (!state.planned.cogs || !state.actual.cogs)
            promises.push(
                dispatch('getMonthlyCosts', {
                    project_id,
                    type: 'cogs',
                })
            )
        if (!state.planned.opex || !state.actual.opex)
            promises.push(
                dispatch('getMonthlyCosts', {
                    project_id,
                    type: 'opex',
                })
            )
        if (!state.planned.revenue || !state.actual.revenue)
            promises.push(
                dispatch('getMonthlyCosts', {
                    project_id,
                    type: 'revenue',
                })
            )
        return Promise.all(promises)
    },
    getSubscription({ commit, dispatch }, id) {
        commit('SET_SUBSCRIPTION', {})
        return api
            .get(`/projects/${id}/subscription`)
            .then(({ subscription }) => {
                commit('SET_SUBSCRIPTION', subscription)
                return subscription
            })
            .catch(e => dispatch('handleError', e))
    },
    cancelSubscription({ dispatch }, projectId) {
        return api
            .delete(`/projects/${projectId}/cancel`, {})
            .catch(e => dispatch('handleError', e))
    },
    resumeSubscription({ dispatch }, projectId) {
        return api.patch(`/projects/${projectId}/resume`, {}).catch(e => dispatch('handleError', e))
    },
    getProjectBeacon({ dispatch }, id) {
        return api
            .get(`/projects/${id}/beacon`)
            .then(({ beacon }) => {
                return beacon
            })
            .catch(e => dispatch('handleError', e))
    },
    setWidgetsSettings({ commit, state }, { widgetsSettings, projectId }) {
        if (!projectId) return
        try {
            const newSettings = {
                ...state.widgetsSettings,
                ...widgetsSettings,
            }
            localStorage.setItem(
                'project.widgetsSettings-' + projectId,
                JSON.stringify(newSettings)
            )
            commit('SET_WIDGETS_SETTINGS', newSettings)
            return widgetsSettings
        } catch (e) {
            return widgetsSettings
        }
    },
    getWidgetsSettings({ commit }, projectId) {
        const defaultValue = { 'pl-chart': { enabled: true }, 'pl-table': { enabled: true } }
        try {
            const widgetsSettings =
                JSON.parse(localStorage.getItem('project.widgetsSettings-' + projectId)) ||
                defaultValue
            commit('SET_WIDGETS_SETTINGS', widgetsSettings)
            return widgetsSettings
        } catch (e) {
            return defaultValue
        }
    },
}

export default {
    namespaced: false,
    state,
    actions,
    getters,
    mutations,
}
