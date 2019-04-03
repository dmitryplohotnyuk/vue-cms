<script>
export default {
    props: {
        maxFileSize: {
            type: Number,
            default: 10000000,
        },
        maxFiles: {
            type: Number,
            default: 5,
        },
        url: {
            type: String,
            required: true,
        },
        headers: {
            type: Object,
        },
        params: {
            type: Object,
        },
        handleError: {
            type: Function,
        },
        acceptedFiles: {
            type: String,
        },
    },
    data() {
        return {
            selectedFiles: {},
            selectedFileIds: [],
        }
    },
    filters: {
        humanSize(size) {
            var i = Math.floor(Math.log(size) / Math.log(1024))
            return (
                (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
            )
        },
    },
    computed: {
        files() {
            return this.selectedFileIds.map(id => this.selectedFiles[id])
        },
    },
    mounted() {
        if (this.acceptedFiles) {
            document.getElementById('fileinput').setAttribute('accept', this.acceptedFiles)
        }
    },
    methods: {
        selectFile(file) {
            let id = new Date().getTime()
            var f = {
                id,
                data: file,
                uploaded: false,
                error: null,
                progress: 0,
            }
            if (file.size > this.maxFileSize) {
                f.error = 'File is above the max allowed size'
            }
            this.selectedFiles = { ...this.selectedFiles, [f.id]: f }
            this.selectedFileIds.push(f.id)
            this.uploadFile(f)
        },
        fileSelected(e) {
            for (var i = 0; i < e.target.files.length; i++) {
                var file = e.target.files[i]
                this.selectFile(file)
            }
            document.getElementById('fileinput').value = ''
        },
        remove(file) {
            delete this.selectedFiles[file.id]
            this.selectedFileIds.splice(this.selectedFileIds.indexOf(file.id), 1)
        },
        async uploadFile(file) {
            var self = this
            file.progress = 0
            //----------------------
            let xhr = new XMLHttpRequest()
            xhr.open('POST', this.url, true) //async true
            xhr.timeout = 30000

            xhr.upload.addEventListener('progress', function(progress) {
                file.progress = (progress.loaded / progress.total) * 100
            })
            xhr.upload.addEventListener('error', function(error) {
                file.error = error
            })

            let headers = {
                Accept: 'application/json',
                'Cache-Control': 'no-cache',
                'X-Requested-With': 'XMLHttpRequest',
            }

            if (this.headers) {
                Object.keys(this.headers).forEach(h => {
                    headers[h] = this.headers[h]
                })
            }

            for (let headerName in headers) {
                let headerValue = headers[headerName]
                if (headerValue) {
                    xhr.setRequestHeader(headerName, headerValue)
                }
            }

            let formData = new FormData()
            if (this.params) {
                for (let key in this.params) {
                    let value = this.params[key]
                    formData.append(key, value)
                }
            }
            formData.append('file', file.data)

            xhr.addEventListener('readystatechange', async function() {
                if (this.readyState === 4) {
                    if (this.status === 204) {
                        file.uploaded = true
                        file.progress = 100
                        self.$emit('fileUploaded', file)
                    } else {
                        file.error =
                            self.handleError && typeof self.handleError === 'function'
                                ? self.handleError(file, JSON.parse(this.response))
                                : JSON.parse(this.response)
                    }
                }
            })

            xhr.send(formData)
        },
    },
}
</script>

<template>
    <div class="upload-container">
        <v-container v-if="files.length" fluid class="pa-0">
            <v-layout row wrap>
                <v-flex xs12 v-for="(file, f) in files" :key="f">
                    <v-text-field
                        append-icon="close"
                        loading
                        readonly
                        hide-details
                        :value="file.data.name"
                        :label="file.data.size | humanSize"
                        @click:append="remove(file)"
                        class="ma-0"
                        box
                    >
                        <v-progress-linear
                            v-show="!file.uploaded"
                            height="4"
                            :value="file.progress"
                            slot="progress"
                        />
                    </v-text-field>
                    <span v-if="file.error" class="v-text-field__details error--text pt-2 pl-2">
                        {{ file.error }}
                    </span>
                </v-flex>
            </v-layout>
        </v-container>
        <div class="jbtn-file text-center">
            <div><slot>Drop files here to upload</slot></div>
            <input id="fileinput" type="file" multiple @change="fileSelected" />
        </div>
    </div>
</template>

<style scoped>
.jbtn-file {
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100%;
}
.jbtn-file input[type='file'] {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 100%;
    min-height: 100%;
    text-align: right;
    filter: alpha(opacity=0);
    opacity: 0;
    outline: none;
    cursor: inherit;
    display: block;
}
.upload-container:hover {
    background-color: #f6f6f6;
}
.upload-container {
    border: 2px solid #e5e5e5;
}
</style>
