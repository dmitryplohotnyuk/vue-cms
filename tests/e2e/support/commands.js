// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { userBuilder } from '../support/generate'

Cypress.Commands.add('login', () => {
    cy.request({
        method: 'POST',
        url: 'https://dev.kinchaku.com/api/users/login',
        body: {
            user: {
                email: 'testuser0808@test.com',
                password: '1234567',
                name: '',
                language: 'en',
            },
        },
    }).then(response => {
        window.localStorage.setItem('token', response.body.user.token)
        window.sessionStorage.setItem('token', response.body.user.token)
    })
})

Cypress.Commands.add('register', () => {
    const user = userBuilder()

    cy.request({
        method: 'POST',
        url: 'https://dev.kinchaku.com/api/users',
        body: {
            user: {
                email: user.email,
                password: user.password,
                name: user.userName,
                language: 'en',
            },
        },
    }).then(response => response.body.user)
})

Cypress.Commands.add('createProject', () => {
    const token = window.localStorage.getItem('token')
    cy.request({
        method: 'POST',
        headers: {
            'X-Auth-Token': token,
        },
        url: 'https://dev.kinchaku.com/api/projects',
        body: {
            project: {
                currency: 'jpy',
                duration: 12,
                start_date: '2018-11',
                title: 'test project',
                url: '',
                with_launch: true,
                with_model: true,
            },
        },
    }).then(response => response.body.project)
})

Cypress.Commands.add('deleteProject', projectId => {
    const token = window.localStorage.getItem('token')
    cy.request({
        method: 'DELETE',
        headers: {
            'X-Auth-Token': token,
        },
        url: `https://dev.kinchaku.com/api/projects/${projectId}`,
    })
})

Cypress.Commands.add('createTeam', () => {
    const token = window.localStorage.getItem('token')
    cy.request({
        method: 'POST',
        headers: {
            'X-Auth-Token': token,
        },
        url: `https://dev.kinchaku.com/api/teams`,
        body: {
            team: {
                name: 'test team',
            },
        },
    }).then(response => response.body.team)
})

Cypress.Commands.add('deleteTeam', teamId => {
    const token = window.localStorage.getItem('token')
    cy.request({
        method: 'DELETE',
        headers: {
            'X-Auth-Token': token,
        },
        url: `https://dev.kinchaku.com/api/teams/${teamId}`,
    })
})
