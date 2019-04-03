<script>
import { mapState, mapActions } from 'vuex'
import ProductForm from '@/components/product/form'
import PlanForm from '@/components/product/plan/form'
import KConfirm from '@/components/confirm'

export default {
    components: {
        ProductForm,
        PlanForm,
        KConfirm,
    },
    props: ['id'],
    data() {
        return {
            product: null,
            projectId: null,
            showProductForm: false,
            showPlanForm: false,
            showSaved: false,
            showPlanSaved: false,
            // plan that is being edited now
            plan: null,
            projectDialog: false,
            rules: {
                project: [v => !!v || this.$t('Required Field')],
            },
            currencyMap: {
                usd: '＄',
                jpy: '￥',
                eur: '€',
            },
        }
    },
    computed: {
        ...mapState({
            projects: state => state.projects.list,
            products: state => state.products.list,
        }),
        projectsHeaders() {
            return [
                {
                    text: this.$t('title'),
                    value: 'title',
                    class: 'text-capitalize',
                },
                {
                    text: ' ' + this.$t('created at'), // space prepending fixes wrong text-capitalize
                    value: 'created_at',
                    align: 'right',
                    class: 'text-capitalize',
                },
                {
                    text: this.$t('actions'),
                    value: '',
                    align: 'right',
                    class: 'text-capitalize',
                    sortable: false,
                },
            ]
        },
        plansHeaders() {
            return [
                {
                    text: this.$t('title'),
                    value: 'name',
                    class: 'text-capitalize',
                },
                {
                    text: this.$t('price'),
                    value: '',
                    class: 'text-capitalize',
                },
                {
                    text: this.$t('provider'),
                    value: 'payment_id',
                    class: 'text-capitalize',
                    sortable: false,
                },
                {
                    text: ' ' + this.$t('created at'), // space prepending fixes wrong text-capitalize
                    value: 'created',
                    align: 'right',
                    class: 'text-capitalize',
                },
                {
                    text: this.$t('actions'),
                    value: '',
                    align: 'right',
                    class: 'text-capitalize',
                    sortable: false,
                },
            ]
        },
        plans() {
            return this.product.plans
        },
    },
    watch: {
        showPlanForm(value) {
            if (!value) {
                this.plan = null
            }
        },
    },
    mounted() {
        this.load.run()
    },
    tasks(t) {
        return {
            load: t(async function() {
                try {
                    this.startLoading()
                    this.product = await this.getProduct(this.id)
                } catch (e) {
                    this.handleError(e)
                } finally {
                    this.finishLoading()
                }
            }).flow('drop'),
            addProject: t(async function() {
                if (!this.$refs.projectForm.validate()) return Promise.resolve(false)
                try {
                    await this.productAddProject({ product: this.product, id: this.projectId })
                    this.projectDialog = false
                    this.load.run()
                } catch (e) {
                    this.handleError(e)
                }
            }).flow('drop'),
            remove: t(async function() {
                await this.deleteProduct(this.id)
                    .catch(this.handleError)
                    .then(() => {
                        this.$router.push('/products')
                    })
            }).flow('drop'),
            removePlan: t(async function(id) {
                try {
                    await this.deletePlan(id)
                    this.load.run()
                } catch (e) {
                    this.handleError(e)
                }
            }).flow('drop'),
            removeProject: t(async function(id) {
                try {
                    await this.productRemoveProject({ product: this.product, id })
                    this.load.run()
                } catch (e) {
                    this.handleError(e)
                }
            }).flow('drop'),
        }
    },
    methods: {
        ...mapActions([
            'resetError',
            'handleError',
            'startLoading',
            'finishLoading',
            'getProduct',
            'deleteProduct',
            'deletePlan',
            'productAddProject',
            'productRemoveProject',
        ]),
        onProductSaved() {
            this.showSaved = true
            this.showProductForm = false
            this.load.run()
        },
        onPlanSaved() {
            this.showPlanSaved = true
            this.showPlanForm = false
            this.load.run()
        },
        editPlan(plan) {
            this.showPlanForm = true
            this.plan = plan
        },
        currency(code) {
            return this.currencyMap[code]
        },
    },
}
</script>
<template>
    <div v-if="load.lastResolved">
        <v-layout row wrap>
            <v-flex xs12 md12>
                <v-toolbar
                    :class="{ 'blue-grey lighten-5': !$root.dark }"
                    class="mb-0 v-toolbar__content--nopadding px-3"
                    flat
                >
                    <v-tooltip max-width="300" bottom>
                        <v-btn
                            icon
                            slot="activator"
                            :to="{
                                name: 'products',
                            }"
                        >
                            <v-icon>arrow_back</v-icon>
                        </v-btn>
                        <span class="text-capitalize">{{ 'products' | translate }}</span>
                    </v-tooltip>
                    <v-toolbar-title class="text-capitalize">
                        {{ 'product details' | translate }}
                    </v-toolbar-title>
                    <v-spacer />
                </v-toolbar>
            </v-flex>
        </v-layout>
        <v-container grid-list-lg fill-height fluid class="pa-3">
            <v-layout row wrap>
                <v-flex xs12 sm12 md4>
                    <v-toolbar color="indigo" dark>
                        <v-toolbar-title>
                            <span v-if="product.name" class="title text-capitalize">
                                {{ product.name }}
                            </span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-tooltip max-width="300" open-delay="500" bottom>
                            <v-btn icon @click="showProductForm = true" slot="activator">
                                <v-icon>edit</v-icon>
                            </v-btn>
                            <span class="text-capitalize">
                                {{ 'update record details' | translate }}
                            </span>
                        </v-tooltip>
                    </v-toolbar>
                    <v-card>
                        <v-card-text class="pa-0">
                            <v-list two-line dense class="py-0">
                                <v-list-tile v-if="product.id">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            ID
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>{{ product.id }}</v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="product.id" />
                                <v-list-tile v-if="product.created_at">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'created at' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ product.created_at }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="product.created_at" />
                                <v-list-tile v-if="product.unit_label">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'unit label' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ product.unit_label }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="product.unit_label" />
                                <v-list-tile v-if="product.statement_descriptor">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'statement descriptor' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            {{ product.statement_descriptor }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-divider v-if="product.statement_descriptor" />
                                <v-list-tile v-if="product.payment_id">
                                    <v-list-tile-content>
                                        <v-list-tile-sub-title class="grey--text text-capitalize">
                                            {{ 'payment system' | translate }}
                                        </v-list-tile-sub-title>
                                        <v-list-tile-title>
                                            <h4 class="my-0 text-capitalize">
                                                {{ product.payment_type }}
                                            </h4>
                                            : {{ product.payment_id }}
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </v-list>
                        </v-card-text>
                        <v-card-actions class="grey lighten-5 pa-3">
                            <k-confirm
                                title="Delete this record?"
                                question="Are you sure?"
                                :max-width="600"
                                @confirm="remove.run()"
                            >
                                <v-btn
                                    flat
                                    icon
                                    small
                                    slot="button"
                                    color="danger"
                                    class="ma-0"
                                    :loading="remove.isActive"
                                    :disabled="remove.isActive"
                                >
                                    <v-icon>delete</v-icon>
                                </v-btn>
                            </k-confirm>
                            <v-spacer />
                            <p class="text-xs-right my-0">
                                {{
                                    'no plans|1 plan|{count} plans'
                                        | translate({ count: plans.length })
                                }}
                                |
                                {{
                                    'no projects|1 project|{count} projects'
                                        | translate({
                                            count: product.projects.length,
                                        })
                                }}
                            </p>
                        </v-card-actions>
                    </v-card>
                </v-flex>
                <v-flex xs12 sm12 md8>
                    <v-card>
                        <v-card-title class="title text-capitalize">
                            {{ 'plans' | translate }}
                            <v-spacer />
                            <v-btn
                                flat
                                icon
                                small
                                outline
                                class="ma-0"
                                @click="showPlanForm = true"
                            >
                                <v-icon>add</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-data-table :headers="plansHeaders" :items="plans" hide-actions>
                            <template slot="items" slot-scope="props">
                                <tr>
                                    <td
                                        class="pointer"
                                        @click="
                                            $router.push({
                                                name: 'products',
                                                params: {
                                                    id: product.id,
                                                    plan: props.item.id,
                                                },
                                            })
                                        "
                                    >
                                        <router-link
                                            :to="{
                                                name: 'products',
                                                params: {
                                                    id: product.id,
                                                    plan: props.item.id,
                                                },
                                            }"
                                            >{{ props.item.name }}</router-link
                                        >
                                    </td>
                                    <td>
                                        {{ currency(props.item.currency) }}{{ props.item.amount }}
                                        <span class="text-uppercase">
                                            {{ props.item.currency }}
                                        </span>
                                        /
                                        <span v-if="props.item.interval_count > 1">
                                            {{ props.item.interval_count }}
                                        </span>
                                        {{ props.item.interval }}
                                    </td>
                                    <td>
                                        <span v-if="props.item.payment_id">
                                            <strong>{{ props.item.payment_type }}</strong
                                            >:{{ props.item.payment_id }}
                                        </span>
                                        <span v-else class="font-italic font-weight-light">
                                            {{ 'none' | translate }}
                                        </span>
                                    </td>
                                    <td class="text-xs-right">
                                        {{ props.item.created_at | format('YYYY/MM/DD HH:mm') }}
                                    </td>
                                    <td class="text-xs-right">
                                        <v-btn
                                            icon
                                            small
                                            @click="editPlan(props.item)"
                                            class="my-0"
                                        >
                                            <v-icon>edit</v-icon>
                                        </v-btn>
                                        <k-confirm
                                            title="Delete this record?"
                                            question="Are you sure?"
                                            :max-width="600"
                                            @confirm="removePlan.run(props.item.id)"
                                        >
                                            <v-btn
                                                flat
                                                icon
                                                small
                                                slot="button"
                                                color="danger"
                                                class="my-0 mr-0"
                                                :loading="removePlan.isActive"
                                                :disabled="removePlan.isActive"
                                            >
                                                <v-icon>delete</v-icon>
                                            </v-btn>
                                        </k-confirm>
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
                    </v-card>

                    <v-card class="mt-3">
                        <v-card-title class="title text-capitalize">
                            {{ 'linked projects' | translate }}
                            <v-spacer />
                            <v-tooltip max-width="300" bottom>
                                <k-dialog
                                    v-model="projectDialog"
                                    max-width="500"
                                    lazy
                                    slot="activator"
                                >
                                    <v-btn flat icon small outline class="ma-0" slot="activator">
                                        <v-icon>add</v-icon>
                                    </v-btn>
                                    <v-form
                                        @submit.prevent="addProject.run"
                                        ref="projectForm"
                                        lazy-validation
                                    >
                                        <v-card class="pa-3">
                                            <v-card-title class="title text-capitalize pa-0">
                                                {{ 'link project' | translate }}
                                                <v-spacer />
                                                <v-btn
                                                    flat
                                                    small
                                                    icon
                                                    @click="projectDialog = false"
                                                    class="ma-0"
                                                >
                                                    <v-icon>close</v-icon>
                                                </v-btn>
                                            </v-card-title>
                                            <v-card-text class="pa-0 pt-2">
                                                <v-select
                                                    v-model="projectId"
                                                    :items="projects"
                                                    :disabled="addProject.isActive"
                                                    :label="'project' | translate"
                                                    item-text="title"
                                                    item-value="id"
                                                    :rules="rules.project"
                                                    required
                                                    class="text-capitalize"
                                                />
                                            </v-card-text>
                                            <v-card-actions class="pa-0">
                                                <v-spacer />
                                                <v-btn
                                                    type="submit"
                                                    color="primary"
                                                    :loading="addProject.isActive"
                                                    :disabled="addProject.isActive"
                                                >
                                                    {{ 'confirm' | translate }}
                                                </v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-form>
                                </k-dialog>
                                <span class="text-capitalize">
                                    {{ 'link project' | translate }}
                                </span>
                            </v-tooltip>
                        </v-card-title>
                        <v-data-table
                            :headers="projectsHeaders"
                            :items="product.projects"
                            hide-actions
                        >
                            <template slot="items" slot-scope="props">
                                <td>
                                    <router-link
                                        :to="{
                                            name: 'project',
                                            params: {
                                                id: props.item.id,
                                            },
                                        }"
                                        target="_blank"
                                    >
                                        {{ props.item.title }}
                                        <v-icon small>open_in_new</v-icon>
                                    </router-link>
                                </td>
                                <td class="text-xs-right">
                                    {{ props.item.created_at | format('YYYY/MM/DD HH:mm') }}
                                </td>
                                <td class="text-xs-right">
                                    <k-confirm
                                        title="Unlink this record?"
                                        question="Are you sure?"
                                        :max-width="600"
                                        @confirm="removeProject.run(props.item.id)"
                                    >
                                        <v-btn
                                            flat
                                            icon
                                            ripple
                                            small
                                            slot="button"
                                            color="danger"
                                            class="my-0 mr-0"
                                            :loading="removeProject.isActive"
                                            :disabled="removeProject.isActive"
                                        >
                                            <v-icon small>close</v-icon>
                                        </v-btn>
                                    </k-confirm>
                                </td>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-flex>
            </v-layout>

            <k-dialog v-model="showProductForm" persistent max-width="600px" lazy>
                <product-form
                    v-if="showProductForm"
                    :product="product"
                    @saved="onProductSaved"
                    @close="showProductForm = false"
                />
            </k-dialog>
            <k-dialog v-model="showPlanForm" persistent max-width="900px" lazy>
                <plan-form
                    :product="product"
                    :plan="plan"
                    @saved="onPlanSaved"
                    @close="showPlanForm = false"
                />
            </k-dialog>
            <v-snackbar v-model="showSaved" bottom>
                {{ 'Product saved successfully!' | translate }}
            </v-snackbar>
            <v-snackbar v-model="showPlanSaved" bottom>
                {{ 'Plan saved successfully!' | translate }}
            </v-snackbar>
        </v-container>
    </div>
</template>
