<script>
export default {
    page: {
        title: '404',
        meta: [{ name: 'description', content: '404' }],
    },
    props: {
        resource: {
            type: String,
            default: '',
        },
    },
}
</script>

<template>
    <Layout>
        <v-container fluid>
            <v-layout row justify-center>
                <v-flex xs12 sm12 md6 lg5 xl3>
                    <img
                        src="@/assets/images/404.svg"
                        srcset="@/assets/images/404.svg"
                        style="max-width: 100%"
                    />
                </v-flex>
            </v-layout>
            <v-layout align-space-around justify-space-around>
                <v-flex>
                    <h1 class="text-xs-center red-text">
                        {{ "Oops! We couldn't find the page you are looking for!" | translate }}
                    </h1>
                    <p class="text-xs-center">
                        {{
                            'If you think that there may be some problem on KINCHAKU side, please contact our helpdesk.'
                                | translate
                        }}
                    </p>
                </v-flex>
            </v-layout>
        </v-container>
    </Layout>
</template>
