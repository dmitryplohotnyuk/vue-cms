describe('project', () => {
    beforeEach(() => {
        cy.login().then(() => {
            cy.visit('/')
            cy.wait(2000)
        })
    })

    it('creates a project', () => {
        cy.get('#btn-create-project').click()

        cy.wait(2000)

        cy.get('form').within(() => {
            cy.get('input[id="title"]').type('test project')
            cy.get('button[type=submit]').click()
        })

        cy.wait(2000)

        cy.visit('/')

        cy.wait(2000)

        cy.get('a')
            .contains('test project')
            .should('exist')
            .click()

        cy.wait(2000)
        cy.location().then(loc => {
            cy.deleteProject(loc.pathname.split('/project/')[1])
        })
        cy.wait(2000)
        cy.visit('/')
        cy.get('a')
            .contains('test project')
            .should('not.exist')
    })

    it('rename a project', () => {
        cy.createProject().then(project => {
            cy.visit(`/project/${project.id}/settings`)
            cy.wait(3000)
            cy.get('form').within(() => {
                cy.get('input[id="title"]').type('{selectall}test project rename')
                cy.get('button[type=submit]').click()
            })
            cy.wait(3000)
            cy.visit('/')
            cy.wait(3000)
            cy.get('a')
                .contains('test project rename')
                .should('exist')
            cy.deleteProject(project.id)
        })
    })

    it('adds a business model to a project', () => {
        cy.createProject().then(project => {
            cy.visit(`/project/${project.id}/kpi`)
            cy.wait(3000)
            cy.get('form').within(() => {
                cy.get('input[id="market_size"]').type('300')
                cy.get('input[id="market_share"]').type('{selectall}15')
                cy.get('button[id="submit-step-1"]').click()
            })
            cy.wait(1000)
            cy.get('form').within(() => {
                cy.get('input[id="avp"]').type('1000')
                cy.get('input[id="apc"]').type('10')
                cy.get('input[id="conversion_rate"]').type('15')
                cy.get('input[id="cpmi"]').type('300')
                cy.get('button[id="submit-step-2"]').click()
            })
            cy.wait(1000)
            cy.get('form').within(() => {
                cy.get('input[id="cogs"]').type('80')
                cy.get('input[id="initial_cost"]').type('30000')
                cy.get('input[id="launch_period"]').type('30')
                cy.get('button[id="submit-step-3"]').click()
            })
            cy.wait(1000)
            cy.get('form').within(() => {
                cy.get('button[id="submit-step-4"]').click()
            })
            cy.wait(1000)
        })
    })

    it('adds labour initial costs to a project', () => {
        cy.get('a')
            .contains('test project')
            .click()
        cy.wait(5000)
        cy.get('a')
            .contains('initial costs')
            .click({ force: true })
        cy.wait(3000)
        cy.get('button')
            .contains('add record')
            .click()
        cy.wait(1000)
        cy.get('form').within(() => {
            cy.get('input[id="title"]').type('Engineer')
            cy.get('input[id="division"]').type('Front End')
            cy.get('input[id="base salary"]').type('300000000')
            cy.get('input[id="overtime pay"]').type('2000')
            cy.get('input[id="commuting allowance"]').type('20000')
            cy.get('input[id="statutory welfare expenses"]').type('5000')
            cy.get('input[id="bonuses & incentive pays"]').type('12000')
            cy.get('input[id="retirement pay"]').type('15000')
        })
        cy.get(
            '.layout > :nth-child(1) > .v-input > .v-input__control > .v-input__slot > .v-select__slot > .v-input__append-inner > .v-input__icon > .v-icon'
        ).click()
        cy.get('div')
            .contains('2017/01')
            .click()
        cy.get(
            ':nth-child(2) > .v-input > .v-input__control > .v-input__slot > .v-select__slot > .v-select__selections'
        ).click()
        cy.get('div')
            .contains('12')
            .click()
        cy.get('button[type=submit]').click()
    })

    it('adds labour cogs to a project', () => {
        cy.get('a')
            .contains('test project')
            .click()
        cy.wait(5000)
        cy.get('a')
            .contains('COGS')
            .click({ force: true })
        cy.wait(1000)
        cy.get('form').within(() => {
            cy.get('input[id="title"]').type('Engineer')
            cy.get('input[id="division"]').type('Front End')
            cy.get('input[id="base salary"]').type('300000000')
            cy.get('input[id="overtime pay"]').type('2000')
            cy.get('input[id="commuting allowance"]').type('20000')
            cy.get('input[id="statutory welfare expenses"]').type('5000')
            cy.get('input[id="bonuses & incentive pays"]').type('12000')
            cy.get('input[id="retirement pay"]').type('15000')
        })
        cy.get(
            '.layout > :nth-child(1) > .v-input > .v-input__control > .v-input__slot > .v-select__slot > .v-input__append-inner > .v-input__icon > .v-icon'
        ).click()
        cy.get('div')
            .contains('2019/01')
            .click()
        cy.get(
            ':nth-child(2) > .v-input > .v-input__control > .v-input__slot > .v-select__slot > .v-select__selections'
        ).click()
        cy.get('div')
            .contains('12')
            .click()
        cy.get('button[type=submit]').click()
    })

    // it('adds ad expense operating cost to a project', () => {
    //     cy.get('a')
    //         .contains('test project')
    //         .click()
    //     cy.wait(5000)
    //     cy.get('a')
    //         .contains('operating costs')
    //         .click({force: true})
    //     cy.wait(1000)
    //     cy.get('form').within(() => {
    //         cy.get('input[id="title"]').type('GoogleAds')
    //         cy.get('input[id="provider name"]').type('Google')
    //         cy.get('input[id="service name"]').type('Ads')
    //         cy.get('input[id="unit price"]').type('2000')
    //         cy.get('input[id="quantity"]').type('500')
    //         cy.get('input[id="unit measure"]').type('5000')
    //     })
    //     cy.get('div').contains.click()
    //     cy.get('div')
    //         .contains('2019/01')
    //         .click()
    //     cy.get(
    //         ':nth-child(2) > .v-input > .v-input__control > .v-input__slot > .v-select__slot > .v-select__selections'
    //     ).click()
    //     cy.get('div')
    //         .contains('12')
    //         .click()
    //     cy.get('button[type=submit]').click()
    // })

    it('adds a channel to a project', () => {
        cy.get('a')
            .contains('test project')
            .click()
        cy.wait(5000)
        cy.get('a')
            .contains('revenue')
            .click({ force: true })
        cy.wait(1000)
        cy.get('button')
            .contains('add record')
            .click()
        cy.wait(1000)
        cy.get('form').within(() => {
            cy.get('input[id="channel"]').type('{selectall}Default Channel')
            cy.get('input[id="revenue"]').type('2000000000')
        })
        cy.get(
            '.layout > :nth-child(1) > .v-input > .v-input__control > .v-input__slot > .v-select__slot > .v-input__append-inner > .v-input__icon > .v-icon'
        ).click()
        cy.get('div')
            .contains('2019/01')
            .click()
        cy.get(
            ':nth-child(2) > .v-input > .v-input__control > .v-input__slot > .v-select__slot > .v-select__selections'
        ).click()
        cy.get('div')
            .contains('12')
            .click()
        cy.get('button[type=submit]').click()
    })

    it('deletes a project', () => {
        cy.get('a')
            .contains('test project')
            .click()
        cy.wait(5000)
        cy.get('a')
            .contains('settings')
            .click({ force: true })
        cy.wait(3000)
        cy.get('button[id="btn-delete-project"]').click()
        cy.wait(3000)
        cy.get('button[id="btn-delete-project-confirm"]').click()
        cy.wait(3000)
        cy.url().should('eq', 'http://localhost:8080/')
    })
})
