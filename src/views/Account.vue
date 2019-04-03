<script>
import appConfig from '@/app.config'
import AccountDetails from '@/components/account/details'
import Company from '@/components/account/company'

export default {
    components: {
        AccountDetails,
        Company,
    },
    props: {
        view: {
            type: String,
            default: 'details',
        },
    },
    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },
    data() {
        return {
            metaJA: {
                title: 'アカウント',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Account',
                meta: [{ name: 'description', content: appConfig.description }],
            },
        }
    },
    computed: {
        user() {
            return this.$store.state.account.user
        },
    },
    mounted() {},
    methods: {},
}
</script>

<template>
    <Layout>
        <div transition="fadeIn">
            <v-toolbar
                :class="{ 'blue-grey lighten-5': !$root.dark }"
                class="mb-0 v-toolbar__content--nopadding px-3"
                flat
            >
                <v-toolbar-title class="text-capitalize">
                    {{ 'account' | translate }}
                </v-toolbar-title>
                <v-spacer />
            </v-toolbar>
            <transition name="fade" appear>
                <div v-if="view == 'details'">
                    <account-details class="mt-3" />
                    <company class="mt-3" />
                </div>
            </transition>
        </div>
    </Layout>
</template>
