import { test, expect } from '@playwright/test';

test.describe('Testing the-internet.herokuapp.com', () => {
    test('Testing checkboxes', async ( {page} ) => {
        await page.goto('https://the-internet.herokuapp.com/checkboxes');

        // Get current checkbox statuses
        expect(await page.getByRole('checkbox').first().isChecked()).toBeFalsy();
        expect(await page.getByRole('checkbox').nth(1).isChecked()).toBeTruthy();

        // Turn first checkbox on, turn second checkbox off then check new statuses
        await page.getByRole('checkbox').first().click();
        await page.getByRole('checkbox').nth(1).click();

        expect(await page.getByRole('checkbox').first().isChecked()).toBeTruthy();
        expect(await page.getByRole('checkbox').nth(1).isChecked()).toBeFalsy();
    });

    test('Hovering', async ( {page} ) => {
        await page.goto('https://the-internet.herokuapp.com/hovers');

        // Hover over an image
        await page.locator('[alt="User Avatar"]').first().hover();
        // Get the object that appears
        let hoverObj = await page.locator('text=name: user1');
        // Get the text content of the object
        let hoverText = await hoverObj.textContent();
        console.log(`HOVER TEXT: ${hoverText}`);
        // Expect the object to be visible
        await expect(hoverObj).toBeVisible();

        // Expect the one of the other objects not to be visible
        let otherObj = await page.locator('text=name: user2');
        await expect(otherObj).not.toBeVisible();

        // Now hover the other object and check it is now visible and the original object is no longer visible
        await page.locator('[alt="User Avatar"]').nth(1).hover();
        let newHoverObj = await page.locator('text=name: user2');
        let newHoverText = await newHoverObj.textContent();
        console.log(`NEW HOVER TEXT: ${newHoverText}`);
        await expect(newHoverObj).toBeVisible();

        let originalObj = await page.locator('text=name: user1');
        await expect(originalObj).not.toBeVisible();

    });

    test.use({storageState: 'user.json'});

    test('Testing an API', async ({request}) => {
        // Test health check GET
        const healthCheck = await request.get('https://practice.expandtesting.com/notes/api/health-check');
        expect(healthCheck.ok()).toBeTruthy();

        const healthJSON = await healthCheck.body();
        console.log(`HEALTH JSON: ${healthJSON}`);

        const healthMsg = JSON.parse(healthJSON).message;
        console.log(`HEALTH MESSAGE: ${healthMsg}`);
        expect(healthMsg).toBe('Notes API is Running');

        // Registered using website 'register' API call: KevinTubb, kevtubb@tiscali.co.uk, PWKev100#
        // Test user logon and get token
        const logon = await request.post('https://practice.expandtesting.com/notes/api/users/login',
            { data: { "email": "kevtubb@tiscali.co.uk", "password": "PWKev100#"}});
        const logonJSON = await logon.body();
        console.log(`LOGON JSON: ${logonJSON}`);

        const logonToken = JSON.parse(logonJSON).data.token;
        console.log(`LOGON TOKEN: ${logonToken}`);
        await request.storageState({path: 'user.json'});

        const logonMsg = JSON.parse(logonJSON).message;
        console.log(`LOGON MESSAGE: ${logonMsg}`);
        expect(logonMsg).toBe('Login successful');

        // Test get user's profile
        const profile = await request.get('https://practice.expandtesting.com/notes/api/users/profile',
            {headers:{ Authorization: `Basic ${logonToken}`}});
        const profileJSON = await profile.body();
        console.log(`PROFILE JSON: ${profileJSON}`);
    });
});
