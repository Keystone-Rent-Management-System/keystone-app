export default function formatPhone(phone: string): string {
  // Check if the phone number starts with 2547 or 2541
  if (/^2547\d{8}$/.test(phone) || /^2541\d{8}$/.test(phone)) {
    // Replace 254 with 0
    return phone.replace(/^254/, '0');
  }

  // Check if the phone number starts with 07 or 01
  if (/^07\d{8}$/.test(phone) || /^01\d{8}$/.test(phone)) {
    // Return the phone number as is
    return phone;
  }

  // If the phone number does not match any of the allowed formats, return an empty string or handle it as needed
  throw new Error('Invalid phone number');
}
