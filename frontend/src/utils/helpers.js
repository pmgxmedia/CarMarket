export const formatDistanceToNow = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return new Date(date).toLocaleDateString()
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const getStatusColor = (status, isDark = false) => {
  const colors = {
    draft: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
    published: isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
    bidding: isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
    inspection_phase: isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
    final_bidding: isDark ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800',
    winner_selected: isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
    completed: isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
    closed: isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
    pending: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800',
    document_pending: isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
    photo_pending: isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
  }
  return colors[status] || (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
}

export const getStatusLabel = (status) => {
  const labels = {
    draft: 'Draft',
    published: 'Published',
    bidding: 'Bidding',
    inspection_phase: 'Inspection Phase',
    final_bidding: 'Final Bidding',
    winner_selected: 'Winner Selected',
    completed: 'Completed',
    closed: 'Closed',
    pending: 'Pending',
    document_pending: 'Awaiting Document',
    photo_pending: 'Awaiting Photo'
  }
  return labels[status] || status
}

export const southAfricanProvinces = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
]

export const saCities = {
  'Gauteng': ['Johannesburg', 'Pretoria', 'Centurion', 'Soweto', 'Sandton', 'Midrand', 'Roodepoort', 'Alberton', 'Benoni', 'Kempton Park'],
  'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Worcester', 'Durbanville', 'Bellville', 'Kuils River'],
  'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Umhlanga', 'Ballito', 'Port Shepstone'],
  'Eastern Cape': ['Port Elizabeth', 'East London', 'Makhanda', 'Graaff-Reinet'],
  'Free State': ['Bloemfontein', 'Welkom', 'Sasolburg', 'Bethlehem'],
  'Mpumalanga': ['Nelspruit', 'Witbank', 'Secunda', 'Middleburg'],
  'Limpopo': ['Polokwane', 'Thabazimbi', 'Mokopane', 'Louis Trichardt'],
  'North West': ['Rustenburg', 'Klerksdorp', 'Potchefstroom', 'Mahikeng'],
  'Northern Cape': ['Kimberley', 'Upington', 'Springs']
}

export const vehicleMakes = {
  car: [
    'Volkswagen', 'Toyota', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai', 'Kia', 'Mazda',
    'Honda', 'Suzuki', 'Renault', 'Opel', 'Chevrolet', 'Jeep', 'Land Rover', 'Porsche', 'Volvo', 'Mini',
    'Fiat', 'Citroen', 'Peugeot', 'Mitsubishi', 'Isuzu', 'Datsun', 'Haval', 'Chery', 'Renault', 'Other'
  ],
  bike: [
    'Honda', 'Yamaha', 'Suzuki', 'KTM', 'Harley-Davidson', 'BMW', 'Ducati', 'Kawasaki', 'Triumph',
    'Harley-Davidson', 'Aprilia', 'MV Agusta', 'Benelli', 'CFMoto', 'Royal Enfield', 'Bajaj', 'TVS', 'Other'
  ],
  commercial: [
    'Toyota', 'Ford', 'Nissan', 'Isuzu', 'Volkswagen', 'Mercedes-Benz', 'Renault', 'Fiat', 'Hyundai',
    'Mahindra', 'Tata', 'Ashok Leyland', 'Scania', 'MAN', 'DAF', 'Volvo', 'Other'
  ]
}

export const carModels = {
  'Volkswagen': ['Polo', 'Polo Vivo', 'Golf', 'Tiguan', 'T-Cross', 'Amarok', 'Touareg', 'Arteon', 'T-Roc', 'Caddy'],
  'Toyota': ['Corolla', 'Fortuner', 'Hilux', 'RAV4', 'Land Cruiser', 'Starlet', 'Yaris', 'Corolla Cross', 'Probox', 'Rush'],
  'Ford': ['Ranger', 'Everest', 'Fiesta', 'Focus', 'Figo', 'EcoSport', 'Territory', 'Mustang', 'Puma', 'Tourneo'],
  'BMW': ['1 Series', '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'M3', 'M4', 'i3', 'iX3'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'CLA', 'CLS', 'AMG GT'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  'Nissan': ['Navara', 'NP200', 'NP300', 'X-Trail', 'Qashqai', 'Patrol', 'Navara', 'Magnite', 'Kicks', 'Leaf'],
  'Hyundai': ['i10', 'i20', 'i30', 'Creta', 'Venue', 'Tucson', 'Santa Fe', 'Kona', 'Grand Creta', 'Exter'],
  'Kia': ['Picanto', 'Rio', 'Sportage', 'Seltos', 'Sorento', 'Sonet', 'Carnival', 'Pegas', 'Stonic', 'EV6'],
  'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-30', 'CX-9', 'MX-5'],
  'Honda': ['Fit', 'HR-V', 'CR-V', 'Civic', 'City', 'Ballade', 'BR-V', 'HR-V', 'Amaze'],
  'Suzuki': ['Swift', 'Baleno', 'Vitara', 'Jimny', 'S-Presso', 'Dzire', 'Ertiga', 'Ciaz', 'XL7', ' Fronx'],
  'Renault': ['Kwid', 'Triber', 'Kiger', 'Duster', 'Captur', 'Clio', 'Megane', 'Sandero', 'Dokker'],
  'Opel': ['Corsa', 'Astra', 'Crossland', 'Grandland', 'Mokka', 'Combo', 'Vivaro'],
  'Chevrolet': ['Spark', 'Joy', 'Trailblazer', 'Equinox', 'Tahoe', 'Silverado', 'Colorado'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator'],
  'Land Rover': ['Defender', 'Discovery', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover', 'Defender 90', 'Defender 110'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Cayman', '718 Boxster'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40'],
  'Mini': ['Cooper', 'Cooper S', 'Clubman', 'Countryman', 'Electric', 'John Cooper Works'],
  'Fiat': ['Uno', 'Punto', '500', 'Panda', 'Tipo', 'Doblo', 'Ducato'],
  'Citroen': ['C1', 'C3', 'C4', 'C5', 'Berlingo', 'SpaceTourer', 'C3 Aircross'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'Partner', 'Rifter'],
  'Mitsubishi': ['ASX', 'Eclipse Cross', 'Outlander', 'Pajero', 'Triton', 'Xpander'],
  'Isuzu': ['D-Max', 'mu-X', 'N-Series', 'F-Series', 'E-Series'],
  'Datsun': ['Go', 'Go+', 'Redi-Go'],
  'Haval': ['H2', 'H6', 'H9', 'Jolion', 'Cannon', 'P-Series'],
  'Chery': ['Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5', 'Arrizo 6'],
  'Mini': ['Cooper', 'Cooper S', 'Clubman', 'Countryman', 'Electric', 'John Cooper Works'],
}

export const bikeModels = {
  'Honda': ['CBR500R', 'CB500F', 'PCX125', 'Africa Twin', 'Gold Wing', 'CB125F', 'CB750 Hornet'],
  'Yamaha': ['R15', 'MT-07', 'YZF-R7', 'Tenere 700', 'FZ-25', 'FZ-S', 'Ray-ZR', 'Aerox'],
  'Suzuki': ['Gixxer', 'Gixxer SF', 'V-Strom 650', 'Hayabusa', 'Burgman', 'DR-Z50', 'SV650'],
  'KTM': ['Duke 125', 'Duke 200', 'Duke 390', 'RC 390', 'Adventure 390', '1290 Super Duke'],
  'Harley-Davidson': ['Iron 883', 'Sportster S', 'Fat Boy', 'Street Glide', 'Road Glide', 'LiveWire'],
  'BMW': ['G310R', 'G310GS', 'F750GS', 'F850GS', 'S1000RR', 'S1000R', 'R1250GS', 'K1600'],
  'Ducati': ['Panigale V4', 'Monster', 'Scrambler', 'Multistrada', 'Diavel', 'Hypermotard'],
  'Kawasaki': ['Ninja ZX-10R', 'Ninja 400', 'Z650', 'Z900', 'Versys 650', 'Ninja H2'],
  'Triumph': ['Trident 660', 'Street Triple', 'Bonneville T120', 'Tiger 900', 'Rocket 3', 'Speed Triple'],
  'Bajaj': ['Pulsar 150', 'Pulsar NS200', 'Dominar 400', 'Avenger', 'Platina', 'CT 100'],
  'TVS': ['Apache RTR 160', 'Apache RR 310', 'Jupiter', 'NTORQ 125', 'Ronin', 'Apache 200'],
  'Royal Enfield': ['Classic 350', 'Hunter 350', 'Meteor 350', 'Himalayan 450', 'Interceptor 650', 'Continental GT 650'],
  'CFMoto': ['300NK', '700CL-X', '650NK', '250NK', 'SR21'],
  'Aprilia': ['RS 125', 'Tuono 660', 'RSV4', 'Tuono V4', 'SR 125'],
  'Benelli': ['Leoncino 500', 'TRK 502', '752S', 'Imperiale 400', 'TNT 135'],
  'MV Agusta': ['F3 675', 'F4', 'Brutale 800', 'Dragster 800', 'Turismo Veloce'],
}

export const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng']

export const bodyTypes = {
  car: ['Sedan', 'Hatchback', 'SUV', 'Crossover', 'Coupe', 'Convertible', 'Station Wagon', 'MPV', 'Double Cab', 'Single Cab', 'Bakkie'],
  bike: ['Sport', 'Naked', 'Cruiser', 'Touring', 'Adventure', 'Commuter', 'Scooter', 'Off-Road', 'Cafe Racer'],
  commercial: ['Panel Van', 'Minibus', 'Bus', 'Truck', 'Tipper', 'Flatbed', 'Refrigerated', 'Light Truck', 'Heavy Truck']
}

export const transmissions = ['manual', 'automatic', 'semi-auto']

export const categories = ['car', 'bike', 'commercial']

export const conditionOptions = ['Excellent', 'Good', 'Fair', 'Needs Work']

export const ownerCounts = ['1st Owner', '2nd Owner', '3rd Owner', '4th Owner', 'Fleet Managed']

export const colorOptions = [
  'White', 'Silver', 'Black', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 
  'Brown', 'Beige', 'Gold', 'Navy Blue', 'Burgundy', 'Maroon', 'Purple', 'Teal', 'Pearl White', 'Metallic'
]

export const cylinderCounts = ['2 Cylinder', '3 Cylinder', '4 Cylinder', '5 Cylinder', '6 Cylinder', '8 Cylinder', 'V10', 'V12', 'Electric Motor']
