# Summit JS SDK

Summit powers engaging apps for sales, marketing, and product teams to deploy and use anywhere.

You can use this SDK to call your Summit apps over API from your website or apps. The SDK isn't mandatory but ensures a correct configuration for Summit's analytics and CRM integration features.

> 🌱 The Summit SDK is fresh out of the oven and in an alpha state. Things might change at any time, but we're happy to collaborate on your implementation and make sure we don't break things going forward.
> You can reach me at [pieter.beulque@usesummit.com](mailto:pieter.beulque@usesummit.com) if you're planning on rolling out your own implementation and have questions or concerns.

## Table of Contents

-   [Node client](#node)
-   [Browser client](#browser)
-   [Browser global](#global)
    -   [Example: Webflow](#example-webflow)

## Node

### Initializing

Initialize a Summit client instance by running:

```ts
import Summit from '@usesummit/sdk';

const summit = new Summit('your-optional-api-key');
```

### Running

Run your app by calling `summit.run()` with these options:

-   `app`: `{ app: 'org-slug/id/app-slug', apiKey: 'app-api-key' }`. You can get this information from the _API_ tab in the project settings dialog. The `apiKey` is optional if you've initialized the client with an API key.
-   `parameters`: a dictionary with your app's parameters. If your leave out any parameters, it will run using the default values in the Summit model driving the app logic.
-   `options`: `{ start?: 'iso-string', end?: 'iso-string', resolution?: 'month' | 'year' | … }`

`run()` returns a `Promise` that resolves into an object with this structure:

```
{
  groups: {
    from: number;
    to: number;
    title: string;
    is_partial: boolean;
  }[],
  results: {
    group: string; // Refers to `groups[].title`
    values: Record<string, number>
  }[]
}
```

You can read more on the API input & output in our [API documentation](https://summit.readme.io/reference/running-your-app).

## Browser

The browser client extends the Node client interface, so the above instructions are also valid for the browser client, except that you import it from `@usesummit/sdk/dist/browser`.

Additionally, you can also use the SDK to embed hosted apps, and identify your visitors.

### Initializing

Initialize a Summit client by providing an API key. By default, session & visitor tracking identifiers are stored in `sessionStorage` and `localStorage` respectively, but you can opt-in to cookies if you prefer that.

```ts
import Summit from '@usesummit/sdk/dist/browser';

const summit = new Summit('your-optional-api-key');

// Store identifiers in cookies
const summit = new Summit({ apiKey: 'your-api-key', cookie: true });

// Configure cookies, for example, to store them on your top-level domain
const summit = new Summit({
    apiKey: 'your-api-key',
    cookie: {
        domain: 'acme.inc',
    },
});
```

### Embedding

Embedding a hosted app is the easiest way to get started with Summit. Add a target div to your HTML, then instruct Summit to embed the div there:

```html
<div id="my-summit-app"></div>
```

```ts
summit.embed(
    { app: 'org-slug/id/app-slug', apiKey: 'app-api-key' },
    '#my-summit-app'
);
```

_Et voila!_. You might want to wrap `my-summit-app` in some styles to enforce an aspect ratio, we found that 9:16 on mobile screens (portrait) and 4:3 on tablets & bigger works well.

Using the `embed()` method will enrich your embed with the session tracking identifiers, so that multiple embeds and `summit.run()` calls can all be linked back to the same visitor.

### Identifying

If you have a newsletter subscription form, an Intercom integration, … that allows you to capture the current user's e-mail address, you can link that to their app usage by calling `summit.identify('email-address')`.

That e-mail address will then be linked to all past and future runs for that user.

## Global

If you're not building your scripts and are working with a site builder like Wix or Webflow, there's a global build available. We'll host this from our own CDN soon, but for now, we recommend using `unpkg`. Given our alpha release stage, make sure you pin a specific version that you can verify is working with your implementation.

```html
<script src="https://unpkg.com/@usesummit/sdk@0.1.0-alpha.2/dist/global.umd.js">
```

Including this script in your HTML will add a `window.Summit` global to your website with an initialized browser client.

You can then configure that client with your API key or cookie settings by calling `window.Summit.configure()`. This method supports the same options as the constructor.

Other than that, all methods supported by the browser client are callable on the global `window.Summit` instance: `window.Summit.run()`, `window.Summit.embed()`, and `window.Summit.identify()`.

### Example: Webflow

```html
<script src="https://unpkg.com/@usesummit/sdk@0.1.0-alpha.2/dist/global.umd.js"></script>

<script>
    window.Summit.configure('my-app-api-key');

    // Fancy number formatting is a browser built-in nowadays
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });

    function initCalculator() {
        const form = document.getElementsByClassName('js-rev-share-form')[0];
        const runway = document.getElementsByClassName(
            'js-rev-share-output-runway'
        )[0];
        const repaymentCap = document.getElementsByClassName(
            'js-rev-share-output-repayment-cap'
        )[0];

        // Set initial values, you can't do that directly in Webflow for some reason
        form.querySelector('[name=cash_balance]').value = '50k';
        form.querySelector('[name=mrr]').value = '25k';
        form.querySelector('[name=mrr_growth_rate]').value = '8';
        form.querySelector('[name=monthly_burn]').value = '50k';
        form.querySelector('[name=loan_amount]').value = '100k';
        form.querySelector('[name=rev_share_pct]').value = '7.5';

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Basic input validation
            let isValid = true;

            Array.from(
                form.querySelectorAll('input:not([type=submit])')
            ).forEach(function (input) {
                if (!input.value) {
                    input.classList.add('has-error');
                    isValid = false;
                } else {
                    input.classList.remove('has-error');
                }
            });

            if (!isValid) {
                return false;
            }

            const formData = new FormData(form);

            // Show a loading state on the button
            const button = form.querySelector('[type=submit]');

            const initialButtonLabel = button.value;

            button.value = 'Simulating…';
            button.setAttribute('disabled', 'disabled');
            button.style.opacity = 0.6;

            window.Summit.run('my-org/31159e/my-app', formData).then(function (
                response
            ) {
                // Undo loading state on the button
                button.value = initialButtonLabel;
                button.removeAttribute('disabled');
                button.style.opacity = 1;

                // This is where you process your results
                // In this example, we find the month where `checking_account` (an output value in Summit)
                // goes below zero
                const negativeIndex = response.results.findIndex(function (
                    result
                ) {
                    const checkingBalance = result.values.checking_account;
                    return (
                        typeof checkingBalance === 'number' &&
                        checkingBalance <= 0
                    );
                });

                // Show number of months before the checking account goes below zero
                runway.textContent =
                    negativeIndex === -1
                        ? '∞'
                        : negativeIndex === 0
                        ? 'One month'
                        : `${negativeIndex + 1} months`;

                // Show another value
                repaymentCap.textContent = formatter.format(
                    response.results[0].values.repayment_cap
                );

                runway.style.display = 'block';
                repaymentCap.style.display = 'block';
            });

            return false;
        });
    }

    if (['loaded', 'interactive', 'complete'].includes(document.readyState)) {
        initCalculator();
    } else {
        document.addEventListener('DOMContentLoaded', initCalculator);
    }
</script>
```
