<script>
import appConfig from '@/app.config'
import ProductList from '@/components/product/list'
import ProductDetails from '@/components/product/details'
import PlanDetails from '@/components/product/plan/details'

export default {
    components: { ProductList, ProductDetails, PlanDetails },
    props: {
        id: {
            type: String,
        },
        plan: {
            type: String,
        },
    },
    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },
    data() {
        return {
            metaJA: {
                title: 'プロダクトマネージャー',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Product Manager',
                meta: [{ name: 'description', content: appConfig.description }],
            },
        }
    },
}
</script>

<template>
    <Layout>
        <div transition="fadeIn" class="pa-0">
            <div>
                <product-list v-if="!id" />
                <product-details v-else-if="id && !plan" :id="id" />
                <plan-details v-else-if="id && plan" :product="id" :id="plan" />
            </div>
        </div>
    </Layout>
</template>
