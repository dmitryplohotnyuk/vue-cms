<script>
import { mapGetters } from 'vuex'
import InitialCostsChart from '@/components/project/widgets/initialCostsChart'
import { getWidget, saveWidget } from '@/utils/widgets'

export default {
    components: {
        InitialCostsChart,
    },
    props: ['projectId'],
    data() {
        return {
            goal: null,
            period: 0,
            valid: false,
            rules: {
                goal: [v => (v && v > 0) || this.$t('Must be greater than 0')],
                period: [
                    v => (v && v > 0) || this.$t('Must be greater than 0'),
                    v => (v && v <= 60) || this.$t('Must be below or equal to 60'),
                ],
            },
            isNew: true,
            name: 'initial-costs',
        }
    },
    computed: {
        ...mapGetters(['currency']),
        widget() {
            const { projectId, goal, period } = this
            return {
                name: this.name,
                projectId,
                goal,
                period,
                enabled: true,
            }
        },
    },
    watch: {
        projectId(projectId, oldProjetId) {
            if (projectId !== oldProjetId) {
                this.reset()
            }
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.reset()
        })
    },
    methods: {
        tryToSave() {
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            const { widget } = this
            saveWidget(widget)
            this.$emit('submit', widget, this.name)
        },
        reset() {
            const widget = getWidget(this.name, this.projectId) || {}
            this.isNew = !widget.projectId
            const { period = 0, goal } = widget
            this.period = period
            this.goal = goal
        },
    },
}
</script>

<template>
    <v-form v-model="valid" @submit.prevent="tryToSave" ref="form">
        <v-card>
            <v-card-title class="headline text-capitalize pt-3 pb-0">
                {{ 'Add Initial Cost / Launch Period' | translate }}
            </v-card-title>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs12 md4 class="pl-2">
                        <v-tooltip max-width="300" bottom>
                            <v-text-field
                                class="mb-3"
                                v-model="goal"
                                :label="
                                    'Initial Cost Goal ({project_currency})'
                                        | translate({
                                            project_currency: currency,
                                        })
                                "
                                autofocus
                                slot="activator"
                                type="number"
                                min="0"
                                :step="currency == '￥' ? 1 : 0.01"
                                required
                                :rules="rules.goal"
                            ></v-text-field>
                            <span>
                                {{
                                    'Activity or expenses associated with the research and development of a project. Initial Cost expenses are a type of operating expense and can be deducted as such on a business tax return.'
                                        | translate({
                                            project_currency: currency,
                                        })
                                }}
                            </span>
                        </v-tooltip>
                        <v-tooltip max-width="300" bottom>
                            <div slot="activator">
                                <v-subheader class="pa-0 font-weight-regular subheading mb-3">
                                    {{ 'Launch Period Goal (Months)' | translate }}
                                </v-subheader>
                                <v-slider
                                    class="mt-0 mx-1"
                                    v-model="period"
                                    thumb-label="always"
                                    thumb-size="24"
                                    max="60"
                                    step="1"
                                    required
                                    :rules="rules.period"
                                ></v-slider>
                            </div>
                            <span>
                                {{
                                    'Lunch period is a period before you start selling your product or service. This duration will be counted as an additional months prior to the Project Start Date.'
                                        | translate
                                }}
                            </span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex xs12 md1 class="text-md-center">
                        <v-divider vertical class="hidden-sm-and-down"></v-divider>
                        <v-divider horizontal class="hidden-md-and-up my-3"></v-divider>
                    </v-flex>
                    <v-flex xs12 md7>
                        <v-layout row wrap>
                            <v-flex xs12 sm6 class="mb-3">
                                <v-subheader class="px-0">
                                    <v-layout row wrap>
                                        <v-flex xs12 class="text-uppercase mb-1">
                                            {{ 'Initial Cost Goal' | translate }}
                                        </v-flex>
                                        <v-flex xs12 class="title">
                                            {{ widget.goal | currency(currency) }}
                                        </v-flex>
                                    </v-layout>
                                </v-subheader>
                            </v-flex>
                            <v-flex xs12 sm6 class="mb-3">
                                <v-subheader class="px-0">
                                    <v-layout row wrap>
                                        <v-flex xs12 class="text-uppercase mb-1">
                                            {{ 'Launch Period Goal' | translate }}
                                        </v-flex>
                                        <v-flex xs12 class="title">
                                            {{
                                                '{count} months'
                                                    | translate({ count: widget.period })
                                            }}
                                        </v-flex>
                                    </v-layout>
                                </v-subheader>
                            </v-flex>
                        </v-layout>
                        <InitialCostsChart />
                    </v-flex>
                </v-layout>
            </v-card-text>
            <v-card-actions class="pt-0 pb-3 px-3">
                <v-spacer></v-spacer>
                <v-btn class="danger--text" flat @click="reset"> {{ 'reset' | translate }} </v-btn>
                <v-btn color="primary" dark flat type="submit">
                    <span v-if="isNew">{{ 'create widget' | translate }}</span>
                    <span v-else>{{ 'update widget' | translate }}</span>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<style lang="scss" scoped></style>
