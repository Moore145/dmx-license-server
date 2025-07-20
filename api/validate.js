import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { license, device } = req.query;

  if (!license || !device) {
    res.status(400).json({ success: false, message: "Missing license or device parameter" });
    return;
  }

  const licensesPath = path.join(process.cwd(), "licenses.json");

  let licenses;

  try {
    const data = fs.readFileSync(licensesPath, "utf8");
    licenses = JSON.parse(data);
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not read licenses file" });
    return;
  }

  const lic = licenses.find(l => l.key === license);

  if (!lic) {
    res.json({ success: false, message: "License key not found" });
    return;
  }

  if (lic.device === null) {
    lic.device = device;
    fs.writeFileSync(licensesPath, JSON.stringify(licenses, null, 2));
    res.json({ success: true, message: "License is valid and assigned to this device" });
    return;
  }

  if (lic.device === device) {
    res.json({ success: true, message: "License is valid for this device" });
    return;
  }

  res.json({ success: false, message: "License key already used on another device" });
}
