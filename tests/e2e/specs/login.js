import { userBuilder } from '../support/generate'

describe('login', () => {
    it('should login an existing user', () => {
        const user = userBuilder()
        cy.visit('/')

        cy.get('.v-btn__content > .flag-icon').click()
        cy.get('.menuable__content__active > .v-list > :nth-child(1) > .v-list__tile').click()

        cy.get('a')
            .contains("Don't have an account yet?")
            .click()
        cy.get('form').within(() => {
            cy.get('input[id="name"]').type(user.username)
            cy.get('input[id="email"]').type(user.email)
            cy.get('input[id="password"]').type(user.password)
            cy.get('button[type=submit]').click()
        })

        cy.wait(3000)
        cy.url().should('eq', 'http://localhost:8080/')
        cy.window()
            .its('localStorage.token')
            .should('be.a', 'string')

        cy.get('button')
            .contains(user.username)
            .click()
        cy.get('a')
            .contains('sign out')
            .click()

        cy.get('form').within(() => {
            cy.get('input[id="email"]').type(user.email)
            cy.get('input[id="password"]').type(user.password)
            cy.get('button[type=submit]').click()
        })

        cy.wait(3000)
        cy.url().should('eq', 'http://localhost:8080/')
        cy.window()
            .its('localStorage.token')
            .should('be.a', 'string')

        cy.get('button')
            .contains(user.username)
            .should('exist')
    })
})
