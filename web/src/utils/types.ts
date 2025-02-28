export type FormStatus = "not-started" | "in-progress" | "submitted" | "changes-requested" | "complete";

export type FormState = {
    uuid: string;
    form: Record<string, Fieldset>;
    history: string[];
    editting: string;
    lastModified?: Date;
    status: FormStatus;
};

export type Fieldset = {
    heading?: string;
    data?: FieldsetData;
};

export type FieldsetData =
    | { type: "details"; fieldsets: Record<string, FieldsetItemState> }
    | { type: "list"; items: FormState[] }; // TODO: rename `items` to `form`

export type FieldsetItemState = {
    name: string;
    label: string;
    value: string | number | Date;
    order: number;
};
