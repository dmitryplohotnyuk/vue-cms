<script>
import { Sketch } from 'vue-color'
export default {
    components: {
        Sketch,
    },
    props: ['value', 'label'],
    data() {
        return {
            showPicker: false,
        }
    },
    computed: {
        style() {
            const { value } = this
            return value ? `background-color: ${value}` : `border: 1px solid grey`
        },
    },
    methods: {
        updateValue(data) {
            this.$emit('input', data.hex8)
        },
    },
}
</script>

<template>
    <v-menu v-model="showPicker" :close-on-content-click="false">
        <div slot="activator">
            <v-layout row wrap>
                <v-flex>
                    <span class="preview" :style="style"></span>
                </v-flex>
                <v-flex>
                    <span class="d-inline-block">{{ label }}</span>
                </v-flex>
            </v-layout>
        </div>
        <Sketch :value="value || ''" @input="updateValue" />
    </v-menu>
</template>

<style lang="scss" scoped>
.preview {
    display: inline-block;
    border-radius: 3px;
    height: 19px;
    width: 38px;
}
</style>
