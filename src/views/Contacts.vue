<script>
import appConfig from '@/app.config'
import ContactList from '@/components/contact/list'
import ContactDetails from '@/components/contact/details'
import ContactForm from '@/components/contact/form'

export default {
    components: { ContactList, ContactDetails, ContactForm },
    props: {
        id: {
            type: String,
        },
    },
    page() {
        return this.$root.lang == 'ja' ? this.metaJA : this.metaEN
    },
    data() {
        return {
            showForm: false,
            metaJA: {
                title: 'お客様',
                meta: [{ name: 'description', content: appConfig.descriptionJA }],
            },
            metaEN: {
                title: 'Contacts',
                meta: [{ name: 'description', content: appConfig.description }],
            },
            edit: {},
        }
    },
    computed: {
        user() {
            return this.$store.state.account.user
        },
    },
    watch: {
        showForm: function(val) {
            if (!val) {
                this.edit = {}
            }
        },
    },
    methods: {
        editContact(contact) {
            this.edit = contact
            this.showForm = true
        },
        afterCreate(contact) {
            // After creating a new record from Contact Details view -
            // display the detail view of a newly created record
            if (this.id) {
                this.showForm = false
                this.$router.push({
                    name: 'contacts',
                    params: { id: contact.id },
                })
            } else {
                this.$router.push({
                    name: 'contacts',
                    params: { contactCreated: true },
                })
            }
        },
    },
}
</script>

<template>
    <Layout>
        <k-dialog
            lazy
            persistent
            v-model="showForm"
            transition="dialog-bottom-transition"
            max-width="1200"
        >
            <contact-form
                v-if="showForm"
                :data="edit"
                @close="showForm = false"
                @saved="showForm = false"
                @created="afterCreate"
            />
        </k-dialog>
        <div transition="fadeIn" class="pa-0">
            <div>
                <contact-list v-if="!id" @edit="editContact" />
                <contact-details v-else :id="id" @edit="editContact" />
            </div>
        </div>
    </Layout>
</template>
