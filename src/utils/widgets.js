import remove from 'lodash/remove'
import findIndex from 'lodash/findIndex'

const storageKey = 'widgets'

export function allWidgets() {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || []
    } catch (e) {
        return []
    }
}

export function getWidget(name, projectId) {
    return allWidgets().find(widget => widget.name === name && widget.projectId === projectId)
}

export function saveWidget(widget) {
    const { name, projectId } = widget
    const widgets = allWidgets()
    const index = findIndex(widgets, { name, projectId })
    if (index > -1) {
        widgets.splice(index, 1, widget)
    } else {
        widgets.push(widget)
    }
    try {
        return localStorage.setItem(storageKey, JSON.stringify(widgets))
    } catch (e) {
        return []
    }
}

export function deleteWidget(name, projectId) {
    const widgets = allWidgets()
    remove(widgets, item => {
        return item.name === name && item.projectId === projectId
    })
    try {
        localStorage.setItem(storageKey, JSON.stringify(widgets))
        return widgets
    } catch (e) {
        return widgets
    }
}
