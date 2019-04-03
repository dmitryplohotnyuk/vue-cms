<script>
import ListMixin from '@/components/cms/editors/listMixin'
import HeroEditor from '@/components/cms/editors/hero'

export default {
    mixins: [ListMixin],
    components: {
        HeroEditor,
    },
    props: ['block'],
    computed: {
        items() {
            return this.block.settings.items
        },
    },
    methods: {
        add() {
            this.block.settings.items.push({
                enabled: true,
                settings: {
                    backgroundImage: '',
                    heading: 'Image slide',
                    text: 'Slide text with explanation',
                    buttonLabel: '',
                    buttonLink: '',
                },
            })
        },
    },
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
                </v-layout>
            </v-card-text>
        </v-card>
        <v-expansion-panel class="mb-3">
            <v-expansion-panel-content v-for="(item, index) in items" :key="index">
                <div slot="header">
                    <v-layout row align-center>
                        <v-flex shrink>
                            <v-layout column>
                                <v-icon @click.stop="up(index)">
                                    keyboard_arrow_up
                                </v-icon>
                                <v-icon @click.stop="down(index)">
                                    keyboard_arrow_down
                                </v-icon>
                            </v-layout>
                        </v-flex>
                        <v-flex grow>
                            {{ item.settings.heading }}
                        </v-flex>
                        <v-flex shrink>
                            <v-img
                                :src="item.settings.backgroundImage"
                                height="40"
                                width="40"
                                class="mr-3"
                            ></v-img>
                        </v-flex>
                    </v-layout>
                </div>
                <hero-editor :block="item" compact />
                <div class="px-3 pb-3">
                    <v-btn @click="remove(index)" flat small class="ma-0">
                        <v-icon left>delete</v-icon> {{ 'remove image slide' | translate }}
                    </v-btn>
                </div>
            </v-expansion-panel-content>
        </v-expansion-panel>
        <div class="text-xs-center mb-3">
            <v-btn @click="add" color="primary" dark>
                {{ 'add image slide' | translate }} <v-icon right>add_box</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
