// Punto de entrada para renderizado del lado servidor de Angular.
// Se mantiene separado del main.ts del navegador para que el build SSR compile correctamente.

import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);

export default bootstrap;
