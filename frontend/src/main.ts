// Punto de entrada del frontend en navegador: arranca Angular montando el componente raiz.
// bootstrapApplication conecta la configuracion global con la aplicacion visible al usuario.

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
