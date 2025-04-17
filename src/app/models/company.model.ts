export interface Company {
  companyId:   number;
  companyName: string;     // <-- rename this
  industry:    string;
  companyEmail?: string;
  telephone1?:  string;
  telephone2?:  string;
  telephone3?:  string;
  telephone4?:  string;
}