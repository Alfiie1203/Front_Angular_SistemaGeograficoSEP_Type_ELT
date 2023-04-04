// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  path: 'http://localhost:8000/',
  keyMap: 'AIzaSyDPiVA9x6QtPLCKrFJdeWtDeI3yyVr7RvU',
  oneDrive: {
    userId: '5c62e447-487f-4751-834e-2c4df9e5c91b',
    uploadId: 'b!-bAvtnshC0yO-GixBzema1VGuTPCqQVDv6_1e0GwKpz9PJt0FpykT405K88iYe6S'
  },
  pathGraph: 'https://graph.microsoft.com/v1.0/',
  recaptcha: {
    siteKey: '6LcExEkkAAAAAAwZfZ43yIYZYooY6ub-5B6vEgcl',
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *https://graph.microsoft.com/v1.0/users/5c62e447-487f-4751-834e-2c4df9e5c91b/drive/root/children
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
