import { CommonModule } from "@angular/common";

import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from "@angular/core";
import { fetchData, getBadgeType, getStatus, getValue } from "../utils/api";
import {FormState} from "../utils/types";

@Component({
  standalone: true,
  selector: "abgov-fsos",
  templateUrl: "./FSOS.html",
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FSOSComponent implements OnInit {
  state: "loading" | "complete" = "loading";
  cache: Record<string, unknown> = {};
  supportOrderDetails: FormState | undefined;
  otherPartyProfile: FormState | undefined;
  priorRegistrations: FormState | undefined;

  protected readonly getBadgeType = getBadgeType;
  protected readonly getStatus = getStatus;

  async ngOnInit() {
    this.supportOrderDetails = await fetchData("support-order-details");
    this.otherPartyProfile = await fetchData("other-party-profile");
    this.priorRegistrations = await fetchData("previous-registrations");
    this.state = "complete";
  }

  getHasChildSupport(): boolean {
    if (this.cache["hasChildSupport"] !== undefined) {
      return this.cache["hasChildSupport"] as boolean;
    }
    const val = getValue(this.supportOrderDetails, "do-you-receive-support", "support") === "Yes";
    this.cache["hasChildSupport"] = val;
    return val;
  }

  getUserRole(): string | null {
    if (this.cache["userRole"] !== undefined) {
      return this.cache["userRole"] as string;
    }
    const val = getValue(this.supportOrderDetails, "what-is-your-role", "role");
    this.cache["userRole"] = `${val}`.toLowerCase();
    return `${val}`;
  }

  getSupportOrderDetails() {
    if (this.supportOrderDetails) {
      return this.supportOrderDetails;
    }
    const val = this.supportOrderDetails?.["status"];
    this.cache["supportOrderDetails"] = val;
    return val;
  }
}
