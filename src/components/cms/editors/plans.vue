<script>
import OptionsMixin from '@/components/cms/editors/optionsMixin'
import ColorPicker from '@/components/cms/editors/colorPicker'

export default {
    mixins: [OptionsMixin],
    components: {
        ColorPicker,
    },
    props: ['block', 'data'],
}
</script>

<template>
    <div v-if="block">
        <v-card flat>
            <v-card-text class="pb-0">
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-switch
                            class="ma-0"
                            :label="'Enabled' | translate"
                            v-model="block.enabled"
                        ></v-switch>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field
                            v-model="block.settings.heading"
                            :label="'Heading' | translate"
                        />
                    </v-flex>
                    <v-flex xs12>
                        <v-slider
                            v-model="block.settings.columns"
                            :label="'Items per row' | translate"
                            step="1"
                            min="2"
                            max="4"
                            thumb-label
                        ></v-slider>
                    </v-flex>
                    <v-flex xs12>
                        <v-select
                            :items="options.xAlignment"
                            v-model="block.settings.headerAlign"
                            :label="'Title alignment' | translate"
                            class="text-capitalize"
                            :menu-props="{ contentClass: 'text-capitalize' }"
                        ></v-select>
                    </v-flex>
                    <v-flex xs12>
                        <v-select
                            :items="options.sizes"
                            v-model="block.settings.headerSize"
                            :label="'Title size' | translate"
                            class="text-capitalize"
                            :menu-props="{ contentClass: 'text-capitalize' }"
                        ></v-select>
                    </v-flex>
                    <v-flex xs12>
                        <v-select
                            :items="options.xAlignment"
                            v-model="block.settings.textAlign"
                            :label="'Text alignment' | translate"
                            class="text-capitalize"
                            :menu-props="{ contentClass: 'text-capitalize' }"
                        ></v-select>
                    </v-flex>
                    <v-flex xs12>
                        <v-select
                            :items="options.sizes"
                            v-model="block.settings.textSize"
                            :label="'Font size' | translate"
                            class="text-capitalize"
                            :menu-props="{ contentClass: 'text-capitalize' }"
                        ></v-select>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field
                            v-model="block.settings.buttonLabel"
                            :label="'Button text' | translate"
                        />
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-subheader class="subheading">
            {{ 'Cards' | translate }}
        </v-subheader>
        <v-expansion-panel class="mb-3">
            <v-expansion-panel-content
                v-for="(setting, index) in block.settings.individualSettings"
                :key="index"
            >
                <div slot="header">{{ data[index].name }}</div>
                <v-card>
                    <v-card-text>
                        <v-layout row wrap>
                            <v-flex xs12>
                                <color-picker
                                    v-model="setting.colorBg"
                                    :label="'Card background' | translate"
                                />
                            </v-flex>
                            <v-flex xs12>
                                <color-picker
                                    v-model="setting.color"
                                    :label="'Card text' | translate"
                                />
                            </v-flex>
                            <v-flex xs12>
                                <color-picker
                                    v-model="setting.headerColorBg"
                                    :label="'Heading background' | translate"
                                />
                            </v-flex>
                            <v-flex xs12>
                                <color-picker
                                    v-model="setting.headerColor"
                                    :label="'Heading text' | translate"
                                />
                            </v-flex>
                            <v-flex xs12>
                                <color-picker
                                    v-model="setting.buttonColorBg"
                                    :label="'Button background' | translate"
                                />
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </div>
</template>

<style lang="scss" scoped></style>
