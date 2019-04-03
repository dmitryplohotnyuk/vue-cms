<script>
export default {
    name: 'draggable',
    props: {
        width: {
            type: [Number, String],
        },
        maxWidth: {
            type: [Number, String],
        },
        value: {
            default: false,
        },
        transition: {
            type: String,
            default: 'slide-x-transition',
        },
        origin: {
            type: String,
            default: 'top right',
        },
        zIndex: {
            type: [Number, String],
            default: 7,
        },
    },
    data() {
        return {
            dragData: null,
        }
    },
    mounted() {
        // close on `ESC` key press
        window.addEventListener('keydown', this.handleKeydown)
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeydown)
    },
    computed: {
        positionX() {
            // fullscreen on mobiles
            if (this.$vuetify.breakpoint.xs) {
                return 10
            }
            // centered on bigger screens
            return (this.$vuetify.breakpoint.width - 380) / 2
        },
    },
    methods: {
        handleKeydown(evt) {
            // close on `ESC` key press
            if (evt.keyCode == 27) {
                this.$emit('close')
            }
        },
        handleDragStart(evt) {
            evt.stopPropagation()
            if (evt.offsetY > 60 || evt.target.getAttribute('draggable') != 'true') {
                evt.preventDefault()
                return
            }
            evt.dataTransfer.effectAllowed = 'move'
            evt.dataTransfer.setData('text/plain', '')
            let { screenX, screenY, x, y } = evt
            const parent = evt.target.offsetParent
            const { offsetLeft, offsetTop } = parent
            this.dragData = {
                start: { screenX, screenY, x, y, offsetLeft, offsetTop },
            }
        },
        handleDrag(evt) {
            evt.stopPropagation()
            let { screenX, screenY, x, y } = evt
            this.dragData = {
                start: this.dragData.start,
                drag: this.dragData.lastDrag,
                lastDrag: { screenX, screenY, x, y },
            }
        },
        handleDragEnd(evt) {
            const uaString = navigator.userAgent || navigator.vendor || window.opera || ''
            if (
                !uaString.includes('Safari') &&
                !uaString.includes('Chrome') &&
                !uaString.includes('Firefox') &&
                !uaString.includes('MSIE') &&
                !uaString.includes('Edge')
            ) {
                // unknown browser
                return
            }
            evt.stopPropagation()
            evt.preventDefault()

            const isFF = !evt.x && !evt.y
            const parent = evt.target.offsetParent
            let x = null
            let y = null
            let startX = null
            let startY = null
            if (isFF) {
                x = evt.screenX
                y = evt.screenY
                startX = this.dragData.start.screenX
                startY = this.dragData.start.screenY
            } else {
                x = this.dragData.drag.x
                y = this.dragData.drag.y
                startX = this.dragData.start.x
                startY = this.dragData.start.y
            }
            if (!(x || y) || !(startX || startY)) {
                return
            }
            const { start } = this.dragData
            const diff = {
                x: startX - start.offsetLeft,
                y: startY - start.offsetTop,
            }
            const left = x - diff.x
            const top = y - diff.y
            parent.style.left = left + 'px'
            parent.style.top = top + 'px'
        },
    },
}
</script>

<template>
    <v-menu
        v-model="value"
        :content-class="$vuetify.breakpoint.xs ? 'popover-fullscreen' : ''"
        :close-on-content-click="false"
        :close-on-click="false"
        :open-on-click="false"
        :max-width="maxWidth"
        :transition="transition"
        :origin="origin"
        absolute
        :position-x="positionX"
        :position-y="60"
        :z-index="zIndex"
        :close-delay="0"
    >
        <div
            v-on:dragstart="handleDragStart"
            v-on:drag="handleDrag"
            v-on:dragend="handleDragEnd"
            draggable="true"
        >
            <slot></slot>
        </div>
    </v-menu>
</template>

<style lang="scss" scoped>
.draggable {
    position: absolute;
}
[draggable='true'] {
    -khtml-user-drag: element;
}
</style>
