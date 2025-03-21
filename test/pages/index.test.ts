import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Page from '@pages/index.astro';
import astroLogo from '@assets/astro.svg';
import background from '@assets/background.svg';

test('Index', async () => {
	const container: AstroContainer = await AstroContainer.create();
	const component: Response = await container.renderToResponse(Page);

	expect(component.status).toBe(200);
	expect(component.headers.get('Content-Type')).toBe('text/html');

	const body: string = await component.text();
	expect(body).toContain('<html lang="en" ');
	expect(body).toContain('<title>Astro Basics</title');
	expect(body).toContain(`<img id="background" src="${background.src.split('?')[0]}`);
	expect(body).toContain(`<img src="${astroLogo.src.split('?')[0]}`);
})