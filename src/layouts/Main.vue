<script>
import GlobalHeader from '@/components/header'
import GlobalFooter from '@/components/footer'

export default {
    components: { GlobalHeader, GlobalFooter },

    data() {
        return {
            error: false,
        }
    },

    computed: {
        loading() {
            return this.$store.state.loading
        },
        stateError() {
            return this.$store.state.error
        },
    },

    watch: {
        stateError(val) {
            if (!val) return
            this.error = val
            this.$nextTick(() => {
                this.$store.commit('SET_ERROR', false)
            })
        },
    },

    methods: {
        changeLanguage(language) {
            this.$root.changeLanguage(language)
        },
    },
}
</script>

<template>
    <div class="main">
        <v-app :dark="$root.dark">
            <global-header @language="changeLanguage" />
            <v-container v-show="loading">
                <v-layout align-center justify-center><spinner /></v-layout>
            </v-container>
            <v-content v-show="!loading"><slot /></v-content>
            <global-footer @language="changeLanguage" />
        </v-app>

        <v-snackbar :timeout="0" :value="error" auto-height>
            <span class="first-capitalize">{{ error | translate }}</span>
            <v-btn flat dark class="danger--text text-capitalize" @click="error = false">
                {{ 'dismiss' | translate }}
            </v-btn>
        </v-snackbar>
    </div>
</template>
