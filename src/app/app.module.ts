import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PublicModule } from './public/public.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PrivateModule } from './private/private.module';
import { ComponentsModule } from './core/components/components.module';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';
import { ModulesModule } from './core/modules/modules.module';
import { MessageService } from 'primeng/api';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

/* import { RECAPTCHA_V3_SITE_KEY, RecaptchaModule } from "ng-recaptcha"; */

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [HttpClient]
        }
    }),
    AppRoutingModule,
    PublicModule,
    PrivateModule,
    ComponentsModule,
    GoogleMapsModule,
    ModulesModule,
    NgChartsModule,
    /* RecaptchaModule */    
  ],
  providers: [
    GoogleMap,
    MessageService,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
