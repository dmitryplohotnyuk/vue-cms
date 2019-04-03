<script>
export default {
    name: 'EmptyState',
    props: {
        title: {
            type: String,
            required: false,
            default: 'add cost data',
        },
    },
}
</script>

<template>
    <div class="ma-4">
        <div class="text-center">
            <img
                src="@/assets/images/empty-state-img.svg"
                srcset="@/assets/images/empty-state-img.svg"
                class="empty-state mb-3"
                alt="add data"
            />
            <strong class="headline text-capitalize">{{ title | translate }}</strong>
            <p class="my-4">
                <slot />
            </p>
            <div><slot name="action" /></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.empty-state {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
