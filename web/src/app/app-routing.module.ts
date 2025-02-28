import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";


import { RouterModule, Routes } from "@angular/router";
import { ApplicationComponent } from "../routes/ApplicationComponent";
import { FamilyServicesComponent } from "../routes/FamilyServicesComponent";
import { FSOSComponent } from "../routes/FSOS";
import { SupportOrderDetailsComponent } from "../routes/SupportOrderDetails";

const routes: Routes = [
  { path: "", component: FSOSComponent },
  { path: "example", component: ApplicationComponent },
  { path: "family-services", component: FamilyServicesComponent },
  { path: "support-order-details", component: SupportOrderDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppRoutingModule {}
