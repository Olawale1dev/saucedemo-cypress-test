
# 🧪 Cypress E2E Tests (POM) for SauceDemo

!Cypress
!License: MIT
!Node.js
!Status

A robust **Cypress end-to-end test suite** using the **Page Object Model (POM)** for the sample app **SauceDemo**.  
This project covers login, inventory, cart, and checkout flows—including **negative** and **edge-case** scenarios—for reliable, maintainable UI test automation.

---

## ✨ Features

- **Page Object Model (POM):** Clean separation of selectors & actions.
- **Comprehensive scenarios:** Positive, negative, and edge cases.
- **Reusable helpers:** Login, add/remove items, navigation, checkout steps.
- **Environment- **Environment-driven credentials:** Configurable via `cypress.config.js`.
- **Scalable structure:** Easy to add suites and pages.

> ⚠️ **Import paths:**  
> If your spec is inside a subfolder like `cypress/e2e/checkoutPage/`, use `../../support/pages/...`.  
> If your spec is directly under `cypress/e2e/`, use `../support/pages/...`.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 16.x`
- **npm** `>= 8.x`

### Install
```bash
npm install

Run (Interactive)
Shellnpx cypress openShow more lines
Run (Headless)
Shellnpx cypress runShow more lines

🔧 Configuration
cypress.config.js (example)
JavaScriptconst { defineConfig } = require('cypress');module.exports = defineConfig({  e2e: {    baseUrl: 'https://www.saucedemo.com',    supportFile: 'cypress/support/e2e.js', // or false if not used  },  env: {    User: { username: 'standard_user', password: 'secret_sauce' },    IncorrectUserPassword: { username: 'standard_user', password: 'secret_sauc' },  },  video: true,  screenshotsFolder: 'cypress/screenshots',  videosFolder: 'cypress/videos',});Show more lines

You can also load environment variables from your CI/CD environment if you don’t want them committed.


🧩 Page Object Model (POM) Conventions

One page object per screen (Login, Inventory, Cart, Checkout Info, Overview, Complete).
Centralize selectors in each page class.
Expose readable methods (e.g., login(), addBackpack(), goToCart(), continue()).
Keep assertions in tests, except for page-state checks like assertOnStepOne().

Example snippet: InventoryPage.js
JavaScriptexport default class InventoryPage {  selectors = {    backpackAddBtn: '#add-to-cart-sauce-labs-backpack',    backpackRemoveBtn: '#remove-sauce-labs-backpack',    cartBadge: 'span.shopping_cart_badge[data-test="shopping-cart-badge"]',    cartIcon: 'a.shopping_cart_link[data-test="shopping-cart-link"]',    firstItemPrice: 'div.inventory_item_price[data-test="inventory-item-price"]',  };  addBackpack()  addBackpack() {    cy.get(this.selectors.backpackAddBtn).should('be.visible').click();    cy.get(this.selectors.backpackRemoveBtn).should('be.visible');  }  goToCart() {    cy.get(this.selectors.cartIcon).click();    cy.url().should('include', '/cart.html');  }  assertPrice(expected) {    cy.get(this.selectors.firstItemPrice).first().should('contain', expected);  }  assertCartBadge(count) {    if (count === 0) cy.get(this.selectors.cartBadge).should('not.exist');    else cy.get(this.selectors.cartBadge).should('contain', String(count));  }Show more lines

🧪 What’s Covered (Test Mapping)
Login Suite:

Placeholder and input types.
Successful login to inventory.
Empty username, empty password, both empty.
Incorrect credentials error messages.
Locked out user.
Username case sensitivity & whitespace.
SQLi/XSS attempts.
Long inputs (1000 chars).
Enter key submission.
Error dismissal and error styling.
Multiple failed attempts do not lock account.
Logout via burger menu (robust menu open + click).

Checkout & Cart Suite:

Displayed price on inventory $29.99.
Add backpack & cart badge updates.
Remove backpack & badge disappears.
Cart icon navigation to cart.
Continue shopping returns to inventory.
Checkout accessible with empty cart (negative).
Step One title & required field validations (first/last/postal).
Whitespace-only values behavior (negative checks).
Enter key submission on postal code.
Special characters acceptance (negative validation not enforced).
Step Two subtotal Item total: $29.99.
Cancel on Step Two returns to inventory.
Finish completes order with Thank You.
Subtotal exists only on Step Two.
No Remove button on Step Two (by design).
Cart page controls visible.
“Checkout: Your Information” title not visible on other pages.
Navigating to cart with no items shows empty state.


🛠 Scripts
Add these to your package.json for convenience:



🛠 Scripts
Add these to your package.json for convenience:
JSON{  "scripts": {    "cy:open": "cypress open",    "cy:run": "    "cy:run": "cypress run",    "cy:run:headed": "cypress run --headed --browser chrome",    "cy:run:spec": "cypress run --spec 'cypress/e2e/**/*.cy.js'"  }Show more lines

🤝 Contributing

Fork the repo
Create a feature branch: git checkout -b feat/pom-improvements
Commit changes: git commit -m "Add improved POM for CheckoutInfoPage"
Push: git push origin feat/pom-improvements
Open a Pull Request

Guidelines:

Keep page objects cohesive and readable.
Prefer data-test attributes for selectors.
Avoid cy.wait() unless targeting known animations; use visibility checks instead.
Don’t mix class exports and instance exports—be consistent.


🧰 CI (GitHub Actions)
Create .github/workflows/cypress.yml:
YAMLname: Cypress E2Eon:  push:    branches: [ main ]  pull_request:jobs:  cypress-run:    runs-on: ubuntu-latest    steps:      - name: Checkout        uses: actions/checkout@v4      - name: Setup Node        uses: actions/setup-node@v4        with:          node-version: '18'      - name: Install deps        run: npm ci      - name: Run Cypress (headless)        uses: cypress-io/github-action@v6        with:          config-file: cypress.config.js          browser: chrome        env:Show more lines

You can pass env values via env or repository secrets as needed.


🩺 Troubleshooting


Module not found / import paths:
Adjust relative imports based on spec location (e.g., ../../support/pages/...).


“is not a function / is not a constructor”:
Ensure consistency:

Class export: export default class Page {} → const page = new Page(); page.method()
Instance export: class Page {}; export default new Page(); → Page.method() (no new)



Logout link click fails (center hidden):
Wait for burger menu container .bm-menu and .bm-item-list, then scrollIntoView() and click, or use { force: true } as last resort.


Error banner text assertions:
Use .and('contain', 'Error: First Name is required') or normalize text with .invoke('text') to avoid SVG/close button noise.


Flaky navigation due to cleared session:
Don’t clear cookies/localStorage after login in beforeEach, or you’ll break navigation flow.



📸 (Optional) Screenshots & Videos
Cypress will store:

Screenshots under cypress/screenshots/
Videos under cypress/videos/

Enable/disable via cypress.config.js.

📄 License
This project is licensed under the MIT License. See LICENSE for details.

🙌 Acknowledgements

Cypress for the awesome testing tooling.
SauceDemo for a consistent demo app that’s great for UI automation practice.


💬 Questions / Support
If you run into any issues, open an Issue on this repo with:

The failing spec name
Cypress logs or screenshots
Your page object export style (class vs instance)
The import paths used in the spec

Happy testing! 🚀

