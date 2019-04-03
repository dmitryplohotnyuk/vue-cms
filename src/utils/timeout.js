export default function timeout(duration, data) {
    return new Promise(function(resolve) {
        setTimeout(function functionName() {
            resolve(data)
        }, duration)
    })
}
