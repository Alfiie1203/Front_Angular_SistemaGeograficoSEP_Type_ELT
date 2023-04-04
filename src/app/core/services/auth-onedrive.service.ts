import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthOnedriveService {

  configOneDrive = environment.oneDrive;
  tokenOnedrive='';
  pathGraph = environment.pathGraph
  
  constructor(
    private http: HttpClient
  ) { 
    // this.tokenOnedrive = localStorage.getItem('token_onedrive')!;
  }


  private getHeaders(){
    return new Promise(async (resolve, reject) =>{
      this.tokenOnedrive = localStorage.getItem('token_onedrive')!;
        const headers: HttpHeaders = new HttpHeaders({
          Authorization: `Bearer ${this.tokenOnedrive}`
        })
          resolve(headers);
    })
  }

  getResponseOneDrive(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', route:string, data: any={}):Promise<any>{
    return new Promise((resolve, reject)=>{
      this.getHeaders().then((headers)=>{
        const option:any = {
          body: data,
          headers
        };
        this.http.request(method,this.pathGraph+route, option)
        .subscribe({
          next: resp =>{
            resolve(resp);
          },
          error: err =>{
            reject(err);
          }
        })
      })
    })
  }

  private getHeadersUploadSesion(){
    return new Promise(async (resolve, reject) =>{
        const headers: HttpHeaders = new HttpHeaders({
          Authorization: `Bearer ${this.tokenOnedrive}`
        })
          // .set('Content-Language', this.lang.code)
          resolve(headers);
    })
  }

  async uploadFileSesion(file:File, uploadUrl:string): Promise<any>{
    // const fileBuffer = file.arrayBuffer();
    const size_file = file.size;
    const chunk_size = 327680;
    const chunk_number = size_file / chunk_size;
    const chunk_number_mod = size_file % chunk_size;
   // console.log(chunk_number_mod)
    // const chunk_leftover = size_file - (chunk_size * chunk_number);
    // let cont = 1;
    // let uploadIndex: number = 0;
    return new Promise ((resolve, reject)=>{
      const headers:any = {
        'Content-Length': `${size_file}`,
        'Content-Range': `bytes ${0}-${1}/${size_file}` 
      };
      this.http.put(uploadUrl, file, headers).subscribe({
        next: resp => resolve(resp),
        error: err => reject(err)
      })
    })
    // while(true){
    //   const progressValue = (cont / chunk_number);
    //   let endIndex = uploadIndex + chunk_size - 1;
    //   let slice: ArrayBuffer;
    //   if (endIndex >= (await fileBuffer).byteLength) {
    //     endIndex = (await fileBuffer).byteLength - 1;
    //     slice = (await fileBuffer).slice(uploadIndex);
    //   } else {
    //     slice = (await fileBuffer).slice(uploadIndex, endIndex + 1);
    //   }
    //   console.log("Uploading chunk:" + `${uploadIndex}-${endIndex}`);
    //   const headers:any = {
    //     'Content-Length': `${slice.byteLength}`,
    //     'Content-Range': `bytes ${uploadIndex}-${endIndex}/${(await fileBuffer).byteLength}`
    //   };
    //   console.log('headers:', headers)
    //   // const response = await props.graphClient.api(uploadEndpoint).headers(headers).put(slice);
    //   const response:any = await this.http.put(uploadUrl, slice, headers).toPromise();
    //   console.log(response)
    //   if (!response) {
    //     break;
    //   }
    //   if (response.nextExpectedRanges) {
    //     //Get the next expected range of the slice  
    //     uploadIndex = parseFloat(response.nextExpectedRanges[0]);
    //     cont++;
    //   } else {
    //     //if there is no next range then break the loop          
    //     //Gets the upoaded file response
    //     return response;
    //   }
    //   console.log(progressValue)
    // }
  }


  
}
