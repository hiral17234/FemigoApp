
import { Siren, Hospital, Flame, ShieldCheck, Phone } from 'lucide-react';

export type EmergencyService = {
  name: string;
  number: string;
  icon: React.ElementType;
};

// A mapping of country codes to their specific emergency services.
// This can be easily expanded with more countries or more service types (e.g., embassy).
export const emergencyContacts: { [countryCode: string]: EmergencyService[] } = {
  default: [
    { name: 'Emergency', number: '112', icon: Siren },
    { name: 'Ambulance', number: '112', icon: Hospital },
    { name: 'Fire Brigade', number: '112', icon: Flame },
  ],
  india: [
    { name: 'Police', number: '100', icon: Siren },
    { name: 'Ambulance', number: '108', icon: Hospital },
    { name: 'Fire Brigade', number: '101', icon: Flame },
    { name: 'Women Helpline', number: '1091', icon: ShieldCheck },
  ],
  'united-states': [
    { name: 'Emergency', number: '911', icon: Siren },
    { name: 'National Domestic Violence Hotline', number: '1-800-799-7233', icon: ShieldCheck },
    { name: 'National Suicide Prevention Lifeline', number: '988', icon: Phone },
  ],
  'united-kingdom': [
    { name: 'Emergency', number: '999', icon: Siren },
    { name: 'National Domestic Abuse Helpline', number: '0808-2000-247', icon: ShieldCheck },
    { name: 'Samaritans', number: '116123', icon: Phone },
  ],
  canada: [
    { name: 'Emergency', number: '911', icon: Siren },
    { name: 'Assaulted Women’s Helpline', number: '1-866-863-0511', icon: ShieldCheck },
    { name: 'Kids Help Phone', number: '1-800-668-6868', icon: Phone },
  ],
  australia: [
    { name: 'Emergency', number: '000', icon: Siren },
    { name: '1800RESPECT', number: '1800-737-732', icon: ShieldCheck },
    { name: 'Lifeline Australia', number: '131114', icon: Phone },
  ],
};
