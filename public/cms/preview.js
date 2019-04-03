/* global Vue, httpVueLoader */

function init() {
    window.addEventListener(
        'message',
        function(event) {
            //var origin = event.origin || event.originalEvent.origin // For Chrome, the origin property is in the event.originalEvent object.
            // if (origin !== /*the container's domain url*/)
            // return;
            if (typeof event.data == 'object' && event.data.call == 'setData') {
                setData(event.data.value)
            }
        },
        false
    )
    window.parent.postMessage('getData', window.location)
    return true
}

function setData(json) {
    var landing = JSON.parse(json)
    Vue.set(window.app, 'landing', landing)
}

;(function() {
    'use strict'
    window.app = new Vue({
        components: {
            'announcement-block': httpVueLoader('templates/announcement-block.vue'),
            'header-block': httpVueLoader('templates/header-block.vue'),
            'hero-block': httpVueLoader('templates/hero-block.vue'),
            'rich-block': httpVueLoader('templates/rich-block.vue'),
            'plans-block': httpVueLoader('templates/plans-block.vue'),
            'slideshow-block': httpVueLoader('templates/slideshow-block.vue'),
            'content-block': httpVueLoader('templates/content-block.vue'),
            'form-block': httpVueLoader('templates/form-block.vue'),
            'footer-block': httpVueLoader('templates/footer-block.vue'),
            'subscription-block': httpVueLoader('templates/subscription-block.vue'),
        },
        el: '#app',
        data: function() {
            return {
                isSidebarOpened: false,
                landing: {
                    // theme settings
                    theme: { colors: {}, blocks: {} },
                    // page data
                    page: {
                        // current page blocks
                        blocks: [],
                    },
                    // additional data
                    data: {},
                },
            }
        },
        watch: {
            'landing.theme.colors': function landingColorsWatcher(colors) {
                var stylesheet = document.getElementById('styles')
                stylesheet.innerHTML = `
                        body{
                            color: ${colors.text};
                            background-color: ${colors.colorBg}
                        }
                        a{
                            color: ${colors.links};
                        }
                        .btn, .btn:visited{
                            color: ${colors.buttonColorText};
                            background-color: ${colors.buttonColorBg};
                            border-color: ${colors.buttonColorBg};
                        }
                        .btn:focus, .btn:hover{
                            color: ${colors.buttonColorText};
                            background-color: ${colors.buttonColorBg};
                            border-color: ${colors.buttonColorBg};
                        }
                    `
            },
        },
        computed: {
            mainMenu() {
                const headerBlock = this.landing.theme.blocks.header
                return headerBlock && headerBlock.settings.menu
            },
            announcementBlock() {
                return this.landing.page.blocks.find(b => b.type == 'announcement')
            },
            ready() {
                return !!(
                    this.landing &&
                    this.landing.page &&
                    this.landing.page.blocks &&
                    this.landing.page.blocks.length
                )
            },
        },
        mounted: function() {
            init()
        },
        methods: {
            buildStyle: function buildStyle(object, settings) {
                if (!object) return
                return Object.keys(settings)
                    .map(styleProp => {
                        var objectKey = settings[styleProp]
                        if (!objectKey) return
                        var styleValue = object[objectKey]
                        if (!styleValue) return
                        var result = styleProp + ': ' + styleValue + ';'
                        return result
                    })
                    .join(';')
            },
            onClick: function onClick(evt) {
                if (evt.target.nodeName.toLowerCase() == 'a') {
                    evt.preventDefault()
                }
            },
        },
    })
})()
