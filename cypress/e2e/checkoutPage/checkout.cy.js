
// cypress/e2e/checkout.cy.js

const BASE_URL = 'https://www.saucedemo.com/'
const VALID = Cypress.env('User') || { username: 'standard_user', password: 'secret_sauce' }
const INVALID = Cypress.env('IncorrectUserPassword') || { email: 'standard_user', password: 'secret_sauc' }
const INVALID_USERNAME = INVALID.username || INVALID.email || 'unknown_user'

// Helpers
const login = () => {
  cy.visit(BASE_URL || '/')
  cy.get('#user-name').should('be.visible').type(VALID.username)
  cy.get('#password').should('be.visible').type(VALID.password)
  cy.get('#login-button').should('be.visible').click()
  cy.url().should('include', '/inventory.html')
}

const addBackpackToCart = () => {
  cy.get('#add-to-cart-sauce-labs-backpack').should('be.visible').click()
  cy.get('#remove-sauce-labs-backpack').should('be.visible')
}

const goToCart = () => {
  cy.get('a.shopping_cart_link[data-test="shopping-cart-link"]').click()
  
  cy.url().should('include', '/cart.html')
}

const goToCheckoutInfo = () => {
  cy.get('#checkout').should('be.visible').click()
  cy.url().should('include', '/checkout-step-one.html')
  cy.get('span.title[data-test="title"]').should('contain', 'Checkout: Your Information')
}

describe('SauceDemo - Cart & Checkout - Negative-heavy suite', () => {
  beforeEach(() => {
    login()

    cy.clearCookies()
  cy.clearLocalStorage()
  cy.session.clearAllSessions && cy.session.clearAllSessions() // if using Cypress >=12 sessions

  })

  



  // ===== Inventory & Cart =====

  it('Verify that backpack price on inventory is displayed as $29.99', () => {
    cy.get('div.inventory_item_price[data-test="inventory-item-price"]')
      .first()
      .should('contain', '$29.99')
  })

  it('Verify that adding backpack shows Remove button', () => {
    addBackpackToCart()
  })

  it('Verify that cart badge increments to 1 after adding backpack', () => {
    addBackpackToCart()
    cy.get('span.shopping_cart_badge[data-test="shopping-cart-badge"]').should('contain', '1')
  })

  it('Verify that cart badge is not visible when no items are added', () => {
    cy.get('span.shopping_cart_badge[data-test="shopping-cart-badge"]').should('not.exist')
  })

  it('Verify that clicking cart icon navigates to cart page', () => {
    addBackpackToCart()
    goToCart()
    cy.get('.cart_item').should('exist')
  })

  it('Verify that continue shopping from cart returns to inventory page', () => {
    addBackpackToCart()
    goToCart()
    cy.get('#continue-shopping').should('be.visible').click()
    cy.url().should('include', '/inventory.html')
  })

  it('Verify that removing backpack from inventory hides badge', () => {
    addBackpackToCart()
    cy.get('#remove-sauce-labs-backpack').click()
    cy.get('span.shopping_cart_badge[data-test="shopping-cart-badge"]').should('not.exist')
  })

  it('Verify that clicking add twice toggles to Remove and does not exceed badge 1', () => {
    addBackpackToCart()
    cy.get('#remove-sauce-labs-backpack').click()
    cy.get('#add-to-cart-sauce-labs-backpack').click()
    cy.get('span.shopping_cart_badge[data-test="shopping-cart-badge"]').should('contain', '1')
  })

  it('Verify that checkout is accessible with empty cart (negative expectation: site still allows)', () => {
    goToCart()
    cy.get('#checkout').should('be.visible').click()
    cy.url().should('include', '/checkout-step-one.html')
  })

  // ===== Checkout Step One: Your Information =====

  it('Verify that checkout information page title is visible', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('span.title[data-test="title"]').should('contain', 'Checkout: Your Information')
  })

  it('Verify that error appears when all fields are empty on Continue', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#continue').click()
    cy.get('[data-test="error"]').should('contain', 'Error: First Name is required')
  })

  it('Verify that error appears when first name is empty', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#last-name').type('Doe')
    cy.get('#postal-code').type('100001')
    cy.get('#continue').click()
    cy.get('[data-test="error"]').should('contain', 'Error: First Name is required')
  })

  it('Verify that error appears when last name is empty', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type('John')
    cy.get('#postal-code').type('100001')
    cy.get('#continue').click()
    cy.get('[data-test="error"]').should('contain', 'Error: Last Name is required')
  })

  it('Verify that error appears when postal code is empty', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type('John')
    cy.get('#last-name').type('Doe')
    cy.get('#continue').click()
    cy.get('[data-test="error"]').should('contain', 'Error: Postal Code is required')
  })

  it('Verify that cancel on checkout information returns to cart page', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#cancel').click()
    cy.url().should('include', '/cart.html')
  })

  it('Verify that whitespace-only values trigger required field errors', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type('   ')
    cy.get('#last-name').type('   ')
    cy.get('#postal-code').type('   ')
    cy.get('#continue').click()
    cy.get('[data-test="error"]').should('be.visible').and('contain', 'Epic sadface: Username and password do not match any user in this service')
    //cy.get('[data-test="error"]').should('exist')
  })

  it('Verify that pressing Enter on postal code with empty first/last shows error', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#postal-code').type('{enter}')
    cy.get('[data-test="error"]').should('contain', 'Error: First Name is required')
  })


  it('Verify that fields accept special characters (negative validation not enforced)', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type("J@n3")
    cy.get('#last-name').type("D'oe")
    cy.get('#postal-code').type('N/A-100001')
    cy.get('#continue').click()
    cy.url().should('include', '/checkout-step-two.html')
  })

  // ===== Checkout Step Two: Overview =====

  it('Verify that subtotal on step two shows Item total: $29.99', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type('John')
    cy.get('#last-name').type('Doe')
    cy.get('#postal-code').type('100001')
    cy.get('#continue').click()
    cy.url().should('include', '/checkout-step-two.html')
    cy.get('div.summary_subtotal_label[data-test="subtotal-label"]').should('contain', 'Item total: $29.99')
  })

  it('Verify that cancel on checkout step two returns to inventory page', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type('John')
    cy.get('#last-name').type('Doe')
    cy.get('#postal-code').type('100001')
    cy.get('#continue').click()
    cy.get('#cancel').should('be.visible').click()
    cy.url().should('include', '/inventory.html')
  })

  it('Verify that finish completes the order and shows Thank you message', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type('John')
    cy.get('#last-name').type('Doe')
    cy.get('#postal-code').type('100001')
    cy.get('#continue').click()
    cy.get('#finish').click()
    cy.url().should('include', '/checkout-complete.html')
    cy.get('h2.complete-header[data-test="complete-header"]').should('contain', 'Thank you for your order!')
  })

  it('Verify that removing item before checkout leads to $0.00 subtotal (negative: no items)', () => {
    addBackpackToCart()
    cy.get('#remove-sauce-labs-backpack').click()
    goToCart()
    cy.get('#checkout').click()
    cy.get('#continue').click()
    // With no items, step two may not show item rows; ensure URL still changes appropriately
    cy.get('[data-test="error"]').should('contain', 'Error: First Name is required') // because we didn’t fill
  })

  it('Verify that cart count decrements after removing item from cart page', () => {
    addBackpackToCart()
    goToCart()
    cy.get('#remove-sauce-labs-backpack').click()
    cy.get('span.shopping_cart_badge[data-test="shopping-cart-badge"]').should('not.exist')
  })

  it('Verify that continue shopping button is not present on inventory page (negative)', () => {
    cy.url().should('include', '/inventory.html')
    cy.get('#continue-shopping').should('not.exist')
  })

  it('Verify that subtotal label exists only after proceeding to step two', () => {
    addBackpackToCart()
    goToCart()
    cy.get('div.summary_subtotal_label[data-test="subtotal-label"]').should('not.exist')
    goToCheckoutInfo()
    cy.get('div.summary_subtotal_label[data-test="subtotal-label"]').should('not.exist')
    cy.get('#first-name').type('John')
    cy.get('#last-name').type('Doe')
    cy.get('#postal-code').type('100001')
    cy.get('#continue').click()
    cy.get('div.summary_subtotal_label[data-test="subtotal-label"]').should('exist').and('contain', '$29.99')
  })

  it('Verify that add to cart button is not visible after item is added (toggle to Remove)', () => {
    addBackpackToCart()
    cy.get('#add-to-cart-sauce-labs-backpack').should('not.exist')
    cy.get('#remove-sauce-labs-backpack').should('be.visible')
  })

  it('Verify that attempting to finish without reaching step two is impossible (negative)', () => {
    cy.get('#finish').should('not.exist')
  })

  it('Verify that navigating directly to cart without items shows no cart items', () => {
    goToCart()
    cy.get('.cart_item').should('not.exist')
  })


  it('Verify that error persists until fields are corrected and Continue is clicked', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#continue').click()
    cy.get('[data-test="error"]').should('be.visible')
    cy.get('#first-name').type('John')
    cy.get('#last-name').type('Doe')
    cy.get('#postal-code').type('100001')
    cy.get('[data-test="error"]').should('be.visible') // still visible before clicking Continue
    cy.get('#continue').click()
    cy.url().should('include', '/checkout-step-two.html')
  })

  it('Verify that after order completion, cart badge is not shown (cart emptied)', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type('John')
    cy.get('#last-name').type('Doe')
    cy.get('#postal-code').type('100001')
    cy.get('#continue').click()
    cy.get('#finish').click()
    cy.get('span.shopping_cart_badge[data-test="shopping-cart-badge"]').should('not.exist')
  })

  it('Verify that removing item on step two is not available (negative: no Remove here)', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type('John')
    cy.get('#last-name').type('Doe')
    cy.get('#postal-code').type('100001')
    cy.get('#continue').click()
    cy.get('#remove-sauce-labs-backpack').should('not.exist')
  })

  it('Verify that navigating back to inventory after canceling on step two shows add to cart button again', () => {
    addBackpackToCart()
    goToCart()
    goToCheckoutInfo()
    cy.get('#first-name').type('John')
    cy.get('#last-name').type('Doe')
    cy.get('#postal-code').type('100001')
    cy.get('#continue').click()
    cy.get('#cancel').click()
    cy.url().should('include', '/inventory.html')
    cy.get('#add-to-cart-sauce-labs-backpack').should('be.visible')
  })

  it('Verify that cart page displays checkout and continue shopping controls', () => {
    addBackpackToCart()
    goToCart()
    cy.get('#checkout').should('be.visible')
    cy.get('#continue-shopping').should('be.visible')
  })

  it('Verify that title "Checkout: Your Information" is not shown outside info page (negative)', () => {
    cy.get('span.title[data-test="title"]').should('not.exist') // on inventory
    goToCart()
    cy.get('span.title[data-test="title"]').should('not.exist') // on cart
  })
})
