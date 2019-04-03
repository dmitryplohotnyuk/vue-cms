<script>
import { mapState } from 'vuex'

import ProductPlans from '@/components/cms/beacon/editors/productPlans'

export default {
    components: {
        ProductPlans,
    },
    props: ['beacon'],
    data() {
        return {
            // whether show all other project or limited amount only
            otherProductsExpanded: false,
            otherProductsMax: 3,
        }
    },
    computed: {
        ...mapState({
            products: state => state.products.list,
            project: state => state.projects.current,
        }),
        connectedProducts() {
            return (this.products || []).filter(
                product =>
                    product.plans &&
                    product.plans.length &&
                    product.projects.some(project => project.id == this.project.id)
            )
        },
        allOtherProducts() {
            return (this.products || []).filter(
                product =>
                    product.plans &&
                    product.plans.length &&
                    !this.connectedProducts.includes(product)
            )
        },
        otherProducts() {
            return this.otherProductsExpanded
                ? this.allOtherProducts
                : this.allOtherProducts.slice(0, this.otherProductsMax)
        },
    },
    methods: {
        isPlanSelected(planId) {
            const { plans } = this.beacon
            return Array.isArray(plans) && plans.some(o => o.id == planId)
        },
        togglePlan(planId) {
            if (!Array.isArray(this.beacon.plans)) {
                this.$set(this.beacon, 'plans', [])
            }
            const { plans } = this.beacon
            const index = plans.findIndex(p => p.id == planId)
            if (index !== -1) {
                plans.splice(index, 1)
            } else {
                plans.push({ id: planId })
            }
        },
        toggleProduct(product, checked) {
            product.plans.forEach(p => {
                if (
                    (checked && !this.isPlanSelected(p.id)) ||
                    (!checked && this.isPlanSelected(p.id))
                ) {
                    this.togglePlan(p.id)
                }
            })
        },
    },
}
</script>

<template>
    <div v-if="beacon">
        <v-alert v-if="!(products && products.length)" :value="true" type="info">
            <div v-if="$root.lang == 'en'">
                To display Plans on a popup window you need to create them in the
                <router-link to="/products">Products</router-link> first.
            </div>
            <div v-else>
                プランをポップアップウィンドウに表示するには、事前にプロダクトマネージャーで管理する<router-link
                    to="/products"
                    >プロダクト</router-link
                >にプランを紐付けする必要があります。
            </div>
        </v-alert>
        <div v-else>
            <div class="mb-2">
                <h6 class="body-2">{{ 'Product linked to the Project' | translate }}</h6>
                <div style="margin: 0 -16px;">
                    <product-plans
                        v-for="product in connectedProducts"
                        :key="product.id"
                        :product="product"
                        :beacon="beacon"
                        @toggleProduct="toggleProduct"
                        @togglePlan="togglePlan"
                    />
                </div>
            </div>
            <div v-if="otherProducts && otherProducts.length">
                <h6 class="body-2 text-capitalize">{{ 'other products' | translate }}</h6>
                <div style="margin: 0 -16px;">
                    <product-plans
                        v-for="product in otherProducts"
                        :key="product.id"
                        :product="product"
                        :beacon="beacon"
                        @toggleProduct="toggleProduct"
                        @togglePlan="togglePlan"
                    />
                </div>
                <div class="text-right">
                    <v-btn
                        flat
                        small
                        v-if="allOtherProducts.length > otherProductsMax"
                        @click="otherProductsExpanded = !otherProductsExpanded"
                    >
                        {{ 'show more' | translate }}
                        <v-icon right v-if="otherProductsExpanded">keyboard_arrow_up</v-icon>
                        <v-icon right v-else>keyboard_arrow_down</v-icon>
                    </v-btn>
                </div>
            </div>
        </div>

        <v-layout row wrap>
            <!-- <v-flex xs12>
                <v-text-field
                    v-model="beacon.settings.subscribe_text"
                    :label="'Subscribe button text' | translate"
                />
            </v-flex> -->
            <v-flex xs12>
                <v-switch
                    class="ma-0"
                    :label="'Large modal' | translate"
                    v-model="beacon.settings.modal_lg"
                />
            </v-flex>
        </v-layout>
    </div>
</template>

<style lang="scss" scoped></style>
