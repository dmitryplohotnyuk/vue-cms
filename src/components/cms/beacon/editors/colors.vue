<script>
import ColorPicker from '@/components/cms/editors/colorPicker'

export default {
    components: {
        ColorPicker,
    },
    props: ['block'],
}
</script>

<template>
    <v-layout v-if="block" row wrap>
        <v-flex xs12>
            <color-picker
                v-model="block.settings.background_color"
                :label="'Background color' | translate"
            />
        </v-flex>
        <v-flex xs12>
            <color-picker
                v-model="block.settings.primary_color"
                :label="'Primary color' | translate"
            />
        </v-flex>
    </v-layout>
</template>

<style lang="scss" scoped></style>
