export const SUPPORTED_DISTRICTS = [
  "Malappuram",
  "Kozhikode",
  "Kannur",
  "Kasaragod",
  "Wayanad",
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Bengaluru Urban",
  "Bangalore Division"
];

export const isDistrictSupported = (
  district: string | undefined | null,
): boolean => {
  if (!district) return false;
  return SUPPORTED_DISTRICTS.includes(district);
};
