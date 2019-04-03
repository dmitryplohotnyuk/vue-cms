<script>
module.exports = {
    props: ['landing', 'block', 'buildStyle'],
}
</script>

<template>
    <div
        class="py-3 text-center"
        v-if="block && block.enabled"
        :style="
            buildStyle(block.settings, {
                'background-color': 'messageColorBg',
                color: 'messageColorText',
            })
        "
    >
        <div class="container no-content-margin" v-html="block.settings.messageText"></div>
    </div>
</template>
