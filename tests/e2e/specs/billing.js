describe('billing for a user who has a card and is subsscribed', () => {
    beforeEach(() => {
        cy.login().then(() => {
            cy.visit('/billing')
            cy.wait(2000)
        })
    })

    it('subscribes to a yearly plan', () => {
        cy.get('button')
            .get('span')
            .contains('Monthly plan х 3 projects')
            .should('exist')
            .get('button[id="btn-subscribe"]')
            .click()
            .wait(15000)
            .get('span')
            .contains('Annual plan х 3 projects')
            .should('exist')
    })

    it('subscribes to a monthly plan', () => {
        cy.get('button')
            .get('span')
            .contains('Annual plan х 3 projects')
            .should('exist')
            .get('button[id="btn-subscribe"]')
            .click()
            .wait(15000)
            .get('span')
            .contains('Monthly plan х 3 projects')
            .should('exist')
    })

    it('cancels a plan and resumes a plan', () => {
        cy.get('button')
            .get('span')
            .contains('Monthly plan х 3 projects')
            .should('exist')
            .get('button[id="btn-cancel-subscription"]')
            .click()
            .wait(15000)
            .get('div')
            .contains('You have cancelled your subscription to the Monthly plan.')
            .should('exist')
            .get('button[id="btn-resume-subscription"]')
            .click()
            .wait(15000)
            .get('div')
            .contains('You have cancelled your subscription to the Monthly plan.')
            .should('not.exist')
    })
})
