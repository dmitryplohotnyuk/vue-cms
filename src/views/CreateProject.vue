<script>
import appConfig from '@/app.config'
import ProjectForm from '@/components/project/form'

export default {
    components: { ProjectForm },
    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },
    data() {
        return {
            metaJA: {
                title: 'プロジェクト登録',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Create project',
                meta: [{ name: 'description', content: appConfig.description }],
            },
        }
    },
}
</script>

<template>
    <Layout>
        <v-container grid-list-lg fluid class="pa-3">
            <v-layout row wrap justify-center>
                <v-flex sm12 md8 lg7><project-form /></v-flex>
            </v-layout>
        </v-container>
    </Layout>
</template>
