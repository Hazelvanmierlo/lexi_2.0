export type FormState = {
  name: string;
  email: string;
  password: string;
  kidName: string;
  kidYear: string;
  kidGroep: string;
  subjects: { rekenen: boolean; taal: boolean; lezen: boolean; wereld: boolean; engels: boolean };
  plan: "monthly" | "yearly";
  consent: boolean;
};

export const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  kidName: "",
  kidYear: "",
  kidGroep: "",
  subjects: { rekenen: true, taal: true, lezen: true, wereld: true, engels: true },
  plan: "monthly",
  consent: false,
};
