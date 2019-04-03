describe('creating, editing and deleting teams for a user who has a subscription', () => {
    beforeEach(() => {
        cy.login().then(() => {
            cy.visit('/teams')
            cy.wait(2000)
        })
    })

    it('creates a team', () => {
        cy.get('form').within(() => {
            cy.get('input[id="input-team-name"]')
                .type('test team')
                .get('button[type=submit]')
                .click()
        })

        cy.wait(1000)
            .get('a')
            .contains('test team')
            .should('exist')
    })

    it('deletes a team', () => {
        cy.get('a')
            .contains('test team')
            .trigger('mouseover')
            .wait(1000)
            .get('button[id="btn-delete-team"]')
            .click()
            .wait(2000)
            .get('button[id="btn-delete-team-confirm"]')
            .click()
    })

    it('updates a team', () => {
        cy.createProject().then(project => {
            cy.createTeam().then(team => {
                cy.visit(`/teams/${team.id}`)

                cy.get('input[id="input-email"]')
                    .type('terstfriend@test.co')
                    .get('button[id="btn-add-email"]')
                    .click()
                    .wait(3000)
                    .get('div')
                    .contains('test friend')
                    .should('exist')
                    .trigger('mouseover')
                    .wait(1000)
                    .get('button[id="btn-revoke-member"]')
                    .click()
                    .wait(3000)
                    .get('div')
                    .contains('test friend')
                    .should('not.exist')

                cy.get('input[id="input-team-project-name"]')
                    .click()
                    .get('div')
                    .contains('test project')
                    .click()
                    .get('button[id="btn-add-project"]')
                    .click()
                    .wait(2000)
                    .get('a')
                    .contains('test project')
                    .should('exist')
                    .get(':nth-child(2) > .v-list__tile > .v-list__tile__content')
                    .trigger('mouseover')
                    .wait(1000)
                    .get('button[id="btn-remove-project"]')
                    .click()
                    .get('div')
                    .contains('No projects for this team.')
                    .should('exist')

                cy.deleteTeam(team.id)
                cy.deleteProject(project.id)
            })
        })
    })
})
