<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
    computed: {
        planClass: function() {
            switch (this.block.settings.columns) {
                case 4:
                    return 'col-3 col-sm-6 col-xs-12'
                case 3:
                    return 'col-4 col-sm-6 col-xs-12'
                default:
                    return 'col-6 col-xs-12'
            }
        },
    },
    methods: {
        planInterval: function(plan) {
            switch (plan.interval) {
                case 'month':
                    return '月'
                case 'year':
                    return '年'
            }
        },
    },
}
</script>

<template>
    <div class="py-5 grid-lg" v-if="block && block.enabled && block.settings">
        <div class="container my-5">
            <h2 class="text-center mb-4">{{ block.settings.heading }}</h2>
            <div class="columns" v-if="landing.data.plans">
                <div
                    class="column"
                    :class="planClass"
                    v-for="(plan, index) in landing.data.plans"
                    v-if="plan.visible"
                    :key="plan.id"
                >
                    <div
                        class="card mb-3"
                        :style="
                            buildStyle(block.settings.individualSettings[index], {
                                'background-color': 'colorBg',
                                color: 'color',
                            })
                        "
                    >
                        <div
                            class="card-header"
                            :class="[
                                {
                                    'text-center': block.settings.headerAlign == 'center',
                                    'text-right': block.settings.headerAlign == 'right',
                                },
                                'plan-header--' + block.settings.headerSize,
                            ]"
                            :style="
                                buildStyle(block.settings.individualSettings[index], {
                                    'background-color': 'headerColorBg',
                                    color: 'headerColor',
                                })
                            "
                        >
                            <div class="card-title">{{ plan.name }}</div>
                        </div>
                        <div
                            class="card-body py-4"
                            :class="[
                                {
                                    'text-center': block.settings.textAlign == 'center',
                                    'text-right': block.settings.textAlign == 'right',
                                },
                                'plan-text--' + block.settings.textSize,
                            ]"
                        >
                            <p class="card-subtitle mb-4 muted">
                                <span v-if="!!plan.price && plan.price != 0">
                                    {{ plan.price }} 円／ {{ planInterval(plan) }}
                                </span>
                                <span v-else>
                                    無料
                                </span>
                            </p>
                            <p class="card-text">
                                {{ plan.description }}
                            </p>
                            <a
                                href="#"
                                class="btn mt-4"
                                :style="
                                    buildStyle(block.settings.individualSettings[index], {
                                        'background-color': 'buttonColorBg',
                                        'border-color': 'buttonColorBg',
                                    })
                                "
                            >
                                {{ block.settings.buttonLabel }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
