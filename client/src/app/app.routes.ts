import { Routes } from '@angular/router';
import { LoginComponent } from '../Pages/login/login.component';
import { SignupComponent } from '../Pages/signup/signup.component';
import { DashboardComponent } from '../Pages/dashboard/dashboard.component';
import { CropComponent } from '../Components/crop/crop.component';
import { ProductDetailsComponent } from '../Components/product-details/product-details.component';
import { SellCropComponent } from '../Components/sell-crop/sell-crop.component';
import { SearchComponent } from '../Components/search/search.component';
import { QueryFormComponent } from '../Components/query-form/query-form.component';
import { NearbyEquipmentComponent } from '../Components/nearby-equipment/nearby-equipment.component';
import { UserManualComponent } from '../Components/user-manual/user-manual.component';
import { authGuard } from '../Services/auth.guard';

export const routes: Routes = [
    {
        path: '',

        component: CropComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'dashboard',
        canActivate:[authGuard],
        component: DashboardComponent
    },
    {
        path: 'crops/:id',
        component: ProductDetailsComponent
    },
    {
        path: 'crop/sell',
        component: SellCropComponent
    },
    { path: 'search', component: SearchComponent },
    {
        path:'query',
        canActivate:[authGuard],
        component : QueryFormComponent
    },
    {
        path:'find-equipment',
        component: NearbyEquipmentComponent
    },
    {
        path:'sell-crop',
        canActivate:[authGuard],
        component:SellCropComponent
    },
    {
        path:'user-manual',
        component:UserManualComponent
    }
];
