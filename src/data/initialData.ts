import { DetectedIssue, ProductItem, TestSuite, ReviewPin, ExecutionRun } from '../types';

export const STITCH_ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1U_gZM2kSdnT-oODet-LPssOvYFjqfPN0h2Afug8qGBH4PJA4HQZaC4w94LW62bxQs2E08wgBoDijS_MxwNXr_xhTX8UJePlt8GLWOa330ePngUQkwnEoNRL9e95pZSFbBkxlhclZtzVSlqvnAMX5NeK4bddeTFmGao39Ltn0VTb5R5QRED4XejSdlQF7X8ZqaoXsGT4JiS5HYY3P3kzBBP2IKfsjr-GBVNejxaDizEGdMGTIFjnBwzjJw',
  overviewScreen: 'https://lh3.googleusercontent.com/aida/AEtjO1XTQCWlyyxFs2qBvw7fwYHhH2VjIrGaGutFUty8qKgBfviBetTTLCXIJ8eDoddKIMUgGTT-0kk3iH1QpG7rGlWtcw2FLB3c1_cZBMa_7z1Wi5LVfPH3tGB9I-QOEGHdJsXeUNtIHO0XbZudJ2--Ak--nUcmQ8euPwXNfYTvmwp61I_mRD6oHrmb84Ecq6LDYyAW3Kwj_MFGKeDRczfU9MCLyfbje1XTKYXpGDX6RvtM9pwvxT1zAdi47Hg',
  functionalTestsScreen: 'https://lh3.googleusercontent.com/aida/AEtjO1Xp3DPOALzNE0n4U57Y5b2_3rnBFUoRLI12Jdz-XmLeplE3MMT_woY8y-YFq2KxeplpGUZ7VuuJNtVkm05mQ9d2joyBQGIGyWqEVMqiaNJ2ts7rlpzLt2gpsY8VtIlm7SdF-XzrMV3NruWpsBSJ4tFgK5EhgWFtBMpxMIqngJVCd0WYm6z2Xk_4P9vscciE9zk3Kwy4mB53ifX2tjgOUXhhudaujnUjRqSk_nirO5_E9g6rEmHJ2L428pE',
  issuesLogScreen: 'https://lh3.googleusercontent.com/aida/AEtjO1UCikCk6VxCXj8GB8uIFiX0g0U4sx9jQLVqEttbVLk-KKFzpdyriR9wog7Cnos6zqGR-Zt1qPO5VayyeXfv2DVe30iJyqmNfrzZ8jzrTuPfyl86v3J8Wd0wkLMvfwdAjaEuOI6oLlnarxjL0FzIkq5Rh0y6-Y-LnnSf_igSpDX1-8c6-r4kmyuphP9_ShlTIa2O-_kT_H3ewoVN5O8y2giMjN9RbzuHgwYKLd-YGpR9sCIFu-TvL-Sh92M',
  contentScraperScreen: 'https://lh3.googleusercontent.com/aida/AEtjO1VL4FL71CLji0oeMYxT6cbwJbl154fOeFFVgyfBeUnlWIRG4ikVi008L8lYWctA8RB5RbkFnsl8A7auH5Cpya38kbeDBvbPgzdHTvPZXrT4QeUM_qkFuafVH_m5tuTx41LtMMH12K-Z10KptTOPFKf-KrQIon-ooygVjA2zyT5UJpPMvJcAvQxwGRxYvJ1FPyN7WUmWHkj5D1UYEKe4rArsCpW-xNhZ4kWptD-L4w1IV7MokhlhKdTG-Q',
  reviewPinsScreen: 'https://lh3.googleusercontent.com/aida/AEtjO1V9bbV104OzH6V6LIq22-DzX9rvlAj9QdadE_-gmIEgUqw3YR-I5A4w-QotCOnpSQMIYLtvqvKotTgANBr9MQrPbeBgkXk_uBjKoEwOJSOAWKKhbHvVES5Q0Mq1MMhDgdWh6qHN1Z8EqbiPrIgF92Bsjtk0ZwD3YXoMPi8FAhlWyWsS_TL7tXzH1L9y8Oa1Ydy0UUbh7zPt4QGU8ACidrNC5v_EDk8yuvW8hfN0JV9rSnycblX4PXTMdlo',
};

export const SAUCEDEMO_IMAGES = {
  backpack: 'https://www.saucedemo.com/assets/sauce-backpack-1200x1500-CjRW-Djj.jpg',
  bikeLight: 'https://www.saucedemo.com/assets/bike-light-1200x1500-DxcZRFOA.jpg',
  boltShirt: 'https://www.saucedemo.com/assets/bolt-shirt-1200x1500-mR0ldpVS.jpg',
  fleeceJacket: 'https://www.saucedemo.com/assets/sauce-pullover-1200x1500-BfbI-PSd.jpg',
  onesie: 'https://www.saucedemo.com/assets/red-onesie-1200x1500-BrSuq0ic.jpg',
  redTatt: 'https://www.saucedemo.com/assets/red-tatt-1200x1500-E-qp6aYf.jpg',
  sl404: 'https://www.saucedemo.com/assets/sl-404-Cq1a9k9X.jpg',
  ponyExpress: 'https://www.saucedemo.com/assets/pony-express-BrqDAGzL.png',
  checkmark: 'https://www.saucedemo.com/assets/checkmark-VLWQafip.png'
};

export const INITIAL_ISSUES: DetectedIssue[] = [
  {
    id: 'iss-1',
    key: 'MQA-101',
    title: 'Broken product image 404 on problem_user inventory',
    area: 'PLP',
    severity: 'critical',
    status: 'open',
    firstSeen: 'Oct 24, 14:12',
    lastSeen: 'Just now',
    persona: 'problem_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'Sloth image or 404 dog photo replaced standard product asset for Sauce Labs Fleece Jacket (item #4). Request returns HTTP 404.',
    reproSteps: [
      '1. Authenticate with username problem_user and password secret_sauce.',
      '2. Navigate to https://www.saucedemo.com/inventory.html.',
      '3. Inspect item 4 image asset src.'
    ],
    expected: 'Sauce Labs Fleece Jacket asset loads with HTTP 200.',
    actual: 'HTTP 404 Not Found, fallback sloth/dog image rendered.',
    screenshotThumbnail: SAUCEDEMO_IMAGES.sl404,
    stackTrace: 'NetworkError: GET https://www.saucedemo.com/static/media/sl-404.jpg 404 (Not Found)\n    at HTMLImageElement.<anonymous> (inventory.js:142:9)'
  },
  {
    id: 'iss-2',
    key: 'MQA-102',
    title: 'Price anomaly: Item #4 subtotal calculation yields $0.00',
    area: 'Checkout Flow',
    severity: 'critical',
    status: 'open',
    firstSeen: 'Oct 24, 14:15',
    lastSeen: '2 mins ago',
    persona: 'problem_user',
    url: 'https://www.saucedemo.com/checkout-step-two.html',
    description: 'Checkout Step Two subtotal displays $0.00 instead of $49.99 when problem_user checks out Sauce Labs Fleece Jacket.',
    reproSteps: [
      '1. Login as problem_user.',
      '2. Add Sauce Labs Fleece Jacket to cart.',
      '3. Proceed through checkout-step-one.html to step two.',
      '4. Inspect summary subtotal label.'
    ],
    expected: 'Item total: $49.99',
    actual: 'Item total: $0.00',
    screenshotThumbnail: SAUCEDEMO_IMAGES.fleeceJacket,
    stackTrace: 'AssertionError: expected subtotal "$49.99" but received "$0.00"\n    at CheckoutStepTwoPage.verifySubtotal (checkout.spec.ts:42:15)'
  },
  {
    id: 'iss-3',
    key: 'MQA-103',
    title: 'Duplicate image asset hash detected on items #1 and #4',
    area: 'PLP',
    severity: 'high',
    status: 'open',
    firstSeen: 'Oct 24, 13:40',
    lastSeen: '5 mins ago',
    persona: 'visual_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'Scraper image perceptual hash match between Sauce Labs Backpack and Fleece Jacket thumbnail.',
    reproSteps: [
      '1. Login as visual_user.',
      '2. Run automated perceptual hash comparison on PLP catalog.'
    ],
    expected: 'Unique image assets for each distinct SKU.',
    actual: 'Asset hash collision: img_sl_backpack.jpg reused on #4.',
    screenshotThumbnail: SAUCEDEMO_IMAGES.backpack
  },
  {
    id: 'iss-4',
    key: 'MQA-104',
    title: 'Missing checkout postal code validation bypass',
    area: 'Checkout Flow',
    severity: 'high',
    status: 'in_review',
    firstSeen: 'Oct 24, 12:20',
    lastSeen: '18 mins ago',
    persona: 'error_user',
    url: 'https://www.saucedemo.com/checkout-step-one.html',
    description: 'Special character injection in Zip/Postal Code triggers silent unhandled exception preventing Continue action.',
    reproSteps: [
      '1. Login as error_user.',
      '2. Go to checkout step one.',
      '3. Enter postal code containing symbols: ##$$@@.',
      '4. Click Continue.'
    ],
    expected: 'Friendly validation error: "Postal Code is invalid".',
    actual: 'Page frozen; unhandled error in console.',
    stackTrace: 'TypeError: Cannot read properties of undefined (reading "replace")\n    at validatePostalCode (checkoutStepOne.js:88:24)'
  },
  {
    id: 'iss-5',
    key: 'MQA-105',
    title: 'Locked out user receives vague generic error banner',
    area: 'Auth',
    severity: 'medium',
    status: 'open',
    firstSeen: 'Oct 24, 11:05',
    lastSeen: '25 mins ago',
    persona: 'locked_out_user',
    url: 'https://www.saucedemo.com/',
    description: 'Epic sadface banner text lacks recovery contact or reset password direction.',
    reproSteps: [
      '1. Enter locked_out_user on login form.',
      '2. Submit form.'
    ],
    expected: 'Clear security lockout notice with support instructions.',
    actual: 'Generic "Epic sadface: Sorry, this user has been locked out."'
  },
  {
    id: 'iss-6',
    key: 'MQA-106',
    title: 'Sloth image replaces standard jacket graphic',
    area: 'Review Pin',
    severity: 'critical',
    status: 'open',
    firstSeen: 'Oct 24, 14:22',
    lastSeen: '10 mins ago',
    persona: 'problem_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'Visual pin #1 dropped on Product Card 4 highlighting broken sloth graphic replacement.',
    reproSteps: ['1. Open inventory.html with bookmarklet enabled. 2. Click Pin #1.'],
    expected: 'Proper technical jacket render.',
    actual: 'Funny animal graphic replacing catalog merchandise.',
    screenshotThumbnail: SAUCEDEMO_IMAGES.sl404
  },
  {
    id: 'iss-7',
    key: 'MQA-107',
    title: 'Checkout button 4px alignment offset on Safari WebKit',
    area: 'Review Pin',
    severity: 'high',
    status: 'in_review',
    firstSeen: 'Oct 24, 10:15',
    lastSeen: '1 hour ago',
    persona: 'visual_user',
    url: 'https://www.saucedemo.com/cart.html',
    description: 'Pin #2: Button margin is misaligned with the table right border on mobile Safari viewport.',
    reproSteps: ['1. Emulate iPhone 14 Pro Max in WebKit. 2. Navigate to /cart.html.'],
    expected: 'Perfect right-alignment with subtotal line.',
    actual: '4px negative margin overhang.'
  },
  {
    id: 'iss-8',
    key: 'MQA-108',
    title: 'Missing currency symbol on discount promotion banner',
    area: 'Review Pin',
    severity: 'medium',
    status: 'fixed',
    firstSeen: 'Oct 23, 16:40',
    lastSeen: '2 hours ago',
    persona: 'standard_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'Pin #3: Formatting glitch causing missing $ symbol on promotional banner.',
    reproSteps: ['1. Observe top announcement banner on inventory.html.'],
    expected: 'Special offer: Save $5 today.',
    actual: 'Special offer: Save 5 today.'
  },
  {
    id: 'iss-9',
    key: 'MQA-109',
    title: 'Performance glitch user experiences 5200ms latency on login',
    area: 'Auth',
    severity: 'medium',
    status: 'open',
    firstSeen: 'Oct 24, 09:30',
    lastSeen: '30 mins ago',
    persona: 'performance_glitch_user',
    url: 'https://www.saucedemo.com/',
    description: 'Artificial latency simulation stalls browser thread during auth dispatch.',
    reproSteps: ['1. Login with performance_glitch_user.', '2. Measure navigation time.'],
    expected: 'Page transition under 800ms.',
    actual: 'Elapsed time 5240ms.'
  },
  {
    id: 'iss-10',
    key: 'MQA-110',
    title: 'Missing alt attribute on Sauce Labs Bike Light thumbnail',
    area: 'PLP',
    severity: 'low',
    status: 'resolved',
    firstSeen: 'Oct 23, 11:10',
    lastSeen: '3 hours ago',
    persona: 'standard_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'WCAG AA 1.1.1 failure: Image tag lacks meaningful alt text.',
    reproSteps: ['1. Run axe-core accessibility audit on inventory.html.'],
    expected: 'alt="Sauce Labs Bike Light"',
    actual: 'alt=""'
  },
  {
    id: 'iss-11',
    key: 'MQA-111',
    title: 'Deep link navigation to PDP item 4 returns 500 server error',
    area: 'PDP',
    severity: 'critical',
    status: 'open',
    firstSeen: 'Oct 24, 14:00',
    lastSeen: '12 mins ago',
    persona: 'problem_user',
    url: 'https://www.saucedemo.com/inventory-item.html?id=4',
    description: 'Direct URL access to product detail page crashes with unhandled exception for problem_user.',
    reproSteps: ['1. Direct navigate to /inventory-item.html?id=4 while problem_user cookie is set.'],
    expected: 'Product detail page renders.',
    actual: 'White screen of death.'
  },
  {
    id: 'iss-12',
    key: 'MQA-112',
    title: 'Add to cart button text does not toggle to Remove',
    area: 'PLP',
    severity: 'high',
    status: 'in_review',
    firstSeen: 'Oct 24, 13:10',
    lastSeen: '40 mins ago',
    persona: 'problem_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'Clicking Add to Cart fails to update button DOM state on item #1.',
    reproSteps: ['1. Login as problem_user. 2. Click Add to cart on item #1.'],
    expected: 'Button changes to Remove with red border.',
    actual: 'Button stays Add to cart; item count increments in badge.'
  },
  {
    id: 'iss-13',
    key: 'MQA-113',
    title: 'Sorting dropdown (Z to A) fails to reorder items',
    area: 'PLP',
    severity: 'high',
    status: 'open',
    firstSeen: 'Oct 24, 12:45',
    lastSeen: '50 mins ago',
    persona: 'problem_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'Changing select filter to Name (Z to A) does not trigger array sort re-render.',
    reproSteps: ['1. Select option "za" in sort dropdown.'],
    expected: 'Catalog sorted alphabetically descending.',
    actual: 'Original alphabetical ascending order persists.'
  },
  {
    id: 'iss-14',
    key: 'MQA-114',
    title: 'Footer social links open in same tab destroying cart state',
    area: 'PLP',
    severity: 'medium',
    status: 'fixed',
    firstSeen: 'Oct 23, 15:20',
    lastSeen: '4 hours ago',
    persona: 'standard_user',
    url: 'https://www.saucedemo.com/inventory.html',
    description: 'Twitter / LinkedIn / Facebook icons lack target="_blank" and rel="noreferrer".',
    reproSteps: ['1. Add items to cart. 2. Click Twitter link in footer.'],
    expected: 'External link opens in new browser tab.',
    actual: 'Page navigates away in same tab.'
  }
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 4,
    name: 'Sauce Labs Backpack',
    price: 29.99,
    extractedPriceStr: '$29.99',
    imgUrl: SAUCEDEMO_IMAGES.backpack,
    isBrokenImage: false,
    isDuplicateAsset: false,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=4',
    status: 'valid',
    statusLabel: 'Valid'
  },
  {
    id: 0,
    name: 'Sauce Labs Bike Light',
    price: 9.99,
    extractedPriceStr: '$9.99',
    imgUrl: SAUCEDEMO_IMAGES.bikeLight,
    isBrokenImage: false,
    isDuplicateAsset: false,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=0',
    status: 'valid',
    statusLabel: 'Valid'
  },
  {
    id: 1,
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
    extractedPriceStr: '$15.99',
    imgUrl: SAUCEDEMO_IMAGES.boltShirt,
    isBrokenImage: false,
    isDuplicateAsset: false,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=1',
    status: 'valid',
    statusLabel: 'Valid'
  },
  {
    id: 5,
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
    extractedPriceStr: '$49.99',
    imgUrl: SAUCEDEMO_IMAGES.fleeceJacket,
    isBrokenImage: false,
    isDuplicateAsset: false,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=5',
    status: 'valid',
    statusLabel: 'Valid'
  },
  {
    id: 2,
    name: 'Sauce Labs Onesie',
    price: 7.99,
    extractedPriceStr: '$7.99',
    imgUrl: SAUCEDEMO_IMAGES.onesie,
    isBrokenImage: false,
    isDuplicateAsset: false,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=2',
    status: 'valid',
    statusLabel: 'Valid'
  },
  {
    id: 3,
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
    extractedPriceStr: '$15.99',
    imgUrl: SAUCEDEMO_IMAGES.redTatt,
    isBrokenImage: false,
    isDuplicateAsset: false,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=3',
    status: 'valid',
    statusLabel: 'Valid'
  }
];

export const PROBLEM_USER_PRODUCTS: ProductItem[] = [
  {
    id: 4,
    name: 'Sauce Labs Backpack',
    price: 29.99,
    extractedPriceStr: '$29.99',
    imgUrl: SAUCEDEMO_IMAGES.sl404,
    isBrokenImage: true,
    isDuplicateAsset: true,
    duplicateNote: 'Asset hash sl-404.jpg replaced default backpack image',
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=4',
    status: 'critical',
    statusLabel: 'Image 404 Not Found'
  },
  {
    id: 0,
    name: 'Sauce Labs Bike Light',
    price: 9.99,
    extractedPriceStr: '$9.99',
    imgUrl: SAUCEDEMO_IMAGES.sl404,
    isBrokenImage: true,
    isDuplicateAsset: true,
    duplicateNote: 'Reused asset sl-404.jpg across multiple items',
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=0',
    status: 'critical',
    statusLabel: 'Image 404 Not Found'
  },
  {
    id: 1,
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
    extractedPriceStr: '$15.99',
    imgUrl: SAUCEDEMO_IMAGES.sl404,
    isBrokenImage: true,
    isDuplicateAsset: true,
    duplicateNote: 'Reused asset sl-404.jpg',
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=1',
    status: 'critical',
    statusLabel: 'Image 404 Not Found'
  },
  {
    id: 5,
    name: 'Sauce Labs Fleece Jacket',
    price: 0.00,
    extractedPriceStr: '$0.00',
    imgUrl: SAUCEDEMO_IMAGES.sl404,
    isBrokenImage: true,
    isDuplicateAsset: true,
    duplicateNote: 'Image 404 + Price Glitch $0.00',
    isPriceGlitch: true,
    missingDescription: false,
    location: 'PDP /inventory-item.html?id=5',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=5',
    status: 'critical',
    statusLabel: 'Zero Price ($0.00) & 404'
  },
  {
    id: 2,
    name: 'Sauce Labs Onesie',
    price: 7.99,
    extractedPriceStr: '$7.99',
    imgUrl: SAUCEDEMO_IMAGES.sl404,
    isBrokenImage: true,
    isDuplicateAsset: true,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=2',
    status: 'critical',
    statusLabel: 'Image 404 Not Found'
  },
  {
    id: 3,
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
    extractedPriceStr: '$15.99',
    imgUrl: SAUCEDEMO_IMAGES.sl404,
    isBrokenImage: true,
    isDuplicateAsset: true,
    isPriceGlitch: false,
    missingDescription: false,
    location: 'PLP /inventory.html',
    deepLink: 'https://www.saucedemo.com/inventory-item.html?id=3',
    status: 'critical',
    statusLabel: 'Image 404 Not Found'
  }
];

export const INITIAL_TEST_SUITES: TestSuite[] = [
  {
    id: 'suite-1',
    name: 'End-to-End Checkout Journey',
    persona: 'standard_user',
    status: 'passed',
    totalDurationMs: 1195,
    steps: [
      { name: 'Step 1: Login with valid credentials', durationMs: 210, status: 'passed' },
      { name: 'Step 2: Add 2 items to cart (Sauce Labs Backpack, Bike Light)', durationMs: 145, status: 'passed' },
      { name: 'Step 3: Verify badge count updates to "2"', durationMs: 50, status: 'passed' },
      { name: 'Step 4: Complete Checkout Step One (First Name, Last Name, Zip)', durationMs: 320, status: 'passed' },
      { name: 'Step 5: Verify Order Overview total ($43.18)', durationMs: 90, status: 'passed' },
      { name: 'Step 6: Click Finish and verify "THANK YOU FOR YOUR ORDER"', durationMs: 180, status: 'passed' }
    ]
  },
  {
    id: 'suite-2',
    name: 'Checkout Step Two - Problem User Price Glitch',
    persona: 'problem_user',
    status: 'failed',
    totalDurationMs: 840,
    steps: [
      { name: 'Step 1: Authenticate as "problem_user"', durationMs: 190, status: 'passed' },
      { name: 'Step 2: Add "Sauce Labs Fleece Jacket" to cart', durationMs: 110, status: 'passed' },
      { name: 'Step 3: Proceed to /checkout-step-two.html', durationMs: 240, status: 'passed' },
      {
        name: 'Step 4: Assert subtotal matches item price',
        durationMs: 300,
        status: 'failed',
        error: 'AssertionError: expected subtotal "$49.99" but received "$0.00"',
        codeExcerpt: '40:  const subtotal = await page.locator(".summary_subtotal_label").innerText();\n41:  console.log(`Extracted subtotal: ${subtotal}`);\n42:> expect(subtotal).toContain("$49.99"); // FAILED: received "Item total: $0.00"',
        screenshotThumbnail: SAUCEDEMO_IMAGES.sl404
      }
    ]
  },
  {
    id: 'suite-3',
    name: 'Negative & Edge Cases (Invalid Login, Locked Out, Empty Cart)',
    persona: 'locked_out_user',
    status: 'passed',
    totalDurationMs: 620,
    steps: [
      { name: 'Step 1: Attempt login with empty fields and assert username required error', durationMs: 160, status: 'passed' },
      { name: 'Step 2: Attempt login with locked_out_user and assert lockout banner', durationMs: 220, status: 'passed' },
      { name: 'Step 3: Attempt checkout with empty shopping cart and assert disabled state', durationMs: 240, status: 'passed' }
    ]
  },
  {
    id: 'suite-4',
    name: 'Cart Removal & Reset State Lifecycle',
    persona: 'standard_user',
    status: 'passed',
    totalDurationMs: 710,
    steps: [
      { name: 'Step 1: Login and add all 6 catalog items', durationMs: 260, status: 'passed' },
      { name: 'Step 2: Assert cart badge displays "6"', durationMs: 70, status: 'passed' },
      { name: 'Step 3: Remove 3 items sequentially and verify badge decrements to "3"', durationMs: 210, status: 'passed' },
      { name: 'Step 4: Open menu drawer and execute "Reset App State"', durationMs: 170, status: 'passed' }
    ]
  }
];

export const INITIAL_PINS: ReviewPin[] = [
  {
    id: 'pin-1',
    xPercent: 78,
    yPercent: 32,
    title: 'Broken Image 404 on Product Card 4',
    description: 'Sloth image replaced standard jacket graphic. Network monitor shows 404 response on /static/media/sl-404.jpg.',
    severity: 'critical',
    pageUrl: 'https://www.saucedemo.com/inventory.html',
    elementSelector: '.inventory_item:nth-child(4) img',
    timestamp: '12 mins ago',
    author: 'SDET Alex K.',
    status: 'open'
  },
  {
    id: 'pin-2',
    xPercent: 88,
    yPercent: 84,
    title: 'Button Misalignment on Safari WebKit',
    description: '4px offset on Safari WebKit viewport. Right edge overshoots the container padding grid.',
    severity: 'high',
    pageUrl: 'https://www.saucedemo.com/inventory.html',
    elementSelector: '#checkout',
    timestamp: '45 mins ago',
    author: 'QA Lead Maya S.',
    status: 'in_review'
  },
  {
    id: 'pin-3',
    xPercent: 52,
    yPercent: 62,
    title: 'Formatting Glitch on Currency Tag',
    description: 'Missing decimal currency symbol on discount banner. Expected $29.99, rendered 29.99.',
    severity: 'medium',
    pageUrl: 'https://www.saucedemo.com/inventory.html',
    elementSelector: '.inventory_item_price:nth-child(2)',
    timestamp: '2 hours ago',
    author: 'Automation Bot',
    status: 'open'
  }
];

export const INITIAL_RUNS: ExecutionRun[] = [
  {
    id: 'run-882',
    timestamp: '8 mins ago',
    persona: 'problem_user',
    targetRoute: '/checkout-step-two.html',
    findings: 'Price calculation glitch: item #4 price returned $0.00 subtotal',
    status: 'failed',
    duration: '0.84s',
    suiteName: 'Checkout Step Two - Problem User'
  },
  {
    id: 'run-881',
    timestamp: '14 mins ago',
    persona: 'standard_user',
    targetRoute: '/checkout-complete.html',
    findings: 'All 6 checkout steps verified successfully with $43.18 total',
    status: 'passed',
    duration: '1.19s',
    suiteName: 'End-to-End Checkout Journey'
  },
  {
    id: 'run-880',
    timestamp: '22 mins ago',
    persona: 'problem_user',
    targetRoute: '/inventory.html',
    findings: 'Dog/sloth placeholder image replaced 6 product card graphics (HTTP 404)',
    status: 'warning',
    duration: '3.40s',
    suiteName: 'Content Scraper Runner'
  },
  {
    id: 'run-879',
    timestamp: '38 mins ago',
    persona: 'locked_out_user',
    targetRoute: '/',
    findings: 'Lockout error prompt correctly displayed for blocked account credentials',
    status: 'passed',
    duration: '0.62s',
    suiteName: 'Negative & Edge Cases'
  },
  {
    id: 'run-878',
    timestamp: '1 hour ago',
    persona: 'standard_user',
    targetRoute: '/cart.html',
    findings: 'State reset lifecycle cleared 6 items and refreshed session storage',
    status: 'passed',
    duration: '0.71s',
    suiteName: 'Cart Removal & Reset State'
  }
];
