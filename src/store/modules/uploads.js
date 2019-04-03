const state = {
    upload_history: [],
}

const mutations = {
    SET_UPLOAD_HISTORY(state, data) {
        state.upload_history = data
    },
}

const actions = {
    getUploadHistory({ commit }) {
        let mockData = [
            {
                filename: 'file1.csv',
                created_at: '10/10/2018',
                size: '100kb',
                status: 'done',
                icon: 'done',
                message: '',
                type: 'launch',
            },
            {
                filename: 'file2.csv',
                created_at: '10/11/2018',
                size: '1067kb',
                status: 'processing',
                icon: 'access_time',
                message: '',
                type: 'cogs',
            },
            {
                filename: 'file3.csv',
                created_at: '10/11/2018',
                size: '0kb',
                status: 'invalid',
                icon: 'sentiment_very_dissatisfied',
                message: 'bad file format',
                type: 'opex',
            },
            {
                filename: 'file4.csv',
                created_at: '10/13/2018',
                size: '300kb',
                icon: 'compare_arrows',
                status: 'pending',
                message: '',
                type: 'launch',
            },
        ]

        commit('SET_UPLOAD_HISTORY', mockData)
    },
}

export default {
    namespaced: false,
    state,
    actions,
    mutations,
}
