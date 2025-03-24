import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Component from '@components/Welcome.astro';
import astroLogo from '@assets/astro.svg'
import background from '@assets/background.svg';

test('Welcome', async () => {
	const container: AstroContainer = await AstroContainer.create();
	const component: string = await container.renderToString(Component);

	expect(component).toContain(`<img id="background" src="${background.src.split('?')[0]}`);
	expect(component).toContain(`<img src="${astroLogo.src.split('?')[0]}`);
})