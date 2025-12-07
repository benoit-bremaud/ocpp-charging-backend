/**
 * OCPP 1.6 Edition 2 - FirmwareStatus
 * Firmware status
 *
 * @enum {string}
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export enum FirmwareStatus {
  Downloaded = 'Downloaded',
  DownloadFailed = 'DownloadFailed',
  Downloading = 'Downloading',
  Idle = 'Idle',
  Installed = 'Installed',
  InstallationFailed = 'InstallationFailed',
  Installing = 'Installing',
}
