// https://docs.cypress.io/api/introduction/api.html

describe('Kinchaku anonymus user', () => {
    it('Visits the app root url', () => {
        cy.visit('/').contains(
            'strong',
            'コストを計算するためにコストをかけないで予実分析と原価管理をしよう〜'
        )
    })

    it('Visits the app root url and switches the language', () => {
        cy.visit('/')
        cy.get('button[id="btn-language"]').click()
        cy.get('i[id="btn-english"]').click()
        cy.contains('strong', `Cost management shouldn't cost a fortune.`)
        cy.get('button[id="btn-language"]').click()
        cy.get('i[id="btn-japanese"]').click()
        cy.contains(
            'strong',
            `コストを計算するためにコストをかけないで予実分析と原価管理をしよう〜`
        )
    })
})
