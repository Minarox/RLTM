import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Layout from '@layouts/Layout.astro';

test('Layout', async () => {
	const container: AstroContainer = await AstroContainer.create();
	const component: Response = await container.renderToResponse(Layout);

	expect(component.status).toBe(200);
	expect(component.headers.get('Content-Type')).toBe('text/html');

	const body: string = await component.text();
	console.log(body)
	expect(body).toContain(`<html lang="en" `);
	expect(body).toContain(`<title>Astro Basics</title>`);
	expect(body).toContain(`<meta charset="UTF-8">`);
	expect(body).toContain(`<meta name="viewport" content="width=device-width">`);
	expect(body).toContain(`<meta name="generator" content="Astro v5.5.3">`);
})