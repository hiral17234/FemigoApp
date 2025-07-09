
export interface CountryConfig {
  label: string;
  regionLabel: string;
  regions: {
    name: string;
    cities: string[];
  }[] | null;
}

export const locationData: Record<string, CountryConfig> = {
  "india": {
    label: "India",
    regionLabel: "State",
    regions: [
      { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati"] },
      { name: "Delhi", cities: ["New Delhi", "Delhi"] },
      { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
      { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru"] },
      { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"] },
      { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"] },
      { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut"] },
      { name: "West Bengal", cities: ["Kolkata", "Asansol", "Siliguri", "Durgapur"] },
    ],
  },
  "united-states": {
    label: "United States",
    regionLabel: "State",
    regions: [
      { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"] },
      { name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Albany"] },
      { name: "Texas", cities: ["Houston", "San Antonio", "Dallas", "Austin"] },
      { name: "Florida", cities: ["Miami", "Orlando", "Tampa", "Jacksonville"] },
    ],
  },
  "france": {
    label: "France",
    regionLabel: "Region",
    regions: [
      { name: "Île-de-France", cities: ["Paris", "Versailles", "Saint-Denis", "Boulogne-Billancourt"] },
      { name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Cannes", "Toulon"] },
      { name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand"] },
    ],
  },
  "singapore": {
    label: "Singapore",
    regionLabel: "Region",
    regions: null, // Singapore is a city-state, no regions needed
  },
  "united-kingdom": {
    label: "United Kingdom",
    regionLabel: "Country",
    regions: [
        { name: "England", cities: ["London", "Manchester", "Birmingham", "Liverpool"] },
        { name: "Scotland", cities: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"] },
        { name: "Wales", cities: ["Cardiff", "Swansea", "Newport", "Bangor"] },
        { name: "Northern Ireland", cities: ["Belfast", "Derry", "Lisburn", "Newry"] },
    ]
  },
  "default": {
    label: "Other",
    regionLabel: "State / Province / Region",
    regions: null,
  }
};
