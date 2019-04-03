<script>
export default {
    name: 'beacon-editor-product-plans',
    props: ['product', 'beacon'],
    data() {
        return {
            // activate if beacon has product's plans
            enabled: ((this.beacon && this.beacon.plans) || []).some(o =>
                this.product.plans.some(p => p.id == o.id)
            ),
        }
    },
    computed: {
        plans() {
            return this.enabled ? this.product.plans : null
        },
    },
    methods: {
        isPlanSelected(planId) {
            const { plans } = this.beacon
            return Array.isArray(plans) && plans.some(o => o.id == planId)
        },
    },
}
</script>

<template>
    <v-list class="py-0">
        <v-list-tile>
            <v-list-tile-action>
                <v-switch
                    v-model="enabled"
                    @change="v => $emit('toggleProduct', product, v)"
                    class="pt-1 mt-2"
                ></v-switch>
            </v-list-tile-action>
            <v-list-tile-content :class="{ disabled: !enabled, dark: $root.dark }">
                <v-list-tile-title>
                    {{ product.name }}
                </v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-for="plan in plans" :key="plan.title" @click="$emit('togglePlan', plan.id)">
            <v-list-tile-action>
                <v-checkbox
                    class="ml-3 pt-1 mt-2"
                    :input-value="isPlanSelected(plan.id)"
                ></v-checkbox>
            </v-list-tile-action>

            <v-list-tile-content>
                <v-list-tile-title>{{ plan.name }}</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>
    </v-list>
</template>

<style lang="scss" scoped>
.disabled {
    opacity: 0.5;
    &.dark {
        opacity: 0.38;
    }
}
</style>
