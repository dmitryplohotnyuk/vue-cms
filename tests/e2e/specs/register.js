import { userBuilder } from '../support/generate'

describe('registration', () => {
    it('should register a new user', () => {
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

        cy.wait(2000)
        cy.url().should('eq', 'http://localhost:8080/')
        cy.window()
            .its('localStorage.token')
            .should('be.a', 'string')
    })
})
