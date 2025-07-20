import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Only POST allowed' });
  }

  const { licenseKey, deviceId } = req.body;

  if (!licenseKey || !deviceId) {
    return res.status(400).json({ success: false, message: 'Missing license key or device ID' });
  }

  const filePath = path.join(process.cwd(), 'licenses.json');
  const licenses = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const matched = licenses.find((entry) => entry.key === licenseKey);

  if (!matched) {
    return res.status(403).json({ success: false, message: 'Invalid license key' });
  }

  if (matched.device && matched.device !== deviceId) {
    return res.status(403).json({ success: false, message: 'License already used on another device' });
  }

  // Optional: Save device ID if not yet used
  if (!matched.device) {
    matched.device = deviceId;
    fs.writeFileSync(filePath, JSON.stringify(licenses, null, 2));
  }

  return res.status(200).json({ success: true, message: 'License valid and device matched' });
}
