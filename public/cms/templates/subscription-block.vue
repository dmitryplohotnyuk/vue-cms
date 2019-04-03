<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
    data() {
        const plan =
            this.landing.data &&
            Array.isArray(this.landing.data.plans) &&
            this.landing.data.plans[1]
        return {
            planId: (plan && plan.id) || null,
            formData: {
                discountCode: null,
            },
            showWarning: true,
            translations: {
                'Confirm your plan': '計画を確認してください',
                month: '月',
                year: '年',
                free: '無料',
                choose: '選択',
                'Order Summary': '注文の概要',
                'Your subscriptions will automatically renew every month for the price below':
                    'あなたの購読は自動的に以下の価格で毎月更新されます',
                'Selected plan': '選択したプラン',
                Price: '料金',
                'Consumption tax': '消費税',
                Payment: '決済',
                'credit card': 'クレジットカード',
                'card reader': 'カードリーダー',
                cash: '現金',
                'Discount code': '割引コード',
                'Credit card number': 'クレジットカード番号',
                CVV: '暗証番号',
                Name: '名義',
                Discount: '割引金額',
                'Payment Total': '支払合計',
                Subscribe: '送信',
            },
        }
    },
    computed: {
        selectedPlan: function() {
            const planId = this.planId
            if (this.planId && this.landing.data && Array.isArray(this.landing.data.plans))
                return this.landing.data.plans.find(function(p) {
                    return p.id == planId
                })
        },
        discount: function() {
            return this.formData.discountCode ? 0.05 : 0
        },
        price: function() {
            return this.selectedPlan.price
        },
        priceWithTax: function() {
            return 1.08 * this.selectedPlan.price
        },
        discountPrice: function() {
            return Math.floor(this.discount * this.priceWithTax)
        },
    },
    methods: {
        translate: function(key) {
            const language = this.block.settings.language
            if (language == 'en') {
                return key
            }
            return this.translations[key]
        },
    },
}
</script>

<template>
    <div class="container grid-md">
        <div class="toast toast-warning my-1" v-if="showWarning">
            <button class="btn btn-clear float-right" v-on:click="showWarning = false"></button>
            <p>
                This page is read-only. <br />
                For plans that has 0 price (free) we will not display this page.
            </p>
        </div>
        <div class="columns">
            <div class="column col-sm-12 col-5 col-ml-auto">
                <div
                    class="divider text-center my-3"
                    :data-content="translate('Confirm your plan')"
                ></div>
                <div class="mb-2 px-2 bg-secondary clearfix">
                    <details
                        class="accordion"
                        v-for="(plan, index) in landing.data.plans"
                        v-if="plan.visible"
                        :key="index"
                        :open="plan.id == planId"
                    >
                        <summary class="accordion-header py-2 c-hand">
                            <i class="icon icon-arrow-right mr-1"></i>
                            {{ plan.name }}
                        </summary>
                        <div class="accordion-body">
                            <div class="card">
                                <div class="card-header">
                                    <div class="card-title h5">
                                        <span v-if="!!plan.price && plan.price != 0">
                                            ¥{{ plan.price }} ／ {{ translate(plan.interval) }}
                                        </span>
                                        <span v-else>
                                            {{ translate('free') }}
                                        </span>
                                    </div>
                                </div>
                                <div class="card-body">
                                    {{ plan.description }}
                                </div>
                                <div class="card-footer">
                                    <button
                                        class="btn btn-primary float-right text-capitalize"
                                        :disabled="plan.id == planId"
                                        v-on:click="planId = plan.id"
                                    >
                                        {{ translate('choose') }}
                                        <i class="icon icon-check"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
            <div class="column col-sm-12 col-7 col-mr-auto">
                <div class="divider text-center my-3" :data-content="translate('Order Summary')"></div>
                <div class="mb-4">
                    <div class="panel">
                        <div class="panel-body">
                            <div class="columns">
                                <div class="column col-sm-12 pt-2" v-if="selectedPlan">
                                    <small class="text-warning">
                                        {{
                                            translate(
                                                'Your subscriptions will automatically renew every month for the price below'
                                            )
                                        }}
                                    </small>
                                    <table class="table">
                                        <tbody>
                                            <tr>
                                                <td class="text-gray">
                                                    {{ translate('Selected plan') }}
                                                </td>
                                                <td id="selected-plan-name" class="text-right">
                                                    {{ selectedPlan.name }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="text-gray">
                                                    {{ translate('Price') }}
                                                </td>
                                                <td id="selected-plan-price" class="text-right">
                                                    <span v-if="!!price && price != 0">
                                                        ¥{{ price }}
                                                    </span>
                                                    <span v-else>
                                                        {{ translate('free') }}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="text-gray">
                                                    {{ translate('Consumption tax') }}
                                                    <span id="tax-rate">
                                                        8%
                                                    </span>
                                                </td>
                                                <td id="tax-calculated" class="text-right">
                                                    ¥{{ 0.08 * price }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" class="bg-gray p-2 text-right">
                                                    <span
                                                        id="total-calculated"
                                                        class="text-primary h5"
                                                    >
                                                        ¥ {{ priceWithTax }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div
                                class="divider text-center mt-4 mb-3"
                                :data-content="translate('Payment')"
                            ></div>
                            <div class="btn-group btn-group-block">
                                <button class="btn btn-sm" :class="{ active: true }">
                                    {{ translate('credit card') }}
                                </button>
                                <button class="btn btn-sm" :disabled="true">
                                    {{ translate('card reader') }}
                                </button>
                                <button class="btn btn-sm" :disabled="true">
                                    {{ translate('cash') }}
                                </button>
                            </div>
                            <br />
                            <div>
                                <form action="" v-on:submit.prevent="">
                                    <div class="columns">
                                        <div class="column col-sm-12 my-2">
                                            <div class="form-group bg-secondary">
                                                <label class="form-label px-2" for="discount">
                                                    {{ translate('Discount code') }}
                                                </label>
                                                <div class="p-2">
                                                    <input
                                                        v-model="formData.discountCode"
                                                        class="form-input"
                                                        type="text"
                                                        id="discount"
                                                        :placeholder="translate('Discount code')"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="columns">
                                        <div class="column col-sm-8 col-md-8 mb-2">
                                            <div class="form-group">
                                                <label class="form-label" for="credit-card-number">
                                                    {{ translate('Credit card number') }}
                                                </label>
                                                <input
                                                    class="form-input"
                                                    type="text"
                                                    id="credit-card-number"
                                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div class="column col-sm-4 col-md-4 mb-2">
                                            <div class="form-group">
                                                <label class="form-label" for="credit-card-code">
                                                    {{ translate('CVV') }}
                                                </label>
                                                <input
                                                    class="form-input"
                                                    type="text"
                                                    id="credit-card-code"
                                                    placeholder="000"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="columns">
                                        <div class="column col-sm-12 col-md-12 col-12 mb-2">
                                            <div class="form-group">
                                                <label class="form-label" for="credit-card-name">
                                                    {{ translate('Name') }}
                                                </label>
                                                <input
                                                    class="form-input"
                                                    type="text"
                                                    id="credit-card-name"
                                                    :placeholder="translate('Name')"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="columns">
                                        <div class="column col-sm-12 col-12 mb-1">
                                            <div class="bg-gray my-2 py-2 px-2 text-right">
                                                <div class="mb-3" v-if="discount">
                                                    <small class="text-error mr-2">
                                                        {{ translate('Discount') }}
                                                    </small>
                                                    <small
                                                        id="discount-calculated"
                                                        class="text-error"
                                                    >
                                                        - ¥
                                                        {{ discountPrice }}
                                                    </small>
                                                </div>
                                                <span class="text-primary mr-2">
                                                    {{ translate('Payment Total') }}
                                                </span>
                                                <span id="total-to-pay" class="text-primary h5">
                                                    ¥
                                                    {{ priceWithTax - discountPrice }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" class="mt-2 mb-3 btn btn-block">
                                        {{ translate('Subscribe') }}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
