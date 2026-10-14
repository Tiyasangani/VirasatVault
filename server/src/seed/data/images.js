// All photographs live here. Swap these URLs for Cloudinary / your own photos later;
// nothing else in the app needs to change. If a URL fails, <SmartImage> shows a tidy fallback.
const u = (id, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`

export const IMG = {
  palace: u('photo-1599661046289-e31897846e41'),
  palaceTwo: u('photo-1477587458883-47145ed94245'),
  fort: u('photo-1596402184320-417e7178b2cd'),
  stepwell: u('photo-1548013146-72479768bada'),
  temple: u('photo-1561361513-2d000a50f0dc'),
  templeTwo: u('photo-1609766857041-ed402ea8069a'),
  village: u('photo-1532375810709-75b1da00537c'),
  street: u('photo-1514222134-b57cbb8ce073'),
  festival: u('photo-1566552881560-0be862a7c445'),
  food: u('photo-1567188040759-fb8a883dc6d8'),
  craft: u('photo-1604871000636-074fa5117945'),
  dance: u('photo-1582510003544-4d00b7f74220'),
  monument: u('photo-1564507592333-c60657eea523'),
  monumentTwo: u('photo-1524492412937-b28074a5d7da'),
}
