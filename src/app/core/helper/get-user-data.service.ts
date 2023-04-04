import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { EncryptionService } from '../services/encryption.service';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class GetUserDataService {
  constructor() {}

  dataUser!: User;
  async getPermissionChild(permissions_detail: string, permission: string) {
    const _storageService = new StorageService(new EncryptionService());

    return await _storageService.get('keyData').then((resp: User) => {
      let dataUser: any = resp;
      /*  let permissions_detail:string = "company"
              let permission = "can_view_validationcompany"; */
      let per = false;
      try {
        let permissions: Array<any> = dataUser.permissions_detail[permissions_detail];
        let view = permissions.find((e) => e == permission);
        if (view) {
          per = true;
        } else {
          per = false;
        }
      } catch (error) {
        per = false;
      }
      return per;
    });
  }

  async getRol(){
    const _storageService = new StorageService(new EncryptionService());

    return await _storageService.get('keyData').then((resp: User) => {
      let dataUser: User = resp;
      return dataUser.groups.name;
    })
  }
  test() {
    let getUserDataService = new StorageService(new EncryptionService());
  }
}
