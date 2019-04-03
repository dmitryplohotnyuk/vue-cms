import api from '@/api'

const state = {
    teams: [],
    team: {},
    joined_teams: [],
}

const mutations = {
    RESET(state) {
        state.teams = []
        state.joined_teams = []
        state.team = {}
    },
    SET_TEAMS(state, data) {
        state.teams = data
    },
    SET_JOINED_TEAMS(state, data) {
        state.joined_teams = data
    },
    SET_CURRENT_TEAM(state, data) {
        state.team = data ? data : {}
    },
}

const actions = {
    createTeam({ dispatch }, team) {
        return api
            .post('/teams', {
                team,
            })
            .then(response => {
                return response.team
            })
            .catch(e => dispatch('handleError', e))
    },
    deleteTeam({ dispatch }, id) {
        return api.delete(`/teams/${id}`, {}).catch(e => dispatch('handleError', e))
    },
    getTeams({ commit, dispatch }) {
        return api
            .get('/teams')
            .then(({ teams }) => {
                commit('SET_TEAMS', teams)
                return teams
            })
            .catch(e => dispatch('handleError', e))
    },
    getJoinedTeams({ commit, dispatch }) {
        return api
            .get('/teams/joined')
            .then(({ teams }) => {
                commit('SET_JOINED_TEAMS', teams)
                return teams
            })
            .catch(e => dispatch('handleError', e))
    },
    getTeam({ commit, dispatch }, id) {
        commit('SET_CURRENT_TEAM', null)
        return api
            .get(`/teams/${id}`)
            .then(({ team }) => {
                commit('SET_CURRENT_TEAM', team)
                return team
            })
            .catch(e => dispatch('handleError', e))
    },
    teamAddProject({ dispatch }, { id, project_id }) {
        return api
            .patch(`/teams/${id}/projects`, {
                project: {
                    id: project_id,
                },
            })
            .catch(e => dispatch('handleError', e))
    },
    teamAddMember({ dispatch }, { id, email }) {
        return api
            .patch(`/teams/${id}/members`, {
                member: {
                    email,
                },
            })
            .catch(e => dispatch('handleError', e))
    },
    teamRemoveProject({ dispatch }, { id, project_id }) {
        return api
            .delete(`/teams/${id}/projects/${project_id}`, {})
            .catch(e => dispatch('handleError', e))
    },
    teamRemoveMember({ dispatch }, { id, member_id }) {
        return api
            .delete(`/teams/${id}/members/${member_id}`, {})
            .catch(e => dispatch('handleError', e))
    },
}

export default {
    namespaced: false,
    state,
    actions,
    mutations,
}
