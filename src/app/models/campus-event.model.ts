export interface CampusEvent {
    eventId:    number;
    admin:      { adminId: number };
    title:      string;
    description: string;
    date:       string;        // ISO yyyy‑MM‑dd
    location:   string;
    companies:  Company[];
    sponsors:   Sponsor[];
  }
  
  export interface Company {
    companyId: number;
    name:      string;
  }
  
  export interface Sponsor {
    sponsorId: number;
    name:      string;
  }
  