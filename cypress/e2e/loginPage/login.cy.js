
// cypress/e2e/login.cy.js

const BASE_URL = "https://www.saucedemo.com/"
const VALID = Cypress.env('User') || { username: 'standard_user', password: 'secret_sauce' }
const INVALID = Cypress.env('IncorrectUserPassword') || { email: 'standard_user', password: 'secret_sauc' }
const INVALID_USERNAME = INVALID.username || INVALID.email || 'unknown_user'

describe('SauceDemo Login - Negative-heavy suite', () => {
  beforeEach(() => {
    cy.visit(BASE_URL || '/')
    cy.get('#user-name').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('#login-button').should('be.visible')
  })

  it('Verify that placeholders and input types are correct', () => {
    cy.get('#user-name').should('have.attr', 'placeholder', 'Username')
    cy.get('#password').should('have.attr', 'placeholder', 'Password')
    cy.get('#password').should('have.attr', 'type', 'password')
  })

  it('Verify that user can log in successfully and redirect to inventory page', () => {
    cy.get('#user-name').type(VALID.username)
    cy.get('#password').type(VALID.password)
    cy.get('#login-button').click()
    cy.url().should('include', '/inventory.html')
    cy.contains('.title', 'Products')
  })

  it('Verify that error is shown when username is empty', () => {
    cy.get('#password').type(VALID.password)
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible').and('contain', 'Username is required')
    cy.get('#user-name').should('have.class', 'input_error')
    cy.get('#password').should('have.class', 'input_error')
  })

  it('Verify that error is shown when password is empty', () => {
    cy.get('#user-name').type(VALID.username)
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible').and('contain', 'Password is required')
  })

  it('Verify that error is shown when both fields are empty', () => {
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible').and('contain', 'Username is required')
  })

  it('Verify that error is shown for incorrect password or username', () => {
    cy.get('#user-name').type(VALID.username)
    cy.get('#password').type(INVALID.password)
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible').and('contain', 'Epic sadface: Username and password do not match any user in this service')
  })

  it('Verify that locked_out_user shows locked out error', () => {
    cy.get('#user-name').type('locked_out_user')
    cy.get('#password').type('secret_sauce')
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible').and('contain', 'Sorry, this user has been locked out')
  })

  it('Verify that login fails when username case is incorrect', () => {
    cy.get('#user-name').type(VALID.username.toUpperCase())
    cy.get('#password').type(VALID.password)
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible')
  })

  it('Verify that login fails when username has leading/trailing spaces', () => {
    cy.get('#user-name').type(`  ${VALID.username}  `)
    cy.get('#password').type(VALID.password)
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible')
  })

  it('Verify that login fails when password has leading/trailing spaces', () => {
    cy.get('#user-name').type(VALID.username)
    cy.get('#password').type(`  ${VALID.password}  `)
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible')
  })

  it('Verify that SQL injection attempt is rejected', () => {
    cy.get('#user-name').type(`' OR '1'='1`)
    cy.get('#password').type('anything')
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible')
  })

  it('Verify that XSS attempt does not execute and shows error', () => {
    cy.window().then((win) => cy.stub(win, 'alert').as('alert'))
    cy.get('#user-name').type('<script>alert(1)</script>')
    cy.get('#password').type('anything')
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible')
    cy.get('@alert').should('not.have.been.called')
  })

  it('Verify that very long username and password show error', () => {
    const longStr = 'x'.repeat(1000)
    cy.get('#user-name').type(longStr)
    cy.get('#password').type(longStr)
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible')
  })

  it('Verify that pressing Enter submits form and shows error for invalid creds', () => {
    cy.get('#user-name').type(INVALID_USERNAME)
    cy.get('#password').type(INVALID.password + '{enter}')
    cy.get('[data-test="error"]').should('be.visible')
  })

  it('Verify that error message can be dismissed via close button', () => {
    cy.get('#login-button').click()
    cy.get('[data-test="error"]').should('be.visible')
    cy.get('.error-button').click()
    cy.get('[data-test="error"]').should('not.exist')
  })

  it('Verify that inputs get error styling on validation failure', () => {
    cy.get('#login-button').click()
    cy.get('#user-name').should('have.class', 'input_error')
    cy.get('#password').should('have.class', 'input_error')
  })

  it('Verify that multiple failed attempts still show error and do not lock account', () => {
    for (let i = 0; i < 3; i++) {
      cy.get('#user-name').clear().type(INVALID_USERNAME)
      cy.get('#password').clear().type(INVALID.password)
      cy.get('#login-button').click()
      cy.get('[data-test="error"]').should('be.visible')
      cy.get('.error-button').click()
    }
  })

  it('Verify that login button remains clickable even when fields are invalid', () => {
    cy.get('#login-button').should('not.be.disabled').click()
    cy.get('[data-test="error"]').should('be.visible')
  })

  it('Verify that user can logout and return to login page', () => {
    cy.get('#user-name').type(VALID.username)
    cy.get('#password').type(VALID.password)
    cy.get('#login-button').click()
    cy.url().should('include', '/inventory.html')

    cy.get('#react-burger-menu-btn').click()
    cy.get('#logout_sidebar_link').click()

    //cy.url().should('match', /\/$/)
    cy.get('#login-button').should('be.visible')
  })
})
