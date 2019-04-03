<script>
import { mapState, mapGetters } from 'vuex'
import PlChart from '@/components/cost/plChart'
import PlTable from '@/components/cost/plTable'
import EmptyState from '@/components/empty.vue'

export default {
    components: {
        PlChart,
        PlTable,
        EmptyState,
    },
    data: () => ({}),
    computed: {
        ...mapState({
            project: state => state.projects.current,
            widgetsSettings: state => state.projects.widgetsSettings,
        }),
        ...mapGetters(['is_widget_enabled', 'no_records']),
        showEmpty() {
            return (
                this.no_records ||
                (!this.is_widget_enabled('pl-chart') && !this.is_widget_enabled('pl-table'))
            )
        },
    },
    mounted() {
        this.load.run()
    },
    watch: {
        'project.id': function() {
            this.load.run()
        },
    },
    tasks(t) {
        return {
            load: t(async function() {
                await this.$store.dispatch('getRecords')
            }).flow('drop'),
        }
    },
    methods: {},
}
</script>

<template>
    <div v-if="load.isIdle && load.lastResolved">
        <v-card v-if="showEmpty">
            <v-container fluid style="max-width: 800px">
                <v-layout row align-start justify-center>
                    <v-flex sm12 md8>
                        <empty-state title="No widgets">
                            <template v-slot:action>
                                <div
                                    v-translate="{
                                        key:
                                            'Click the || button in the toolbar to customise your Project Dashboard.',
                                    }"
                                >
                                    <span /><v-icon>widgets</v-icon><span /><span />
                                </div>
                            </template>
                        </empty-state>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
        <v-container v-else fluid grid-list-lg class="pa-0">
            <v-layout row wrap>
                <v-flex xs12 md8>
                    <pl-chart
                        v-if="is_widget_enabled('pl-chart')"
                        class="mt-0 mb-3"
                        @remove="$emit('remove', 'pl-chart')"
                    />
                    <pl-table
                        v-if="is_widget_enabled('pl-table')"
                        :id="project.id"
                        class="mx-0 pa-3"
                        @remove="$emit('remove', 'pl-table')"
                    />
                </v-flex>
                <v-flex xs12 md4><slot /></v-flex>
            </v-layout>
        </v-container>
    </div>
</template>
