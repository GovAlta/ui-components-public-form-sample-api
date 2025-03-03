import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  dateValidator,
  GoabCheckbox, GoabCheckboxOnChangeDetail, GoabFormItem, GoabInput,
  lengthValidator,
  requiredValidator,
} from "@abgov/angular-components";
import { NgFor, NgIf } from "@angular/common";
import { PublicFormController } from "@abgov/ui-components-common";

type Page =
  | "what-is-your-role"
  | "description"
  | "identification"
  | "payor-name"
  | "children-subform"
  | "address"
  | "summary";

type ChildPage = "name" | "alternate-name" | "dob" | "complete";

@Component({
  standalone: true,
  selector: "abgov-fsos",
  templateUrl: "./SupportOrderDetails.html",
  imports: [NgFor, NgIf, GoabCheckbox, GoabFormItem, GoabInput],
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupportOrderDetailsComponent implements OnInit {

  sinChecked= false
  ahcnChecked= false

  sinCheckChange(e: GoabCheckboxOnChangeDetail) {
    this.sinChecked = e.checked;
  }

  ahcnCheckChange(e: GoabCheckboxOnChangeDetail) {
    this.ahcnChecked = e.checked;
  }

  _childFormController: PublicFormController<ChildPage>;
  _mainFormController: PublicFormController<Page>

  continueButtonVisibility: "visible" | "hidden" = "hidden";
  showDeleteModal = false;
  formStatus: "initializing" | "complete" = "initializing";
  deleteIndex = -1;
  showSpinner = "true";

  children(): Record<string, string>[] {
    return this._childFormController.getStateList();
  }

  constructor(private router: Router) {
    this._mainFormController = new PublicFormController("details");
    this._childFormController = new PublicFormController("list");
  }

  ngOnInit(): void {
    (async () => {
      const req = await fetch("http://localhost:3000/pf/support-order-details", { mode: "cors" })
      const raw = await req.text();
      const item = (JSON.parse(raw) || {})
      this._mainFormController.initState(item?.data || {}, () => {
        this.formStatus = "complete";
        this.showSpinner = "false";
      });

      this.continueButtonVisibility = this.children().length > 0 ? "visible" : "hidden";
    })();
  }

  updateStateId: any;
  async updateState(e: Event) {
    console.log("updateState", e)
    clearTimeout(this.updateStateId);
    this.updateStateId = setTimeout(async () => {
      this._mainFormController.updateObjectState(e);
      this.continueButtonVisibility = this.children().length > 0 ? "visible" : "hidden";

      await fetch("http://localhost:3000/pf", {
        method: "PUT",
        body: JSON.stringify({
          name: "support-order-details",
          data: this._mainFormController.state,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }, 1000)
  }

  showModal(index: number) {
    this.showDeleteModal = true;
    this.deleteIndex = index;
  }

  updateChildrenState(e: Event) {
    this._childFormController.updateListState(e);
  }

  onComplete() {
    (async () => {
      await this.router.navigate(["/fsos"]);
    })();
  }

  onDeleteCancel() {
    this.showDeleteModal = false;
  }

  onDeleteConfirm() {
    this.showDeleteModal = false;
    this._childFormController.remove(this.deleteIndex);
  }

  onPageChange(e: Event, from: Page) {
    let dest: Page | undefined = undefined;
    switch (from) {
      case "what-is-your-role":
        dest = this.handleRole(e);
        break;
      case "description":
        dest = "identification";
        break;
      case "identification":
        dest = this.handleIdentification(e);
        break;
      case "payor-name":
        dest = this.handlePayorName(e);
        break;
      case "children-subform":
        // no validation required here
        dest = "address";
        break;
      case "address":
        dest = this.handleAddress(e);
        break;
      case "summary":
        break;
      default:
        console.warn("Unhandled page", from);
        break;
    }

    if (dest) {
      this._mainFormController.continueTo(dest);
    }
  }

  onChildPageChange(e: Event, from: ChildPage) {
    let dest: ChildPage | undefined = undefined;
    switch (from) {
      case "name":
        dest = this.handleChildrenNames(e);
        break;
      case "alternate-name":
        dest = this.handleChildrenAlternateName(e);
        break;
      case "dob":
        dest = this.handleChildDateOfBirth(e);
        break;
      default:
        console.warn("Unhandled page", from);
        break;
    }

    if (dest) {
      this._childFormController.continueTo(dest);
    }
  }

  // ===========
  // Validations
  // ===========

  handleRole(e: Event): Page | undefined {
    const [ok, value] = this._mainFormController.validate("role", e, [
      requiredValidator("Role is required"),
      lengthValidator({ min: 2 }),
    ]);
    if (!ok) {
      return;
    }

    if (value === "Payor") {
      return "payor-name";
    }

    return "description";
  }

  private handleIdentification(e: Event): Page | undefined {
    let ok = true;
    if (this.sinChecked) {
      const [sinOk ] = this._mainFormController.validate("sin", e, [
        requiredValidator("SIN is required"),
      ]);
      ok &&= sinOk;
    }
    if (this.ahcnChecked) {
      const [ahcnOk ] = this._mainFormController.validate("ahcn", e, [
        requiredValidator("AHCN is required"),
      ]);
      ok &&= ahcnOk;
    }

    if (!ok) {
      return;
    }
    return "children-subform";
  }

  handlePayorName(_: Event): Page | undefined {
    return "address";
  }

  handleAddress(e: Event): Page | undefined {
    const [cityOk] = this._mainFormController.validate("city", e, [requiredValidator()]);
    const [addressOk] = this._mainFormController.validate("address", e, [
      requiredValidator(),
    ]);
    const [postalCodeOk] = this._mainFormController.validate("postal-code", e, [
      requiredValidator(),
    ]);

    if (!cityOk || !addressOk || !postalCodeOk) {
      return;
    }

    return "summary";
  }

  // Children

  handleChildrenNames(e: Event): ChildPage | undefined {
    const [firstNameOk] = this._childFormController.validate("firstName", e, [
      requiredValidator(),
    ]);
    const [lastNameOk] = this._childFormController.validate("lastName", e, [
      requiredValidator(),
    ]);
    const [middleNameOk] = this._childFormController.validate("middleName", e, [
      lengthValidator({min: 2})
    ]);
    if (!firstNameOk || !lastNameOk || !middleNameOk) return;

    return "alternate-name";
  }
  handleChildrenAlternateName(e: Event): ChildPage | undefined {
    const [ok] = this._childFormController.validate("alternate-name", e, [
      lengthValidator({ min: 2 }),
    ]);
    if (!ok) return;

    return "dob";
  }

  handleChildDateOfBirth(e: Event): ChildPage | undefined {
    const adult = new Date();
    adult.setFullYear(adult.getFullYear() - 18);
    const [ok] = this._childFormController.validate("dob", e, [
      dateValidator({ min: adult, minMsg: "Child must be less that 18 years old" }),
    ]);

    if (!ok) return;

    return "complete";
  }

}
