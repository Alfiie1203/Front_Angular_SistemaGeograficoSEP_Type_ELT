import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Proforest';

  constructor(private translateService: TranslateService){
    let langLocal = navigator.language.split('-')[0];
    switch (langLocal) {
      case 'es':
        langLocal = JSON.stringify({"name":"assets/images/esp.png","code":"es"})
        break;
      case 'pt':
        langLocal = JSON.stringify({"name":"assets/images/bra.png","code":"pt"})
        break;
      case 'en':
        langLocal = JSON.stringify({"name":"assets/images/eng.png","code":"en"})
        break;
      default:
        langLocal = JSON.stringify({"name":"assets/images/esp.png","code":"es"})
        break;
    }
    const temL = localStorage.getItem('lang')!;
    let getLang:any;
    if(this.isJsonString(temL)){
      getLang = JSON.parse(temL);
    }
    
    if(getLang){
        this.translateService.setDefaultLang(getLang.code);
        this.translateService.use(getLang.code);
    }else{
      const tempLang = JSON.parse(langLocal);
      localStorage.setItem('lang', langLocal)
      this.translateService.setDefaultLang(tempLang.code);
      this.translateService.use(tempLang.code);
    }
    // this.translateService.addLangs(['es ','en', 'pt']);
  }

  isJsonString(str:any) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
}
