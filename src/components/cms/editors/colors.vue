<script>
import ColorPicker from '@/components/cms/editors/colorPicker'

export default {
    components: {
        ColorPicker,
    },
    props: ['colors'],
}
</script>

<template>
    <v-layout row wrap>
        <v-flex xs12>
            <color-picker v-model="colors.brand" :label="'Brand' | translate" />
        </v-flex>
        <v-flex xs12>
            <color-picker v-model="colors.colorBg" :label="'Background' | translate" />
        </v-flex>
        <v-flex xs12>
            <color-picker v-model="colors.text" :label="'Body text' | translate" />
        </v-flex>
        <v-flex xs12>
            <color-picker v-model="colors.links" :label="'Links' | translate" />
        </v-flex>
        <v-flex xs12>
            <color-picker v-model="colors.headerBrand" :label="'Header brand text' | translate" />
        </v-flex>
        <v-flex xs12>
            <color-picker v-model="colors.headerLinks" :label="'Header menu text' | translate" />
        </v-flex>
        <v-flex xs12>
            <color-picker v-model="colors.buttonColorBg" :label="'Button background' | translate" />
        </v-flex>
        <v-flex xs12>
            <color-picker v-model="colors.buttonColorText" :label="'Button labels' | translate" />
        </v-flex>
    </v-layout>
</template>

<style lang="scss" scoped></style>
