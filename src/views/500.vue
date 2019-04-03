<script>
export default {
    page: {
        title: '500 Server Error',
        meta: [{ name: 'description', content: '500' }],
    },
    props: {
        error: {
            type: [String, Error, Object],
            default: '',
        },
    },
}
</script>

<template>
    <Layout>
        <v-container>
            <v-layout align-space-around justify-space-around>
                <v-container>
                    <v-layout align-center justify-center row fill-height>
                        <v-icon class="red-text" size="100px">warning</v-icon>
                        <span class="red-text" style="font-size: 100px; line-height: 1rem;"
                            >500</span
                        >
                    </v-layout>
                </v-container>
            </v-layout>
            <h1 class="text-xs-center red-text mt-1">{{ 'Server Error' | translate }}</h1>
            <h4 class="text-xs-center red-text">{{ error.message }}</h4>
            <p class="text-xs-center">
                {{
                    'If you think that there may be some problem on KINCHAKU side, please contact our helpdesk.'
                        | translate
                }}
            </p>
        </v-container>
    </Layout>
</template>
