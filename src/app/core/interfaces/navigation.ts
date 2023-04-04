import {Injectable} from '@angular/core';
import { GetUserDataService } from '../helper/get-user-data.service';
import { EncryptionService } from '../services/encryption.service';
import { StorageService } from '../services/storage.service';
import { PermissionsDetail, User } from './user';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  function?: any;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}
//dataUser!:User;


const NavigationItems = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'user',
        title: 'users',
        type: 'collapse',
        url: '/users',
        icon: 'assets/images/menu/users.png',
        classes: 'nav-item',
        function:async ()=>{
          let getUserDataService = new GetUserDataService();
          let permission:any = await getUserDataService.getPermissionChild("menupermissions","user_view_main");
         return {
          permission:permission
         }
        },
        children: [
          {
            id: 'view_users',
            title: 'view_users',
            type: 'item',
            url: '/users/list',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","user_view_list_users");
              return {
                permission:permission
              }
            }
          },
          {
            id: 'add_user',
            title: 'add_user',
            type: 'item',
            url: '/users/create-edit-user',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","user_create_user");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'my_user',
            title: 'my_user',
            type: 'item',
            url: '/my-user',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","user_show_my_user");
             return {
              permission:permission
             }
            }
          }
        ]
      },
      {
        id: 'company',
        title: 'business',
        type: 'collapse',
        url: '/business/list-business',
        icon: 'assets/images/menu/business.png',
        classes: 'nav-item',
        function:async ()=>{
          let getUserDataService = new GetUserDataService();
          let permission:any = await getUserDataService.getPermissionChild("menupermissions","company_view_main");
         return {
          permission:permission
         }
        },
        children: [
          {
            id: 'business_list',
            title: 'view_company',
            type: 'item',
            url: '/business/list-business',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","company_view_list_companies");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'register_business',
            title: 'register_business',
            type: 'item',
            url: '/business/create-edit-business',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","company_create_company");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'delete_business',
            title: 'delete_company',
            type: 'item',
            url: '/business/delete-business',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","company_delete_a_company");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'register_business_group',
            title: 'register_business_group',
            type: 'item',
            url: '/business-group',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","companygroup_view_list");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'register_commodity',
            title: 'register_commodity',
            type: 'item',
            url: '/commodity',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","commodity_view_list");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'actortype',
            title: 'register_actor_type',
            type: 'item',
            url: '/type-actor',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","actortype_view_list");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'assign_validation_company',
            title: 'assign_company_to_validator',
            type: 'item',
            url: '/geographic-information/assign-company-validator',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","company_assign_validator_list");
             return {
              permission:permission
             }
            }
          },
          /* {
            id: 'assign_validation_company',
            title: 'assign_validator',
            type: 'item',
            url: '/geographic-information/assign-validator',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("validatecompany","assign_validation_company");
             return {
              permission:permission
             }
            }
          }, */
          {
            id: 'validate_coordinates',
            title: 'validate_coordinates',
            type: 'item',
            url: '/geographic-information/validate-company',//validar trazabilidad??
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","company_list_validation_list");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'assign_company_to_verifier',
            title: 'assign_company_to_verifier',
            type: 'item',
            url: '/geographic-information/assign-company-verify',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","company_assign_verificator_list");
             return {
              permission:permission
             }
            }
          },
          /* {
            id: 'assign_verify_company',
            title: 'assign_checker',
            type: 'item',
            url: '/geographic-information/assign-checker',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("verifycompany","assign_verification_company");//assing_validation_company??
             return {
              permission:permission
             }
            }
          }, */
          {
            id: 'check_coordinates',
            title: 'check_coordinates',
            type: 'item',
            url: '/geographic-information/verify-company',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","company_list_verification_list");//assing_validation_company??
             return {
              permission:permission
             }
            }
          },
         
          
        ]
      },
      {
        id: 'questionbank',
        title: 'question_bank',
        type: 'collapse',
        icon: 'assets/images/menu/question_bank.png',
        function:async ()=>{
          let getUserDataService = new GetUserDataService();
          let permission:any = await getUserDataService.getPermissionChild("menupermissions","bankquestion_view_main");
         return {
          permission:permission
         }
        },
        children: [
          {
            id: 'question_bank',
            title: 'view_questions',
            type: 'item',
            url: '/question-bank',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","bankquestion_view_list_bankquestions");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'category',
            title: 'register_categories',
            type: 'item',
            url: '/categories/categories',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","bankquestion_view_list_categories");
             return {
              permission:permission
             }
            }
          },{
            id: 'subcategory',
            title: 'register_subcategories',
            type: 'item',
            url: '/categories/subcategories',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","bankquestion_view_list_subcategories");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'topic',
            title: 'register_topics',
            type: 'item',
            url: '/categories/topics',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","bankquestion_view_list_topics");
             return {
              permission:permission
             }
            }
          }
        ]
      },
      {
        id: 'proforestform',
        title: 'forms',
        type: 'collapse',
        icon: 'assets/images/menu/forms.png',
        function:async ()=>{
          let getUserDataService = new GetUserDataService();
          let permission:any = await getUserDataService.getPermissionChild("menupermissions","formularios_view_main");
         return {
          permission:permission
         }
        },
        children: [
          // {OJO ELIMINAR SI ALGO POR QUE APUNTAN AL MISMO LADO?
          //   id: 'view_proforestform',
          //   title: 'view_proforestform',
          //   type: 'item',
          //   url: '/forms/list-forms',
          //   function:async ()=>{
          //     let getUserDataService = new GetUserDataService();
          //     let permission:any = await getUserDataService.getPermissionChild("proforestform","view_formulario");
          //    return {
          //     permission:permission
          //    }
          //   }
          // },
          {
            id: 'view_formulario',   
            title: 'view_proforestform',
            type: 'item',
            url: '/forms/list-forms',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","formularios_view_list_formularios");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'assign_forms',
            title: 'assign_forms',
            type: 'item',
            url: '/forms/assing-form',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","formularios_assign_formularios_list");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'valid_forms',
            title: 'validate_forms',
            type: 'item',
            url: '/forms/validated-forms',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","formularios_list_formularios_to_validate");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'verify_forms',
            title: 'verify_forms',
            type: 'item',
            url: '/forms/verified-forms',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","formularios_list_formularios_to_verify");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'assign_validator_for_forms',
            title: 'assign_validator_for_forms',
            type: 'item',
            url: '/forms/validate-forms/validate-form-list',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","formularios_assign_formularios_validator");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'assign_checker_for_forms',
            title: 'assign_checker_for_forms',
            type: 'item',
            url: '/forms/validate-forms/verify-form-list',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","formularios_assign_formularios_verificator");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'view_forms_result',
            title: 'view_forms_result',
            type: 'item',
            url: '/forms/view-forms',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","formularios_view_results_list");
             return {
              permission:permission
             }
            }
          }
        ]
      },
      {
        id: 'supplybaseregister',
        title: 'supply_base',
        type: 'collapse',
        icon: 'assets/images/menu/supply_base.png',
        function:async ()=>{
          let getUserDataService = new GetUserDataService();
          let permission:any = await getUserDataService.getPermissionChild("menupermissions","supplybase_view_main");
         return {
          permission:permission
         }
        },
        children: [
          {
            id: 'traceability',
            title: 'my_tracebility',
            type: 'item',
            url: '/traceability',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","supplybase_view_list");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'assign_validation_company',
            title: 'assign_validator',
            type: 'item',
            url: '/geographic-information/assign-validator',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","supplybase_assign_supplybase_validator");
             return {
              permission:permission
             }
            }
          },
        
          {
            id: 'assign_verify_company',
            title: 'assign_checker',
            type: 'item',
            url: '/geographic-information/assign-checker',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","supplybase_assign_supplybase_verificator");//assing_validation_company??
             return {
              permission:permission
             }
            }
          },
          {
            id: 'validate_coordinates',
            title: 'validate_traceability',
            type: 'item',
            url: '/geographic-information/validate-traceability',//validar trazabilidad??
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","supplybase_list_supplybase_to_validate");
             return {
              permission:permission
             }
            }
          },
          {
            id: 'verify_traceability',
            title: 'verify_traceability',
            type: 'item',
            url: '/geographic-information/verify-traceability',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","supplybase_list_supplybase_to_verify");//assing_validation_company??
             return {
              permission:permission
             }
            }
          },
          {
            id: 'supply-base-resumen',
            title: 'supply_base_resumen',
            type: 'item',
            url: '/supply-base',
            function:async ()=>{
              let getUserDataService = new GetUserDataService();
              let permission:any = await getUserDataService.getPermissionChild("menupermissions","supplybase_view_supplybase_resume_list");//assing_validation_company??
             return {
              permission:permission
             }
            }
          }
        ]
      },
      {
        id: 'exit',
        title: 'exit',
        type: 'item',
        url: '/exit',
        icon: 'assets/images/menu/exit.png',
        classes: 'nav-item',
      }
    ]
  }
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}
