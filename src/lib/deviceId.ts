export function getDeviceId(): string {
  let deviceId = localStorage.getItem("app_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("app_device_id", deviceId);
  }
  return deviceId;
}
