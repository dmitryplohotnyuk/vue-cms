<script>
import KDialog from '@/components/dialog'
// TODO: confirm by enter
export default {
    components: { KDialog },
    name: 'KConfirm',
    props: {
        maxWidth: {
            type: [Number, String],
        },
        title: {
            default: false,
        },
        question: {
            default: false,
        },
        danger: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            show: false,
        }
    },

    computed: {
        color() {
            return this.danger ? 'error' : 'primary'
        },
    },
}
</script>
<template>
    <k-dialog v-model="show" persistent :max-width="maxWidth">
        <slot name="button" slot="activator">
            <v-btn flat outline color="primary">
                <slot name="button-text">{{ 'confirm' | translate }}</slot>
            </v-btn>
        </slot>
        <v-card>
            <v-card-title class="headline">{{ title | translate }}</v-card-title>
            <v-card-text class="py-0">{{ question | translate }}</v-card-text>
            <v-card-actions class="pa-3">
                <v-spacer />
                <v-btn flat @click="show = false">{{ 'cancel' | translate }}</v-btn>
                <v-btn
                    :color="color"
                    @click="
                        $emit('confirm')
                        show = false
                    "
                >
                    {{ 'confirm' | translate }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </k-dialog>
</template>
