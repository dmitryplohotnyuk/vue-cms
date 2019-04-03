<script>
import { mapState, mapActions } from 'vuex'

export default {
    data() {
        return {}
    },
    computed: {
        currency() {
            return this.$store.getters.currency
        },
        ...mapState({
            project: state => state.projects.current,
            pages: state => state.cms.pages,
        }),
        headers() {
            return [
                {
                    text: this.$t('Name'),
                    value: 'title',
                    sortable: true,
                },
                {
                    text: this.$t('URL'),
                    value: 'url',
                    align: 'left',
                },
                {
                    text: this.$t('Type'),
                    value: 'type',
                    align: 'left',
                },
                {
                    text: 'Actions',
                    value: '',
                    align: 'right',
                    sortable: false,
                },
            ]
        },
    },
    mounted() {
        if (!(this.pages && this.pages.length)) {
            this.getCMSPages().catch(this.handleError)
        }
    },
    methods: {
        ...mapActions(['getCMSPages', 'handleError']),
        _handleError() {
            this.sending = false
        },
    },
}
</script>
<template>
    <v-layout row wrap align-start justify-center v-if="project">
        <v-flex sm12 md8 lg7 class="py-3">
            <div class="pb-3">
                <v-layout row wrap class="headline text-capitalize">
                    <v-flex grow> {{ 'pages' | translate }} </v-flex>
                    <v-flex shrink>
                        <v-btn
                            flat
                            :to="{
                                name: 'project',
                                params: { id: project.id, view: 'cms' },
                            }"
                        >
                            <v-icon left>arrow_back</v-icon>
                            {{ 'cms home' | translate }}
                        </v-btn>
                    </v-flex>
                    <v-flex shrink>
                        <v-btn
                            color="primary"
                            :to="{
                                name: 'project',
                                params: {
                                    id: project.id,
                                    view: 'cms',
                                    subview: 'pages',
                                    entity: 'create',
                                },
                            }"
                        >
                            {{ 'add page' | translate }}
                        </v-btn>
                    </v-flex>
                </v-layout>
                <v-divider />
            </div>
            <v-data-table
                :headers="headers"
                :items="pages"
                :loading="!(pages && pages.length)"
                hide-actions
                class="elevation-1 mb-3"
            >
                <template slot="items" slot-scope="props">
                    <td>{{ props.item.title }}</td>
                    <td>{{ props.item.url }}</td>
                    <td>{{ props.item.type }}</td>
                    <td class="text-xs-right">
                        <v-btn
                            small
                            icon
                            :to="{
                                name: 'project',
                                params: {
                                    id: project.id,
                                    view: 'cms',
                                    subview: 'pages',
                                    entity: props.item.id,
                                },
                            }"
                        >
                            <v-icon>edit</v-icon>
                        </v-btn>
                        <v-btn
                            small
                            icon
                            class="mr-0"
                            :to="{
                                name: 'project',
                                params: {
                                    id: project.id,
                                    view: 'cms',
                                    subview: 'theme',
                                    entity: props.item.id,
                                },
                            }"
                        >
                            <v-icon>brush</v-icon>
                        </v-btn>
                    </td>
                </template>
                <template slot="no-data" class="text-center">
                    <div class="text-center">{{ 'no data' | translate }}</div>
                </template>
            </v-data-table>
        </v-flex>
    </v-layout>
</template>

<style lang="scss" scoped></style>
