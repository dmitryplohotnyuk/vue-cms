<script>
import { mapState, mapActions } from 'vuex'
import StepMixin from '@/mixins/stepMixin'
import ListMixin from '@/components/cms/editors/listMixin.vue'
import KDialog from '@/components/dialog'

export default {
    mixins: [StepMixin, ListMixin],
    components: { KDialog },
    data() {
        return {
            // form validation state
            valid: false,
            // form data
            newPlan: {
                interval: '',
                name: '',
                price: '0',
                description: '',
            },
            // validation rules
            rules: {
                interval: [],
                name: [v => !!v || this.$t('Required Field')],
                price: [v => !!v || this.$t('Required Field')],
                description: [],
            },
            // form dialog
            isOpen: false,
            intervalOptions: [
                { value: 'day', text: 'Daily' },
                { value: 'week', text: 'Weekly' },
                { value: 'month', text: 'Monthly' },
                { value: 'quarter', text: 'Every 3 months' },
                { value: 'semiannual', text: 'Every 6 months' },
                { value: 'year', text: 'Yearly' },
            ],
            // request status
            sending: false,
        }
    },
    computed: {
        ...mapState({
            project: state => state.projects.current,
            plans: state => state.cms.plans,
        }),
        items() {
            return this.plans
        },
        headers() {
            return [
                { text: 'visible', sortable: false, class: 'text-capitalize' },
                {
                    text: this.$t('plan name'),
                    value: 'name',
                    sortable: false,
                    class: 'text-capitalize',
                },
                {
                    text: this.$t('price per unit'),
                    value: 'price',
                    sortable: false,
                    class: 'text-capitalize text-xs-right',
                },
                {
                    text: this.$t('interval'),
                    value: 'interval',
                    sortable: false,
                    class: 'text-capitalize',
                },
                { text: 'move', sortable: false, class: 'text-capitalize text-xs-right' },
                { text: 'actions', sortable: false, class: 'text-capitalize text-xs-right' },
            ]
        },
    },
    mounted() {
        if (!this.plans.length) {
            this.getCMSPlans().catch(this.handleError)
        }
    },
    methods: {
        ...mapActions([
            'createCMSPlan',
            'updateCMSPlan',
            'deleteCMSPlan',
            'getCMSPlans',
            'handleError',
        ]),
        _handleError() {
            this.sending = false
        },
        resetValidation() {
            this.$nextTick(() => this.$refs.form.resetValidation())
        },
        up(index) {
            const plans = [...this.plans]
            this.arrayMove(plans, index, index <= 0 ? plans.length - 1 : index - 1)
            this.$store.commit('SET_CMS_PLANS', plans)
        },
        down(index) {
            const plans = [...this.plans]
            this.arrayMove(plans, index, index >= plans.length - 1 ? 0 : index + 1)
            this.$store.commit('SET_CMS_PLANS', plans)
        },
        add() {
            this.newPlan = {
                interval: '',
                name: '',
                price: '0',
                description: '',
                visible: true,
            }
            // hide validation message
            this.isOpen = true
            this.resetValidation()
        },
        edit(index) {
            this.newPlan = { ...this.items[index] }
            // hide validation message
            this.isOpen = true
            this.resetValidation()
        },
        toggleVisible(plan) {
            plan.visible = !plan.visible
            this.updateCMSPlan(plan)
                .then(() => {
                    this.sending = false
                })
                .catch(this._handleError)
        },
        submit() {
            if (!this.$refs.form.validate()) return Promise.resolve(false)
            if (this.newPlan.id) {
                this.sending = true
                this.updateCMSPlan(this.newPlan)
                    .then(() => {
                        this.sending = false
                    })
                    .catch(this._handleError)
            } else {
                this.sending = true
                this.createCMSPlan(this.newPlan)
                    .then(() => {
                        this.sending = false
                    })
                    .catch(this._handleError)
            }
            this.isOpen = false
        },
        remove(index) {
            const plan = this.plans[index]
            this.sending = true
            this.deleteCMSPlan(plan.id)
                .then(() => {
                    this.sending = false
                })
                .catch(this._handleError)
        },
    },
}
</script>

<template>
    <v-layout row wrap align-start justify-center v-if="project">
        <v-flex sm12 md8 lg7 class="py-3">
            <div class="pb-3">
                <v-layout row wrap class="headline text-capitalize">
                    <v-flex grow> {{ 'plans' | translate }} </v-flex>
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
                        <v-btn color="primary" @click="add" class="mr-0" :disabled="sending">
                            {{ 'add plan' | translate }}
                        </v-btn>
                    </v-flex>
                </v-layout>
                <v-divider />
            </div>

            <v-data-table
                v-if="plans"
                :headers="headers"
                :items="items"
                :loading="sending"
                hide-actions
                disable-initial-sort
                expand
                class="elevation-1 mb-3"
            >
                <template slot="items" slot-scope="props">
                    <tr
                        @click="props.expanded = !props.expanded"
                        :class="{ 'icons-black': !$root.dark }"
                    >
                        <td>
                            <v-switch
                                v-model="props.item.visible"
                                class="mt-1"
                                style="margin-bottom: -12px"
                                @click.stop="toggleVisible(props.item)"
                            ></v-switch>
                        </td>
                        <td>{{ props.item.name }}</td>
                        <td class="text-xs-right">
                            <span v-if="props.item.price != 0">{{ props.item.price }}</span>
                            <span v-else class="text-uppercase accent--text">
                                {{ 'free' | translate }}
                            </span>
                        </td>
                        <td>{{ props.item.interval }}</td>
                        <td class="text-xs-right">
                            <v-icon small class="mr-2" @click.stop="up(props.index)">
                                keyboard_arrow_up
                            </v-icon>
                            <v-icon small @click.stop="down(props.index)">
                                keyboard_arrow_down
                            </v-icon>
                        </td>
                        <td class="text-xs-right">
                            <v-icon small class="mr-2" @click.stop="edit(props.index)">
                                edit
                            </v-icon>
                            <v-icon small @click.stop="remove(props.index)"> delete </v-icon>
                        </td>
                    </tr>
                </template>
                <template slot="expand" slot-scope="props">
                    <v-card flat>
                        <v-card-text>{{ props.item.description }}</v-card-text>
                    </v-card>
                </template>
                <template slot="no-data" class="text-center">
                    <div class="text-center">{{ 'no data' | translate }}</div>
                </template>
            </v-data-table>

            <k-dialog v-model="isOpen" persistent max-width="500px">
                <v-form @submit.prevent="submit" v-model="valid" ref="form" lazy-validation>
                    <v-card>
                        <v-card-title>
                            <span class="headline">
                                <span v-if="newPlan.id">{{ 'Edit plan' | translate }} </span>
                                <span v-else>{{ 'Add plan' | translate }} </span>
                            </span>
                            <v-spacer></v-spacer>
                            <span
                                v-if="newPlan.id && newPlan.price == 0"
                                class="text-uppercase accent--text"
                            >
                                {{ 'free' | translate }}
                            </span>
                        </v-card-title>
                        <v-card-text class="pt-0">
                            <v-container class="pa-0" grid-list-lg>
                                <v-layout wrap>
                                    <v-flex xs12>
                                        <v-text-field
                                            v-model="newPlan.name"
                                            :rules="rules.name"
                                            :label="'plan name' | translate"
                                            class="text-capitalize"
                                            prepend-icon="title"
                                            autofocus
                                        />
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-textarea
                                            v-model="newPlan.description"
                                            :rules="rules.description"
                                            :label="'plan description' | translate"
                                            class="text-capitalize"
                                            prepend-icon="title"
                                        />
                                    </v-flex>
                                    <v-flex xs12 sm6>
                                        <v-text-field
                                            v-model="newPlan.price"
                                            :rules="rules.price"
                                            min="0"
                                            :step="step"
                                            type="number"
                                            class="text-capitalize"
                                            :label="'price per unit' | translate"
                                            :prepend-icon="currency"
                                        />
                                    </v-flex>

                                    <v-flex xs12 sm6>
                                        <v-select
                                            class="text-capitalize"
                                            :label="'interval' | translate"
                                            v-model="newPlan.interval"
                                            :rules="rules.interval"
                                            :items="intervalOptions"
                                            prepend-icon="event"
                                            clearable
                                        />
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card-text>
                        <v-card-actions class="pt-0 px-3 pb-3">
                            <v-spacer></v-spacer>
                            <v-btn flat @click.native="isOpen = false">{{
                                'close' | translate
                            }}</v-btn>
                            <v-btn color="primary" type="submit" dark>
                                <span v-if="newPlan.id">{{ 'update' | translate }} </span>
                                <span v-else>{{ 'create' | translate }} </span>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-form>
            </k-dialog>
        </v-flex>
    </v-layout>
</template>

<style lang="scss">
.icons-black {
    .v-icon {
        color: #000;
    }
}
</style>
