
export interface CountryConfig {
  label: string;
  regionLabel: string;
  regions: {
    name: string;
    cities: string[];
  }[] | null;
}

export const locationData: Record<string, CountryConfig> = {
  "afghanistan": {
    label: "Afghanistan",
    regionLabel: "Province",
    regions: [
      { name: "Kabul", cities: ["Kabul"] },
      { name: "Herat", cities: ["Herat"] },
      { name: "Balkh", cities: ["Mazar-i-Sharif"] },
    ],
  },
  "argentina": {
    label: "Argentina",
    regionLabel: "Province",
    regions: [
      { name: "Buenos Aires", cities: ["Buenos Aires", "La Plata", "Mar del Plata"] },
      { name: "Córdoba", cities: ["Córdoba", "Río Cuarto"] },
      { name: "Santa Fe", cities: ["Rosario", "Santa Fe"] },
    ],
  },
  "australia": {
    label: "Australia",
    regionLabel: "State / Territory",
    regions: [
      { name: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong"] },
      { name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat"] },
      { name: "Queensland", cities: ["Brisbane", "Gold Coast", "Cairns"] },
      { name: "Western Australia", cities: ["Perth", "Fremantle", "Bunbury"] },
      { name: "South Australia", cities: ["Adelaide"] },
      { name: "Tasmania", cities: ["Hobart", "Launceston"] },
    ],
  },
  "bangladesh": {
    label: "Bangladesh",
    regionLabel: "Division",
    regions: [
        { name: "Dhaka", cities: ["Dhaka", "Gazipur", "Narayanganj"] },
        { name: "Chittagong", cities: ["Chittagong", "Comilla", "Cox's Bazar"] },
        { name: "Khulna", cities: ["Khulna", "Jessore"] },
    ]
  },
  "brazil": {
    label: "Brazil",
    regionLabel: "State",
    regions: [
      { name: "São Paulo", cities: ["São Paulo", "Guarulhos", "Campinas"] },
      { name: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói", "Duque de Caxias"] },
      { name: "Bahia", cities: ["Salvador", "Feira de Santana"] },
      { name: "Minas Gerais", cities: ["Belo Horizonte", "Uberlândia"] },
    ],
  },
  "canada": {
    label: "Canada",
    regionLabel: "Province / Territory",
    regions: [
      { name: "Ontario", cities: ["Toronto", "Ottawa", "Mississauga", "Hamilton"] },
      { name: "Quebec", cities: ["Montreal", "Quebec City", "Laval"] },
      { name: "British Columbia", cities: ["Vancouver", "Victoria", "Surrey"] },
      { name: "Alberta", cities: ["Calgary", "Edmonton"] },
    ],
  },
  "china": {
    label: "China",
    regionLabel: "Province / Municipality",
    regions: [
      { name: "Beijing", cities: ["Beijing"] },
      { name: "Shanghai", cities: ["Shanghai"] },
      { name: "Guangdong", cities: ["Guangzhou", "Shenzhen", "Dongguan"] },
      { name: "Zhejiang", cities: ["Hangzhou", "Ningbo", "Wenzhou"] },
    ],
  },
  "egypt": {
    label: "Egypt",
    regionLabel: "Governorate",
    regions: [
        { name: "Cairo", cities: ["Cairo"] },
        { name: "Alexandria", cities: ["Alexandria"] },
        { name: "Giza", cities: ["Giza"] },
    ]
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
  "germany": {
    label: "Germany",
    regionLabel: "State",
    regions: [
      { name: "Berlin", cities: ["Berlin"] },
      { name: "Bavaria", cities: ["Munich", "Nuremberg"] },
      { name: "Hamburg", cities: ["Hamburg"] },
      { name: "North Rhine-Westphalia", cities: ["Cologne", "Düsseldorf", "Dortmund"] },
    ],
  },
  "india": {
    label: "India",
    regionLabel: "State",
    regions: [
      { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati"] },
      { name: "Delhi", cities: ["New Delhi", "Delhi"] },
      { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
      { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru"] },
      { name: "Kerala", cities: ["Kochi", "Thiruvananthapuram", "Kozhikode"] },
      { name: "Madhya Pradesh", cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior"] },
      { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"] },
      { name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota"] },
      { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"] },
      { name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad"] },
      { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut"] },
      { name: "West Bengal", cities: ["Kolkata", "Asansol", "Siliguri", "Durgapur"] },
    ],
  },
  "indonesia": {
    label: "Indonesia",
    regionLabel: "Province",
    regions: [
        { name: "Jakarta", cities: ["Jakarta"] },
        { name: "West Java", cities: ["Bandung", "Bekasi", "Depok"] },
        { name: "East Java", cities: ["Surabaya", "Malang"] },
    ]
  },
  "italy": {
    label: "Italy",
    regionLabel: "Region",
    regions: [
      { name: "Lazio", cities: ["Rome"] },
      { name: "Lombardy", cities: ["Milan", "Brescia"] },
      { name: "Campania", cities: ["Naples"] },
    ],
  },
  "japan": {
    label: "Japan",
    regionLabel: "Prefecture",
    regions: [
      { name: "Tokyo", cities: ["Tokyo"] },
      { name: "Kanagawa", cities: ["Yokohama", "Kawasaki"] },
      { name: "Osaka", cities: ["Osaka", "Sakai"] },
      { name: "Aichi", cities: ["Nagoya"] },
    ],
  },
  "mexico": {
    label: "Mexico",
    regionLabel: "State",
    regions: [
      { name: "Mexico City", cities: ["Mexico City"] },
      { name: "Jalisco", cities: ["Guadalajara"] },
      { name: "Nuevo León", cities: ["Monterrey"] },
    ],
  },
  "nigeria": {
    label: "Nigeria",
    regionLabel: "State",
    regions: [
      { name: "Lagos", cities: ["Lagos", "Ikeja"] },
      { name: "Kano", cities: ["Kano"] },
      { name: "Rivers", cities: ["Port Harcourt"] },
      { name: "FCT", cities: ["Abuja"] },
    ],
  },
  "pakistan": {
    label: "Pakistan",
    regionLabel: "Province",
    regions: [
        { name: "Sindh", cities: ["Karachi", "Hyderabad"] },
        { name: "Punjab", cities: ["Lahore", "Faisalabad", "Rawalpindi"] },
        { name: "Khyber Pakhtunkhwa", cities: ["Peshawar"] },
    ]
  },
  "philippines": {
    label: "Philippines",
    regionLabel: "Region",
    regions: [
        { name: "National Capital Region", cities: ["Manila", "Quezon City", "Makati"] },
        { name: "Calabarzon", cities: ["Cavite", "Laguna", "Batangas"] },
        { name: "Central Visayas", cities: ["Cebu City", "Mandaue"] },
    ]
  },
  "russia": {
    label: "Russia",
    regionLabel: "Federal Subject",
    regions: [
      { name: "Moscow", cities: ["Moscow"] },
      { name: "Saint Petersburg", cities: ["Saint Petersburg"] },
      { name: "Novosibirsk Oblast", cities: ["Novosibirsk"] },
    ],
  },
  "saudi-arabia": {
    label: "Saudi Arabia",
    regionLabel: "Province",
    regions: [
      { name: "Riyadh", cities: ["Riyadh"] },
      { name: "Makkah", cities: ["Jeddah", "Mecca"] },
      { name: "Eastern Province", cities: ["Dammam", "Khobar"] },
    ],
  },
  "singapore": {
    label: "Singapore",
    regionLabel: "Region",
    regions: null,
  },
  "south-africa": {
    label: "South Africa",
    regionLabel: "Province",
    regions: [
      { name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Soweto"] },
      { name: "Western Cape", cities: ["Cape Town", "Stellenbosch"] },
      { name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg"] },
    ],
  },
  "south-korea": {
    label: "South Korea",
    regionLabel: "Province / Special City",
    regions: [
      { name: "Seoul", cities: ["Seoul"] },
      { name: "Busan", cities: ["Busan"] },
      { name: "Incheon", cities: ["Incheon"] },
    ],
  },
  "spain": {
    label: "Spain",
    regionLabel: "Autonomous Community",
    regions: [
      { name: "Community of Madrid", cities: ["Madrid"] },
      { name: "Catalonia", cities: ["Barcelona"] },
      { name: "Andalusia", cities: ["Seville", "Málaga"] },
    ],
  },
  "thailand": {
    label: "Thailand",
    regionLabel: "Province",
    regions: [
        { name: "Bangkok", cities: ["Bangkok"] },
        { name: "Chiang Mai", cities: ["Chiang Mai"] },
        { name: "Phuket", cities: ["Phuket"] },
    ]
  },
  "turkey": {
    label: "Turkey",
    regionLabel: "Province",
    regions: [
      { name: "Istanbul", cities: ["Istanbul"] },
      { name: "Ankara", cities: ["Ankara"] },
      { name: "İzmir", cities: ["İzmir"] },
    ],
  },
  "united-arab-emirates": {
    label: "United Arab Emirates",
    regionLabel: "Emirate",
    regions: [
      { name: "Dubai", cities: ["Dubai"] },
      { name: "Abu Dhabi", cities: ["Abu Dhabi", "Al Ain"] },
      { name: "Sharjah", cities: ["Sharjah"] },
    ],
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
  "united-states": {
    label: "United States",
    regionLabel: "State",
    regions: [
      { name: "California", cities: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento"] },
      { name: "Texas", cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso"] },
      { name: "Florida", cities: ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg"] },
      { name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"] },
      { name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie"] },
      { name: "Illinois", cities: ["Chicago", "Aurora", "Joliet", "Naperville"] },
      { name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"] },
      { name: "Georgia", cities: ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah"] },
      { name: "North Carolina", cities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"] },
      { name: "Michigan", cities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights"] },
    ],
  },
  "vietnam": {
    label: "Vietnam",
    regionLabel: "Province",
    regions: [
      { name: "Ho Chi Minh City", cities: ["Ho Chi Minh City"] },
      { name: "Hanoi", cities: ["Hanoi"] },
      { name: "Da Nang", cities: ["Da Nang"] },
    ]
  },
  "default": {
    label: "Other",
    regionLabel: "State / Province / Region",
    regions: null,
  }
};
