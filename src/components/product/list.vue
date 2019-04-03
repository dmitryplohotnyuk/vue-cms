<script>
import { mapState, mapActions } from 'vuex'
import ProductForm from '@/components/product/form'
import Uploader from '@/components/uploader'
import { getAccessToken } from '@/auth'
import { baseURL } from '@/api'

export default {
    components: {
        ProductForm,
        Uploader,
    },
    data() {
        return {
            showCreate: false,
            showSaved: false,
            showImportProducts: false,
            showImportPlans: false,
            showSuccess: false,
        }
    },
    computed: {
        ...mapState({
            products: state => state.products.list,
        }),
        headers() {
            return [
                {
                    text: this.$t('name'),
                    value: 'name',
                    class: 'text-capitalize',
                },
                {
                    text: this.$t('type'),
                    value: 'type',
                    class: 'text-capitalize',
                },
                {
                    text: this.$t('system'),
                    value: 'payment_type',
                    class: 'text-capitalize',
                },
                {
                    text: 'ID',
                    value: 'payment_id',
                    sortable: false,
                },
                {
                    text: this.$t('plans'),
                    value: 'plans',
                    class: 'text-capitalize',
                },
                {
                    text: ' ' + this.$t('created at'), // space prepending fixes wrong text-capitalize
                    value: 'created',
                    align: 'right',
                    class: 'text-capitalize',
                },
            ]
        },

        auth_headers() {
            return { 'X-Auth-Token': getAccessToken() }
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
                    await this.$store.dispatch('getProducts')
                } catch (e) {
                    this.handleError(e)
                } finally {
                    this.finishLoading()
                }
            }).flow('drop'),
        }
    },
    methods: {
        ...mapActions(['resetError', 'handleError', 'startLoading', 'finishLoading']),
        onSaved() {
            this.showSaved = true
            this.showCreate = false
        },
        getUploadURL(type) {
            return baseURL + `/${type}/import`
        },

        onSuccess() {
            this.showSuccess = true
            this.showImportProducts = false
            this.showImportPlans = false
            this.load.run()
        },
        handleError(file, message) {
            if (!message.errors || !message.errors.message) return ''
            return message.errors.message
        },
    },
}
</script>

<template>
    <v-layout row wrap>
        <v-flex xs12>
            <v-toolbar
                :class="{ 'blue-grey lighten-5': !$root.dark }"
                class="mb-0 v-toolbar__content--nopadding px-3"
                flat
            >
                <v-toolbar-title class="text-capitalize">
                    {{ 'products' | translate }}
                </v-toolbar-title>
                <v-spacer />
                <v-menu :dark="$root.dark" lazy nudge-left="250" offset-x offset-y>
                    <v-btn icon dense flat ripple slot="activator" class="primary my-0 ml-0">
                        <v-icon>file_upload</v-icon>
                    </v-btn>
                    <v-card>
                        <v-list>
                            <!-- TODO: make whole tile to be clickable -->
                            <v-list-tile>
                                <v-list-tile-content>
                                    <v-list-tile-title class="text-capitalize">
                                        {{ 'import products' | translate }}
                                    </v-list-tile-title>
                                </v-list-tile-content>
                                <v-list-tile-action>
                                    <k-dialog lazy max-width="600" v-model="showImportProducts">
                                        <v-btn slot="activator" dense icon flat>
                                            <v-icon>file_upload</v-icon>
                                        </v-btn>
                                        <v-card class="pa-0" v-if="showImportProducts">
                                            <v-card-title class="headline text-capitalize">
                                                {{ 'import products' | translate }}
                                                <v-spacer />
                                                <v-btn
                                                    flat
                                                    small
                                                    icon
                                                    @click="showImportProducts = false"
                                                    class="ma-0"
                                                >
                                                    <v-icon>close</v-icon>
                                                </v-btn>
                                            </v-card-title>
                                            <v-card-text class="text-md-center pt-0 px-3 pb-3">
                                                <p
                                                    class="px-0 darkgrey--text"
                                                    v-translate="{
                                                        replace: {
                                                            sample: $t('a sample CSV template'),
                                                        },
                                                        key:
                                                            'Drag and drop or browse to upload your CSV file. Download |{sample}| to see an example of the format required.',
                                                    }"
                                                >
                                                    <span />
                                                    <a target="_blank" href="/products.zip"></a>
                                                    <span />
                                                </p>
                                                <uploader
                                                    :url="getUploadURL('products')"
                                                    :headers="auth_headers"
                                                    :handleError="handleError"
                                                    acceptedFiles=".csv,.zip,.gz"
                                                    @fileUploaded="onSuccess"
                                                >
                                                    <v-icon xLarge class="accent--text"
                                                        >inbox</v-icon
                                                    >
                                                    <p>{{ 'Browse' | translate }}</p>
                                                    <p>
                                                        {{
                                                            'Upload .csv, .zip and .gz files up to 10mb'
                                                                | translate
                                                        }}
                                                    </p>
                                                </uploader>
                                            </v-card-text>
                                        </v-card>
                                    </k-dialog>
                                </v-list-tile-action>
                            </v-list-tile>
                            <v-list-tile>
                                <v-list-tile-content>
                                    <v-list-tile-title class="text-capitalize">
                                        {{ 'import plans' | translate }}
                                    </v-list-tile-title>
                                </v-list-tile-content>
                                <v-list-tile-action>
                                    <k-dialog lazy max-width="600" v-model="showImportPlans">
                                        <v-btn slot="activator" dense icon flat>
                                            <v-icon>file_upload</v-icon>
                                        </v-btn>
                                        <v-card class="pa-0" v-if="showImportPlans">
                                            <v-card-title class="headline text-capitalize">
                                                {{ 'import plans' | translate }}
                                                <v-spacer />
                                                <v-btn
                                                    flat
                                                    small
                                                    icon
                                                    @click="showImportPlans = false"
                                                    class="ma-0"
                                                >
                                                    <v-icon>close</v-icon>
                                                </v-btn>
                                            </v-card-title>
                                            <v-card-text class="text-md-center pt-0 px-3 pb-3">
                                                <p
                                                    class="px-0 darkgrey--text"
                                                    v-translate="{
                                                        replace: {
                                                            sample: $t('a sample CSV template'),
                                                        },
                                                        key:
                                                            'Drag and drop or browse to upload your CSV file. Download |{sample}| to see an example of the format required.',
                                                    }"
                                                >
                                                    <span />
                                                    <a target="_blank" href="/plans.zip"></a>
                                                    <span />
                                                </p>
                                                <uploader
                                                    :url="getUploadURL('plans')"
                                                    :headers="auth_headers"
                                                    :handleError="handleError"
                                                    acceptedFiles=".csv,.zip,.gz"
                                                    @fileUploaded="onSuccess"
                                                >
                                                    <v-icon xLarge class="accent--text"
                                                        >inbox</v-icon
                                                    >
                                                    <p>{{ 'Browse' | translate }}</p>
                                                    <p>
                                                        {{
                                                            'Upload .csv, .zip and .gz files up to 10mb'
                                                                | translate
                                                        }}
                                                    </p>
                                                </uploader>
                                            </v-card-text>
                                        </v-card>
                                    </k-dialog>
                                </v-list-tile-action>
                            </v-list-tile>
                        </v-list>
                    </v-card>
                </v-menu>
                <k-dialog lazy persistent v-model="showCreate" width="600">
                    <v-btn icon dense flat slot="activator" class="primary ma-0">
                        <v-icon>add</v-icon>
                    </v-btn>
                    <product-form v-if="showCreate" @saved="onSaved" @close="showCreate = false" />
                </k-dialog>
            </v-toolbar>
        </v-flex>

        <v-layout row wrap align-start justify-center v-if="load.lastResolved">
            <v-flex xs12 md10 lg8 class="pa-3">
                <v-data-table
                    :headers="headers"
                    :items="products"
                    :loading="load.isActive"
                    hide-actions
                    class="elevation-1 mb-3"
                >
                    <template slot="items" slot-scope="props">
                        <tr
                            class="pointer"
                            @click="
                                $router.push({
                                    name: 'products',
                                    params: {
                                        id: props.item.id,
                                    },
                                })
                            "
                        >
                            <td>
                                <router-link
                                    :to="{
                                        name: 'products',
                                        params: {
                                            id: props.item.id,
                                        },
                                    }"
                                    >{{ props.item.name }}</router-link
                                >
                            </td>
                            <td>{{ props.item.type }}</td>
                            <td>{{ props.item.payment_type }}</td>
                            <td>{{ props.item.payment_id }}</td>
                            <td>{{ props.item.plans.length }}</td>
                            <td class="text-xs-right">
                                {{ props.item.created_at | format('YYYY/MM/DD HH:mm') }}
                            </td>
                        </tr>
                    </template>
                    <template slot="no-data" class="text-center">
                        <div class="text-center">{{ 'no data' | translate }}</div>
                    </template>
                </v-data-table>
            </v-flex>

            <v-snackbar v-model="showSaved" bottom>
                {{ 'Product saved successfully!' | translate }}
            </v-snackbar>
            <v-snackbar v-model="showSuccess" bottom>
                {{ 'File uploaded successfully!' | translate }}
            </v-snackbar>
        </v-layout>
    </v-layout>
</template>
